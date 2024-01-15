import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, Modal, View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { getToken, clearToken } from '../utils/authUtils';
import { useNavigation } from '@react-navigation/native';
import { setToken , selectToken, clearTokenRedux } from '../store/authSlice';
import store from '../store/store';
import CustomAlert from './Modal/CustomAlert'; 
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

interface DockerInfo {
  alive: {
    count: number;
    service: {
      docker_id: string;
      docker_image: string;
      name: string;
      port: string;
    }[];
  };
  nolife: {
    count: number;
    service: {
      docker_id: string;
      docker_image: string;
      name: string;
      port: string;
    }[];
  };
}

interface IProps {
  
}
 
const HomeScreen: React.FC<IProps> = ({}) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null);
  const [isAliveOpen, setIsAliveOpen] = useState(false);
  const [isNolifeOpen, setIsNolifeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);


  const navigation = useNavigation();
 
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
        // Handle non-successful response (e.g., show an error message)
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


  return (
    <ScrollView refreshControl={
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
          <Text>Clear Temp</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity  style={styles.card_title}  onPress={() => setIsAliveOpen(!isAliveOpen)}>
          <Text>Docker alive:</Text>
          <Text>count: {dockerInfo?.alive?.count}</Text>
        </TouchableOpacity> 
        {isAliveOpen &&
         dockerInfo?.alive?.service?.map((service, index) => (
          <View key={index} style={styles.card_docker_alive}>
            <Text><Text style={{fontWeight:'bold'}} children={'Name:'}/> {service.name}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker ID:'}/> {service.docker_id}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker Image:'}/> {service.docker_image}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Port:'}/> {service.port}</Text>
          </View>
        ))}
      </View>
      <View> 
        <TouchableOpacity style={styles.card_title}  onPress={() => setIsNolifeOpen(!isNolifeOpen)}>
          <Text>Docker nolife:</Text>
          <Text>count: {dockerInfo?.nolife?.count}</Text>
        </TouchableOpacity> 
        {isNolifeOpen &&
          dockerInfo?.nolife?.service?.map((service, index) => (
          <View key={index} style={styles.card_docker_nolife}>
            <Text><Text style={{fontWeight:'bold'}} children={'Name:'}/> {service.name}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker ID:'}/> {service.docker_id}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker Image:'}/> {service.docker_image}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Port:'}/> {service.port}</Text>
          </View>
        ))}
      </View>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
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
    backgroundColor: 'rgba(0, 255, 0, 0.7)', // Red background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  }
});

export default HomeScreen;
