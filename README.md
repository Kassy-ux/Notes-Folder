# 📝 Notes App - React Native

A fully-featured, offline-first mobile notes application built with React Native (Expo) and AsyncStorage.

## ✨ Features

### Core Features
- ✅ **Add New Notes** - Create notes with title and content
- ✅ **Edit Notes** - Modify existing notes anytime
- ✅ **View All Notes** - Browse all your notes in a clean card-style list
- ✅ **Offline Storage** - All notes saved locally using AsyncStorage
- ✅ **Smooth Navigation** - Easy navigation between screens

### Advanced Features
- 🔍 **Search Functionality** - Search notes by title or content
- 🗑️ **Delete Notes** - Remove unwanted notes with confirmation
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes with persistent storage
- 📊 **Sort Options** - Sort notes by date (newest first) or title (A-Z)
- 🏷️ **Category Tags** - Organize notes with color-coded categories (Work, Personal, Ideas, Study, General)
- 📌 **Pin Favorites** - Pin important notes to the top of your list
- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with the Expo Go app (Android) or Camera app (iOS)
   - Or press `a` for Android emulator or `i` for iOS simulator

## 📱 How to Use

### Basic Operations
1. **Home Screen**: View all your saved notes with search and sort options
2. **Add Note**: Tap the `+` button to create a new note
3. **Edit Note**: Tap any note card to view and edit it
4. **Search**: Use the search bar to find notes by title or content
5. **Sort**: Tap the sort button (⇅) to change sorting order
6. **Theme**: Tap the theme button (🌙/☀️) to switch between dark and light modes
7. **Categories**: Assign categories to organize your notes
8. **Pin Notes**: Pin important notes to keep them at the top
9. **Delete**: Remove unwanted notes from the edit screen

## 📁 Project Structure

```
notes-app/
├── App.js                          # Main app entry point with ThemeProvider
├── src/
│   ├── components/
│   │   └── NoteCard.js            # Note card with categories and pin status
│   ├── screens/
│   │   ├── HomeScreen.js          # Home with search, sort, and theme toggle
│   │   ├── AddNoteScreen.js       # Create new notes with categories
│   │   └── EditNoteScreen.js      # Edit, delete, and pin notes
│   ├── services/
│   │   └── notesStorage.js        # AsyncStorage CRUD operations
│   ├── context/
│   │   └── ThemeContext.js        # Theme management with dark/light modes
│   └── navigation/
│       └── AppNavigator.js        # Navigation configuration
├── package.json
└── app.json
```

## 🛠️ Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **AsyncStorage** - Local storage solution
- **React Context API** - Theme management

## � Features in Detail

### 🔍 Search
- Real-time search across note titles and content
- Clear button to reset search
- Search results update instantly

### 📊 Sort Options
- **Date**: Newest notes first
- **Title**: Alphabetical order (A-Z)
- Pinned notes always appear first

### 🏷️ Categories
- **5 Built-in Categories**: General, Work, Personal, Ideas, Study
- Color-coded badges for easy identification
- Filter and organize notes by category

### 🌓 Dark Mode
- Seamless theme switching
- Automatic theme persistence
- Eye-friendly dark colors

### 📌 Pin Notes
- Keep important notes at the top
- Visual indicator for pinned notes
- Easy toggle on/off

## 🎯 Future Enhancements

Potential features to add:

- ☁️ Cloud backup integration (Firebase/Supabase)
- 🔐 Password protection/biometric lock
- 📎 Attachments and images
- � Reminders and notifications
- 📤 Export notes (PDF, text files)
- 🔗 Note sharing
- ✅ Checklist support
- 🎙️ Voice notes

## 📝 Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React Native & Expo**
