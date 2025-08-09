import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountScreen from './src/screens/AccountScreen';
import TransferScreen from './src/screens/TransferScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';

// Import context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Component
function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : user?.role === 'admin' ? (
        // Admin Stack
        <Stack.Navigator>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminScreen}
            options={{ title: 'Admin Dashboard' }}
          />
        </Stack.Navigator>
      ) : (
        // User Tab Navigator
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Account') {
                iconName = focused ? 'card' : 'card-outline';
              } else if (route.name === 'Transfer') {
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              } else if (route.name === 'Transactions') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Home' }}
          />
          <Tab.Screen 
            name="Account" 
            component={AccountScreen}
            options={{ title: 'Account' }}
          />
          <Tab.Screen 
            name="Transfer" 
            component={TransferScreen}
            options={{ title: 'Transfer' }}
          />
          <Tab.Screen 
            name="Transactions" 
            component={TransactionsScreen}
            options={{ title: 'History' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

// Root App Component
export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
} 