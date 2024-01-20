
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux'; 
import store from './store/store'; 
import MainComponent from './MainComponent'; 
import DockerLogScreen from './screens/DockerLogScreen';
import CommandScreen from './screens/CommandScreen';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors, 
} from 'react-native/Libraries/NewAppScreen';
import { RootStackParamList } from './type';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element { 
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <Provider store={store}>
      <SafeAreaView style={{...backgroundStyle,flex:1}}> 
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Main" component={MainComponent} options={{ headerShown: false }}/>
            <Stack.Screen 
              name="DockerLogScreen" 
              component={DockerLogScreen} 
              options={{ headerShown: false, presentation: 'modal' }} 
            />
            <Stack.Screen name="CommandScreen" component={CommandScreen} options={{ headerShown: false }}/> 
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView> 
    </Provider> 
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
