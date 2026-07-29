// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tuodaan sivut (luodaan nämä kohta paloissa!)
import HomeScreen from './screens/HomeScreen';
import PasswordScreen from './screens/PasswordScreen';
import QRScreen from './screens/QRScreen';
import ShortenerScreen from './screens/ShortenerScreen';
import PastebinScreen from './screens/PastebinScreen';
import ShareScreen from './screens/ShareScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          // Sorola-teeman mukainen yläpalkki
          headerStyle: { backgroundColor: '#191f2d' },
          headerTintColor: '#ffaa00',
          headerTitleStyle: { fontWeight: 'bold' },
          // Tumma tausta koko apille
          contentStyle: { backgroundColor: '#0b0d13' }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Sorolan Työkalut' }} 
        />
        <Stack.Screen name="Password" component={PasswordScreen} options={{ title: 'Salasanakone' }} />
        <Stack.Screen name="QR" component={QRScreen} options={{ title: 'QR-Luoja' }} />
        <Stack.Screen name="Shortener" component={ShortenerScreen} options={{ title: 'Linkinlyhennin' }} />
        <Stack.Screen name="Pastebin" component={PastebinScreen} options={{ title: 'Pastebin' }} />
        <Stack.Screen name="Share" component={ShareScreen} options={{ title: 'Tiedostonjako' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
