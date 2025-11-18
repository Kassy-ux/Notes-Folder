# 🛠️ Development Guide

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or pnpm
- Expo Go app on your phone
- OR Android Studio / Xcode for emulators

### Installation

```bash
# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm start
# or
npm start
```

### Running on Devices

#### Physical Device
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Run `pnpm start`
3. Scan QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

#### Emulator
```bash
# Android
pnpm run android

# iOS (macOS only)
pnpm run ios
```

---

## 🏗️ Architecture

### Component Hierarchy
```
App.js (ThemeProvider)
  └── AppNavigator (NavigationContainer)
      ├── HomeScreen
      │   └── NoteCard (multiple)
      ├── AddNoteScreen
      └── EditNoteScreen
```

### Data Flow
```
User Action
  ↓
Screen Component
  ↓
Storage Service (notesStorage.js)
  ↓
AsyncStorage
  ↓
Update State
  ↓
Re-render UI
```

### Theme System
```
ThemeProvider (Context)
  ↓
useTheme() hook
  ↓
{colors, isDark, toggleTheme}
  ↓
Applied to all components
```

---

## 📝 Code Standards

### File Naming
- Components: PascalCase (e.g., `NoteCard.js`)
- Screens: PascalCase with Screen suffix (e.g., `HomeScreen.js`)
- Services: camelCase (e.g., `notesStorage.js`)
- Context: PascalCase with Context suffix (e.g., `ThemeContext.js`)

### Component Structure
```javascript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  // State
  // Functions
  
  return (
    // JSX
  );
};

// 3. Styles
const styles = StyleSheet.create({
  // styles
});

// 4. Export
export default MyComponent;
```

### Styling Guidelines
- Use StyleSheet.create for performance
- Theme-aware colors via useTheme()
- Consistent spacing (8px increments)
- Shadow for elevation (iOS) and elevation prop (Android)

---

## 🔧 Adding New Features

### Add a New Screen

1. **Create screen file**:
```javascript
// src/screens/NewScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const NewScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>New Screen</Text>
    </View>
  );
};

export default NewScreen;
```

2. **Add to navigation**:
```javascript
// src/navigation/AppNavigator.js
import NewScreen from '../screens/NewScreen';

// Inside Stack.Navigator:
<Stack.Screen name="NewScreen" component={NewScreen} />
```

3. **Navigate to it**:
```javascript
navigation.navigate('NewScreen', { param: value });
```

### Add a New Storage Function

```javascript
// src/services/notesStorage.js
export const myNewFunction = async (params) => {
  try {
    const notes = await getNotes();
    // Your logic here
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Add a New Category

```javascript
// In AddNoteScreen.js and EditNoteScreen.js
const CATEGORIES = [
  'general', 
  'work', 
  'personal', 
  'ideas', 
  'study',
  'newcategory' // Add here
];

// In NoteCard.js
const getCategoryColor = (category) => {
  const colors = {
    // ...existing colors
    newcategory: '#FF00FF', // Add color
  };
  return colors[category] || colors.general;
};
```

---

## 🐛 Debugging

### Common Issues

#### 1. **Metro Bundler Issues**
```bash
# Clear cache and restart
pnpm start --clear
# or
npx expo start -c
```

#### 2. **AsyncStorage not working**
- Check if @react-native-async-storage/async-storage is installed
- Rebuild the app after installation

#### 3. **Navigation errors**
- Ensure screen names match exactly
- Check if screen is registered in AppNavigator

#### 4. **Theme not applying**
- Verify ThemeProvider wraps NavigationContainer
- Check if useTheme() is called inside component

### Console Logs
```javascript
// Add strategic console.logs
console.log('Notes loaded:', notes.length);
console.log('Current theme:', isDark ? 'dark' : 'light');
console.log('Note saved:', note.id);
```

### React DevTools
```bash
# Install React DevTools
npm install -g react-devtools

# Run in separate terminal
react-devtools
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Core Functionality
- [ ] Create a new note
- [ ] Edit an existing note
- [ ] Delete a note (with confirmation)
- [ ] Notes persist after app restart

#### Search & Sort
- [ ] Search by title
- [ ] Search by content
- [ ] Clear search
- [ ] Sort by date
- [ ] Sort by title
- [ ] Pinned notes stay on top

#### Theme
- [ ] Toggle to dark mode
- [ ] Toggle to light mode
- [ ] Theme persists after restart
- [ ] All screens adapt to theme

#### Categories
- [ ] Assign category to new note
- [ ] Change category in edit mode
- [ ] Category badge displays correct color

#### Pin Feature
- [ ] Pin a note
- [ ] Unpin a note
- [ ] Pinned notes appear first
- [ ] Pin badge displays on card

---

## 📊 Performance Tips

### Optimization Strategies

1. **FlatList Optimization**
```javascript
<FlatList
  data={notes}
  renderItem={renderNoteItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={21}
/>
```

2. **Memoization**
```javascript
import { useMemo, useCallback } from 'react';

const filteredNotes = useMemo(() => {
  return notes.filter(note => 
    note.title.includes(searchQuery)
  );
}, [notes, searchQuery]);

const handlePress = useCallback(() => {
  // handler
}, [dependencies]);
```

3. **Image Optimization** (for future features)
- Use compressed images
- Implement lazy loading
- Cache images locally

---

## 🚀 Deployment

### Building for Production

#### Android APK
```bash
# Build APK
eas build --platform android --profile preview

# Or use Expo's classic build
expo build:android
```

#### iOS IPA
```bash
# Requires Apple Developer account
eas build --platform ios --profile preview

# Or use Expo's classic build
expo build:ios
```

### App Store Submission
1. Update version in `app.json`
2. Update icons and splash screens
3. Test thoroughly on physical devices
4. Follow platform-specific guidelines

---

## 📚 Resources

### Official Documentation
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

### Helpful Tools
- [React Native Directory](https://reactnative.directory)
- [Expo Snack](https://snack.expo.dev) - Online playground
- [React DevTools](https://github.com/facebook/react/tree/main/packages/react-devtools)

---

## 💡 Best Practices

1. **Always use hooks** (useState, useEffect, useCallback, useMemo)
2. **Theme-aware components** (use useTheme() hook)
3. **Error handling** (try-catch in async functions)
4. **User feedback** (loading states, confirmation dialogs)
5. **Consistent styling** (follow existing patterns)
6. **Code comments** (explain complex logic)
7. **Git commits** (small, focused commits with clear messages)

---

**Happy Coding! 🎉**
