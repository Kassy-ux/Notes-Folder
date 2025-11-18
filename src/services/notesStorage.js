import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = '@notes_app_storage';

// Get all notes from AsyncStorage
export const getNotes = async () => {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

// Save a new note
export const saveNote = async (note) => {
  try {
    const existingNotes = await getNotes();
    const newNote = {
      id: Date.now().toString(), // Simple unique ID based on timestamp
      title: note.title,
      content: note.content,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...existingNotes];
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    return newNote;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (noteId, updatedData) => {
  try {
    const existingNotes = await getNotes();
    const updatedNotes = existingNotes.map(note => 
      note.id === noteId 
        ? { ...note, ...updatedData, updatedAt: new Date().toISOString() }
        : note
    );
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    return updatedNotes.find(note => note.id === noteId);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (noteId) => {
  try {
    const existingNotes = await getNotes();
    const filteredNotes = existingNotes.filter(note => note.id !== noteId);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// Toggle pin status of a note
export const togglePinNote = async (noteId) => {
  try {
    const existingNotes = await getNotes();
    const updatedNotes = existingNotes.map(note => 
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned }
        : note
    );
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Error toggling pin:', error);
    throw error;
  }
};

// Clear all notes (optional utility function)
export const clearAllNotes = async () => {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notes:', error);
    throw error;
  }
};
