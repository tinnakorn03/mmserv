import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectToken } from './store/authSlice';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { getToken, clearToken } from './utils/authUtils';

const MainComponent = () => { 
  const token = useSelector(selectToken);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    (async () =>{
        const userToken = await getToken();
        if (userToken) {
          setIsTokenValid(true) 
          console.log("Navigating to Home screen"); 
        }else{
            setIsTokenValid(!!token); // Set validity based on the presence of token
        }
    })() 
 }, [token]);

  return isTokenValid ? <HomeScreen /> : <LoginScreen />;
};

export default MainComponent;
