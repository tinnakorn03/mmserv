import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Alert, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { getToken, clearToken } from '../utils/authUtils'; 
import { RootStackParamList } from '../type';

type DockerLogScreenProps = {
  route: RouteProp<RootStackParamList, 'DockerLogScreen'>;
};
 
const DockerLogScreen: React.FC<DockerLogScreenProps> = ({ route }) => {
    const [logData, setLogData] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const { dockerId } = route.params;

    const fetchLogData = async () => {
    try {
      const url = `https://hubapi-manage-serv.hubexpress.co/get_docker_logs?docker_id=${dockerId}`;
      const userToken = await getToken();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const { docker_id , docker_logs } = result.data;
      
      setLogData(docker_logs);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch log data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogData();
  }, []);

  return (
    <View style={styles.fullScreen}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{'_<'}</Text> 
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.logText}>{logData}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 50, // Adjust based on your screen's status bar height
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight:'700',
    // top:-2, 
  },
  scrollView: {
    marginHorizontal: 20,
  },
  logText: {
    color: 'white',
    fontSize: 11,
    lineHeight: 18,
  },
});

export default DockerLogScreen;
