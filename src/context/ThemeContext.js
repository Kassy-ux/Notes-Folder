import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@notes_app_theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  background: '#f5f5f5',
  cardBackground: '#fff',
  text: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#e0e0e0',
  primary: '#007AFF',
  danger: '#FF3B30',
  searchBackground: '#fff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#fff',
  placeholder: '#999',
};

const darkColors = {
  background: '#000',
  cardBackground: '#1C1C1E',
  text: '#fff',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  border: '#38383A',
  primary: '#0A84FF',
  danger: '#FF453A',
  searchBackground: '#1C1C1E',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',
  inputBackground: '#1C1C1E',
  placeholder: '#636366',
};
