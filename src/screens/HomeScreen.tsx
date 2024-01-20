import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, Modal, View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { getToken, clearToken } from '../utils/authUtils';
import { useNavigation } from '@react-navigation/native';
import { setToken , selectToken, selectRole, clearTokenRedux } from '../store/authSlice';
import store from '../store/store';
import CustomAlert from './Modal/CustomAlert'; 
import CardDocker from '../components/CardDocker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../type';
import { useSelector } from 'react-redux';  

const screenHeight = Dimensions.get('window').height; 


interface SystemInfo {
  disk_usage: {
    free: string;
    usage_percent: string;
    used: string;
  };
  memory_usage: {
    buff_cache: string;
    free: string;
    used: string;
  };
} 

interface IService {
  docker_id: string;
  docker_image: string;
  name: string;
  port: string;
}
interface DockerInfo {
  alive: {
    count: number;
    service: IService[];
  };
  nolife: {
    count: number;
    service: IService[];
  };
}

interface IProps {
  
}
 
const HomeScreen: React.FC<IProps> = ({}) => {

  const role = useSelector(selectRole);

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null);
  const [isAliveOpen, setIsAliveOpen] = useState(false);
  const [isNolifeOpen, setIsNolifeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleLogOut = async () => {
    await clearToken(); // Assuming clearToken clears the user's session
    store.dispatch(clearTokenRedux()); // Clear token in redux store
    navigation.navigate('Main'); // Navigate to LoginScreen
  };

  const fetchData = async (url: string) => {
    try {
      const userToken = await getToken();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) { 
        store.dispatch(clearTokenRedux());
        await clearToken()
        return null;
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch data.');
      return null;
    }
  };

  const fetchAllInfo = async () => { 
    const systemData = await fetchData('https://hubapi-manage-serv.hubexpress.co/system_info');
    if (systemData) {
      setSystemInfo(systemData.data);
    }

    const dockerData = await fetchData('https://hubapi-manage-serv.hubexpress.co/docker_status');
    if (dockerData) {
      setDockerInfo(dockerData.data);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Call your data fetching logic
    await fetchAllInfo();
    setRefreshing(false);
  }, []);

  const handleClear = React.useCallback(async () => {
    // return setAlertVisible(true);
    if((dockerInfo?.nolife?.count || 0) > 0) { 
      setAlertMessage(`มี Service บางตัวไม่ทำงาน \n ต้องดำเนินการ Start service ก่อน`);
      setAlertVisible(true);
      return ;
    }
    setIsLoading(true);
    try {
      const userToken = await getToken();
      const response = await fetch('https://hubapi-manage-serv.hubexpress.co/clear_system_resources', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (response.ok) {
        const result = await response.json();
        const { clear_cache_result, docker_prune_result } = result.data;
        
        setAlertMessage(`Clear Cache Result: ${clear_cache_result}\nDocker Prune Result: ${docker_prune_result}`);
        setAlertVisible(true);
      } else { 
        Alert.alert('Error', 'Failed to clear system resources.');
      }
    } catch (error) {
      // Handle any exceptions (e.g., network error)
      Alert.alert('Error', 'An error occurred while clearing system resources.');
    }
    setIsLoading(false); // Stop loading
  }, [dockerInfo]);
  
  useEffect(() => {  
    fetchAllInfo();
  }, [navigation]);

  const handleDockerAction =  React.useCallback( async (service:IService, action:string) => {
    if (action === 'restart') {
      const userToken = await getToken();
      const response = await fetch(`https://hubapi-manage-serv.hubexpress.co/restart_docker?docker_id=${service.docker_id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }); 

      if (response.ok) {
        const data = await response.json(); // Parse the JSON response body
        Alert.alert('Message', data.message); 
      } else { 
        Alert.alert('Error', 'Failed to restart container.');
      }
      
    } else if (action === 'log') {
      navigation.navigate('DockerLogScreen', { dockerId: service.docker_id }); 
    }
  },[]);
   
  return (
    <ScrollView style={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
       {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
       <View style={styles.container}>
        {systemInfo && (
          <>
            <View style={styles.card}> 
              <Text style={{fontWeight:'900',alignSelf:'center', paddingVertical:5}} children={'Disk Usage'}/>
              <Text><Text style={{fontWeight:'bold'}} children={'Free:'}/>  <Text style={{color:'green'}} children={systemInfo.disk_usage.free}/></Text>
              <Text><Text style={{fontWeight:'bold'}} children={'Used:'}/>  <Text style={{color:'blue'}} children={systemInfo.disk_usage.used}/></Text>
              <Text><Text style={{fontWeight:'bold'}} children={'Usage Percent:'}/>  <Text style={{color:'red'}} children={systemInfo.disk_usage.usage_percent}/></Text>
            </View>
            <View style={styles.card}> 
              <Text style={{fontWeight:'900', alignSelf:'center', paddingVertical:5}} children={'Memory Usage'}/>
              <Text><Text style={{fontWeight:'bold'}} children={'Free:'}/> <Text style={{color:'green'}} children={systemInfo.memory_usage.free}/></Text>
              <Text><Text style={{fontWeight:'bold'}} children={'Used:'}/> <Text style={{color:'blue'}} children={systemInfo.memory_usage.used}/></Text>
              <Text><Text style={{fontWeight:'bold'}} children={'Buff Cache:'}/> <Text style={{color:'red'}} children={systemInfo.memory_usage.buff_cache}/></Text>
            </View>
          </>
        )}

      
        <TouchableOpacity style={styles.card_btn} onPress={handleClear}>
          <Text style={{color:'white', fontWeight:'700'}}>Clear Temp</Text>
        </TouchableOpacity>
        {role=='admin' && (
          <TouchableOpacity style={styles.card_btn_cmd} onPress={()=> navigation.navigate('CommandScreen')}>
            <Text style={{color:'green', fontWeight:'700'}}>Cmd</Text>
          </TouchableOpacity>
        )}
      </View>
      <View>
        <TouchableOpacity  style={styles.card_title}  onPress={() => setIsAliveOpen(!isAliveOpen)}>
          <Text>Docker alive:</Text>
          <Text>count: {dockerInfo?.alive?.count}</Text>
        </TouchableOpacity> 
        {isAliveOpen &&
         dockerInfo?.alive?.service?.map((service, index) => <CardDocker key={index} 
          onPress={() => Alert.alert(
            `Docker ID: ${service.docker_id}`,
            'Choose an action',
            [
              {text: 'Restart Now', onPress: () => handleDockerAction(service, 'restart')},
              {text: 'Open Log', onPress: () => handleDockerAction(service, 'log')},
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: true }
          )} style={styles.card_docker_alive}  service={service} /> )}
      </View>
      <View> 
        <TouchableOpacity style={styles.card_title}  onPress={() => setIsNolifeOpen(!isNolifeOpen)}>
          <Text>Docker nolife:</Text>
          <Text>count: {dockerInfo?.nolife?.count}</Text>
        </TouchableOpacity> 
        {isNolifeOpen &&
          dockerInfo?.nolife?.service?.map((service, index) => <CardDocker key={index} 
          onPress={() => Alert.alert(
            `Docker ID: ${service.docker_id}`,
            'Choose an action',
            [
              {text: 'Restart Now', onPress: () => handleDockerAction(service, 'restart')},
              {text: 'Open Log', onPress: () => handleDockerAction(service, 'log')},
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: true }
          )} style={styles.card_docker_nolife}  service={service} />)}
      </View>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
       <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingTop: 10
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjust as needed
    alignItems: 'center', // Align items vertically if needed
  },
  card: {
    width: '45%',
    margin: 5,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255,255, 0.5)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 5,
  },
  card_docker_alive:{
    marginHorizontal: 5,
    marginVertical: 1,
    borderRadius:5,
    padding: 20, 
    backgroundColor: 'rgba(0, 255, 0, 0.2)', // Red background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card_docker_nolife:{
    marginHorizontal: 5,
    marginVertical: 1,
    borderRadius:5,
    padding: 20, 
    backgroundColor: 'rgba(255, 0, 0, 0.2)', // Red background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card_btn:{
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 255, 140, 0.7)', // Red background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  card_btn_cmd:{
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(230, 255, 190, 0.8)', // Red background color
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  card_title:{
    margin: 5,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 165, 0, 0.5)', // Red background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 15,
    backgroundColor: 'black', // Black background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;
