# Notes Not Showing - Debugging Guide

## Quick Checks

### 1. Check if Notes Exist in Storage

Open your app and press **`Ctrl+M`** (Android) or **`Cmd+D`** (iOS) to open dev menu, then:

1. Enable "Remote JS Debugging"
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Type this and press Enter:

```javascript
import('@react-native-async-storage/async-storage').then(AsyncStorage => {
  AsyncStorage.default.getItem('@notes_app_storage').then(notes => {
    console.log('Stored notes:', notes);
  });
});
```

**Expected**: Should show array of notes or `null`

### 2. Check Authentication Status

In the same console:
```javascript
import('@react-native-async-storage/async-storage').then(AsyncStorage => {
  AsyncStorage.default.getItem('authToken').then(token => {
    console.log('Auth token:', token ? 'Exists' : 'None');
  });
  AsyncStorage.default.getItem('userData').then(user => {
    console.log('User data:', user);
  });
});
```

### 3. Check Metro Bundler Logs

Look at your terminal where Expo is running. You should see:
- ✅ No errors
- ✅ "Backend not available, loading from local storage" (if offline)
- ❌ Any error messages?

---

## Common Causes & Solutions

### Issue 1: No Notes Created Yet

**Symptom**: Empty screen with "No notes yet" message

**Solution**: 
1. Tap the **+ button** (top right)
2. Create a test note
3. Tap Save
4. Should appear immediately

### Issue 2: Notes Created But Not Showing

**Check the FlatList render**:

Add console logging to HomeScreen:

```javascript
// In HomeScreen.js, around line 70
const loadNotes = useCallback(async () => {
    try {
        setLoading(true);
        // ... existing code ...
        
        const loadedNotes = await getNotes();
        console.log('📝 Loaded notes:', loadedNotes.length, 'notes');
        console.log('📝 First note:', loadedNotes[0]);
        setNotes(Array.isArray(loadedNotes) ? loadedNotes : []);
    } catch (error) {
        console.error('❌ Error loading notes:', error);
    }
}, [isAuthenticated]);
```

### Issue 3: Authentication Blocking Local Notes

**Symptom**: Created notes before login, now logged in and they're gone

**Explanation**: When authenticated, app tries to load from backend first

**Solution**:
1. **Option A - Logout**: Tap logout to see local notes
2. **Option B - Check backend**: Your notes are in the cloud, but backend might have errors

### Issue 4: Filter/Search Hiding Notes

**Check**:
- Is search bar filled in? → Clear it
- Are notes filtered by category? → Check filter settings

### Issue 5: Backend Sync Overwriting Local Notes

**Symptom**: Had notes, logged in, now empty

**Cause**: Backend returned empty array, overwrote local cache

**Check console for**:
```
LOG  Backend not available, loading from local storage
```

If you see this, local notes should load.

If you see:
```
Backend notes loaded: 0 notes
```

Then backend has no notes (expected for new account).

---

## Manual Fix: Clear and Restart

### Reset Local Storage

In dev console:
```javascript
import('@react-native-async-storage/async-storage').then(AsyncStorage => {
  AsyncStorage.default.clear().then(() => {
    console.log('✅ Storage cleared');
  });
});
```

Then:
1. Close app completely
2. Reopen
3. Skip login or create new account
4. Create test notes
5. Should work now

---

## Step-by-Step Debugging

### Step 1: Check if LoadNotes is Called

Add this at the **top** of `loadNotes` function in HomeScreen.js:

```javascript
const loadNotes = useCallback(async () => {
    console.log('🔄 loadNotes called, isAuthenticated:', isAuthenticated);
    try {
        setLoading(true);
        // ... rest of function
```

**Reload app** → Check console

**Expected**: Should see "🔄 loadNotes called" when screen loads

### Step 2: Check if Notes Array is Set

Add this after `setNotes`:

```javascript
const loadedNotes = await getNotes();
console.log('📦 Setting notes:', loadedNotes.length);
setNotes(Array.isArray(loadedNotes) ? loadedNotes : []);
console.log('✅ Notes state updated');
```

**Expected**: Should see "📦 Setting notes: X" and "✅ Notes state updated"

### Step 3: Check if FlatList Receives Data

Add this before the `return` in HomeScreen:

```javascript
console.log('🎨 Rendering HomeScreen, notes count:', notes.length);
console.log('🎨 Filtered notes count:', filteredNotes.length);
```

**Expected**: Should see counts > 0 if you have notes

### Step 4: Check FlatList Render

Find the FlatList component in HomeScreen and add:

```javascript
<FlatList
    data={filteredNotes}
    renderItem={({ item }) => {
        console.log('🎯 Rendering note:', item.title);
        return <NoteCard note={item} onPress={...} />;
    }}
    // ... rest of props
/>
```

**Expected**: Should see "🎯 Rendering note: [title]" for each note

---

## Quick Test

### Create Test Note from Console

```javascript
import('@react-native-async-storage/async-storage').then(AsyncStorage => {
  const testNote = {
    id: Date.now().toString(),
    title: 'Test Note',
    content: 'This is a test',
    category: 'general',
    createdAt: new Date().toISOString(),
    isPinned: false,
    tags: []
  };
  
  AsyncStorage.default.getItem('@notes_app_storage').then(notesJson => {
    const notes = notesJson ? JSON.parse(notesJson) : [];
    notes.unshift(testNote);
    AsyncStorage.default.setItem('@notes_app_storage', JSON.stringify(notes)).then(() => {
      console.log('✅ Test note added! Reload app to see it.');
    });
  });
});
```

Then **reload app** (press `r` in Expo or shake device → Reload)

---

## Check These Files

### 1. HomeScreen.js

**Lines to check**:
- Line ~23: `const [notes, setNotes] = useState([]);` ← Should start as empty array
- Line ~31: `const loadNotes = useCallback(async () => {` ← Should be called on focus
- Line ~65: `useFocusEffect(useCallback(() => { loadNotes(); }` ← Should trigger on screen focus

### 2. NoteCard.js

Make sure it's receiving props correctly:

```javascript
const NoteCard = ({ note, onPress }) => {
    console.log('💳 NoteCard rendering:', note?.title);
    // ... rest of component
```

---

## What Should Happen

### On App Start (Not Authenticated):
1. ✅ HomeScreen mounts
2. ✅ `loadNotes()` called
3. ✅ Loads from local storage
4. ✅ Sets notes state
5. ✅ FlatList renders notes

### On App Start (Authenticated):
1. ✅ HomeScreen mounts
2. ✅ `loadNotes()` called
3. ✅ Tries backend API
4. ⚠️ If backend fails → loads from local
5. ✅ If backend succeeds → shows cloud notes
6. ✅ FlatList renders notes

---

## Most Likely Causes

Based on the code, here are the most probable issues:

### 1. **Empty Local Storage** (90% likely)
- No notes have been created yet
- Solution: Create a note!

### 2. **Backend Empty, Local Cache Overwritten** (5% likely)
- Logged in with new account
- Backend returned empty array
- Cleared local notes
- Solution: Create new notes (they'll sync to cloud)

### 3. **Filter Hiding Notes** (3% likely)
- Search query active
- Category filter applied
- Solution: Clear search/filters

### 4. **State Update Issue** (2% likely)
- React state not updating
- Solution: Add console logs to debug

---

## Immediate Actions

1. **Check Metro bundler logs** for errors
2. **Create a test note** via the + button
3. **Check if it appears** immediately
4. **If not**, add console logs as shown above
5. **Report** what you see in console

---

## Report Template

When asking for help, provide:

```
Device: [Android/iOS]
Authenticated: [Yes/No]
Notes created: [Number]
Console logs: [Copy/paste]
Metro bundler errors: [Copy/paste]
Steps taken: [What you did]
```

This will help diagnose the exact issue!
