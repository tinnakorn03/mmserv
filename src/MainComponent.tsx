import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; 
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { getToken, clearToken } from './utils/authUtils';
import { setToken , selectToken, setRole, clearTokenRedux} from './store/authSlice'; 
import store from './store/store';  
import { decode } from "react-native-pure-jwt";

const MainComponent = () => { 
  const token = useSelector(selectToken);
  const [isTokenValid, setIsTokenValid] = useState(!!token);

  useEffect(() => {
    (async () =>{ 
        const userToken = await getToken();
        if (userToken) { 
          decode(userToken, 'hub.mm.server',{ skipValidation: true })
          .then((response:any)=>{
            const {headers, payload}:any = response;
            const { username }:any = payload?.sub; 
            const role = ['Max','max'].includes(username) ? 'admin' : 'other';
            store.dispatch(setRole(role)); 
          }) 
          setIsTokenValid(true)  
        }else{ 
          setIsTokenValid(!!token); // Set validity based on the presence of token
        }
    })() 
 }, [token]);

  return isTokenValid ? <HomeScreen /> : <LoginScreen />;
};

export default MainComponent;
