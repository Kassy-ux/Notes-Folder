import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import AddNoteScreen from '../screens/AddNoteScreen';
import EditNoteScreen from '../screens/EditNoteScreen';
import TrashScreen from '../screens/TrashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {isAuthenticated === false ? (
                    // Auth Stack - Show when not authenticated
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                        />
                    </>
                ) : (
                    // Main App Stack - Show when authenticated or skipped
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                        />
                        <Stack.Screen
                            name="AddNote"
                            component={AddNoteScreen}
                        />
                        <Stack.Screen
                            name="EditNote"
                            component={EditNoteScreen}
                        />
                        <Stack.Screen
                            name="Trash"
                            component={TrashScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
