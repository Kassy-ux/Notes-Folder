# 📱 Notes App - Features Guide

## 🎯 All Features Implemented

### 1. ✏️ Edit Notes
- **How**: Tap any note card to open edit mode
- **What you can do**: Modify title, content, and category
- **Actions available**: Save changes, delete note, pin/unpin

### 2. 🗑️ Delete Notes
- **How**: Open a note in edit mode, tap the "Delete" button
- **Safety**: Confirmation dialog prevents accidental deletion
- **Result**: Note is permanently removed from storage

### 3. 🔍 Search Notes
- **Location**: Search bar at top of home screen
- **Searches**: Both title and content
- **Features**: 
  - Real-time filtering as you type
  - Clear button (✕) to reset search
  - Shows "No notes found" when no matches

### 4. 🌓 Dark/Light Theme
- **How**: Tap the theme icon (🌙 for dark, ☀️ for light) in header
- **Persistence**: Your theme choice is saved automatically
- **Coverage**: All screens adapt to selected theme
- **Colors**: 
  - Light: White backgrounds, dark text
  - Dark: Black/dark gray backgrounds, light text

### 5. 📊 Sort Options
- **How**: Tap the sort button (⇅) in header
- **Options**:
  - 📅 Date (Newest First) - Default sorting
  - 🔤 Title (A-Z) - Alphabetical order
- **Smart sorting**: Pinned notes always appear first

### 6. 🏷️ Categories & Tags
- **Available Categories**:
  - 🔷 General (Gray)
  - 🔴 Work (Red)
  - 🔵 Personal (Teal)
  - 🟡 Ideas (Yellow)
  - 🟢 Study (Mint)
- **How to use**: Select category when creating or editing a note
- **Visual**: Color-coded badges appear on note cards
- **Organization**: Easy to identify note types at a glance

### 7. 📌 Pin Favorites
- **How**: Open a note in edit mode, tap "📌 Pin Note"
- **Effect**: Pinned notes always appear at the top
- **Visual indicator**: "📌 Pinned" badge on note card
- **Toggle**: Tap again to unpin (button shows "📌 Unpin")

---

## 🎨 UI/UX Features

### Beautiful Note Cards
- Rounded corners with shadow effects
- Title in bold, larger font
- Content preview (first 100 characters)
- Date stamp (formatted: "Nov 17, 2025")
- Category badge (if not "general")
- Pin indicator (if pinned)

### Smart Navigation
- Smooth slide animations between screens
- Back button behavior with unsaved changes warning
- Auto-return to home after save/delete

### Keyboard Handling
- Keyboard-aware scrolling
- Auto-focus on title field (new notes)
- Multi-line content editing

### Empty States
- Friendly message when no notes exist
- Search-specific empty state
- Emoji-enhanced visual feedback

---

## 💾 Data Management

### Local Storage
- All data stored on device using AsyncStorage
- No internet required
- Data persists after app closes
- Instant load times

### Note Structure
Each note contains:
- `id`: Unique identifier (timestamp-based)
- `title`: Note title (max 100 characters)
- `content`: Note body (unlimited)
- `category`: One of 5 categories
- `isPinned`: Boolean for pin status
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp (on edits)

---

## 🚀 Quick Start Guide

1. **First Launch**: App opens with empty state message
2. **Create Note**: Tap `+` button
3. **Select Category**: Choose from 5 options
4. **Write Content**: Add title and text
5. **Save**: Tap "Save" to store note
6. **Browse**: View all notes on home screen
7. **Search**: Type in search bar to filter
8. **Sort**: Change ordering with sort button
9. **Edit**: Tap any note to modify
10. **Pin**: Keep important notes on top
11. **Theme**: Switch to dark mode for night use
12. **Delete**: Remove unwanted notes

---

## 🎓 Tips & Tricks

- **Quick Access**: Pin frequently used notes
- **Organization**: Use categories consistently
- **Search Power**: Search works on full content, not just titles
- **Dark Mode**: Better for reading at night
- **Sorting**: Use title sort to find specific notes quickly
- **Categories**: Color-code your workflow (Work = Red, Personal = Teal)

---

## ⚡ Performance

- **Lightning Fast**: All operations are instant
- **Offline First**: No network delays
- **Smooth Scrolling**: Optimized FlatList rendering
- **Efficient Search**: Real-time filtering without lag
- **Memory Efficient**: Only active data in memory

---

**Enjoy your fully-featured Notes App! 📝✨**
