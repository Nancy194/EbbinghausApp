import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppContext } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ContentFormScreen } from '../screens/ContentFormScreen';
import { AuthScreen } from '../screens/AuthScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  Review: { sourceDate: string };
  ContentForm: {
    date: string;
    entryId?: string;
    title?: string;
    body?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainScreens() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ContentForm"
        component={ContentFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { state, login } = useAppContext();
  const { nickname, isLoading, error } = state;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {nickname ? (
          <Stack.Screen name="Main" component={MainScreens} />
        ) : (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthScreen
                onLogin={async (nick) => {
                  login(nick);
                }}
                loading={isLoading}
                error={error}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
