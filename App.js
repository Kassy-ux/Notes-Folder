import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <StatusBar style="auto" />
                <AppNavigator />
            </ThemeProvider>
        </AuthProvider>
    );
}
