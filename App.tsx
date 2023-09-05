/**
 * Sample BLE React Native App
 */

import React from 'react';
import Home from './Home';
import Device from './Device';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Peripheral} from 'react-native-ble-manager';

export type RootStackParamList = {
  Home: undefined;
  Device: {peripheral: Peripheral | null};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Device" component={Device} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
