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
        console.log('💾 notesStorage.saveNote called with:', note);
        const existingNotes = await getNotes();
        console.log('📦 Existing notes count:', existingNotes.length);

        // If note already has an ID (from backend), use it and update existing
        if (note.id) {
            console.log('🔑 Note has ID:', note.id, '- checking if exists...');
            const noteIndex = existingNotes.findIndex(n => n.id === note.id);
            if (noteIndex >= 0) {
                // Update existing note
                console.log('🔄 Updating existing note at index:', noteIndex);
                existingNotes[noteIndex] = {
                    ...existingNotes[noteIndex],
                    ...note,
                    updatedAt: new Date().toISOString()
                };
                await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
                console.log('✅ Note updated successfully');
                return existingNotes[noteIndex];
            } else {
                // Add note with existing ID
                console.log('➕ Adding note with existing ID');
                const updatedNotes = [note, ...existingNotes];
                await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
                console.log('✅ Note added successfully. Total notes:', updatedNotes.length);
                return note;
            }
        }

        // New note without ID - create one
        console.log('🆕 Creating new note with generated ID');
        const newNote = {
            id: Date.now().toString(),
            title: note.title || '',
            content: note.content || '',
            category: note.category || 'General',
            isPinned: note.isPinned || false,
            tags: note.tags || [],
            imageUrl: note.imageUrl || null,
            createdAt: new Date().toISOString(),
        };
        console.log('🆔 Generated ID:', newNote.id);
        const updatedNotes = [newNote, ...existingNotes];
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        console.log('✅ New note saved! Total notes:', updatedNotes.length);
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
