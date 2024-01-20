// LoginScreen.tsx
import React, { useState } from 'react';
import {Text,  View, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios'; 
import { getToken, setTokenStorage, clearToken } from '../utils/authUtils';
import { useNavigation } from '@react-navigation/native';
import { setToken , selectToken, clearTokenRedux} from '../store/authSlice'; 
import store from '../store/store'; 

interface IProps {
  
}
const LoginScreen: React.FC<IProps> = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('hub@pass4321!');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try { 
      const response = await axios.post('https://hubapi-manage-serv.hubexpress.co/token', {
        username,
        password,
      });
      const { access_token } = response.data;
      await setTokenStorage({access_token})    
      store.dispatch(setToken(access_token)); 
    } catch (error) {
      Alert.alert('Login failed', 'Invalid credentials');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.containerbtn}> 
          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text children="Login" />
          </TouchableOpacity>
        </View>
      </View>
    </>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 15,
    borderColor:'gray'
  },
  containerbtn:{ 
    flexDirection:'row',
    justifyContent:'center',
    alignItems: 'center',
  },
  btn: {
    paddingVertical: 10, 
    paddingHorizontal: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 255, 0, 0.5)', 

  },
});

export default LoginScreen;
