import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (e) {
    // saving error
    console.error('Error storing the auth token', e);
  }
};

export const setTokenStorage = async ({access_token}:any) => {
  try { 
    await AsyncStorage.setItem('userToken', access_token);
    
  } catch (e) {
    // error reading value
    console.error('Error reading the auth token', e);
  }
  return null;
};

export const getToken = async () => {
  try {
    const value = await AsyncStorage.getItem('userToken');
    if (value !== null) {
      // value previously stored
      return value;
    }
  } catch (e) {
    // error reading value
    console.error('Error reading the auth token', e);
  }
  return null;
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    console.log('Auth token cleared');
  } catch (e) {
    console.error('Error clearing the auth token', e);
  }
};