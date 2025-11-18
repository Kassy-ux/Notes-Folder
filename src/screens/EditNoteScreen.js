import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { updateNote, deleteNote, togglePinNote } from '../services/notesStorage';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['general', 'work', 'personal', 'ideas', 'study'];

const EditNoteScreen = ({ navigation, route }) => {
  const { note } = route.params;
  const { colors } = useTheme();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category || 'general');
  const [saving, setSaving] = useState(false);

  const handleSaveNote = async () => {
    // Validation
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Please add a title or content to save the note.');
      return;
    }

    try {
      setSaving(true);
      await updateNote(note.id, {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        category: category,
      });
      
      // Navigate back to home screen
      navigation.goBack();
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteNote(note.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note.');
            }
          } 
        },
      ]
    );
  };

  const handleTogglePin = async () => {
    try {
      await togglePinNote(note.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle pin.');
    }
  };

  const handleCancel = () => {
    if (title !== note.title || content !== note.content) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Note</Text>
          <TouchableOpacity 
            onPress={handleSaveNote} 
            style={styles.headerButton}
            disabled={saving}
          >
            <Text style={[styles.saveText, { color: colors.primary }, saving && styles.savingText]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Form */}
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Category Selection */}
            <View style={styles.categoryContainer}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                      { backgroundColor: category === cat ? colors.primary : colors.border }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: category === cat ? '#fff' : colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={[styles.titleInput, { color: colors.text }]}
              placeholder="Title"
              placeholderTextColor={colors.placeholder}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <TextInput
              style={[styles.contentInput, { color: colors.text }]}
              placeholder="Start writing your note..."
              placeholderTextColor={colors.placeholder}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.pinButton, { backgroundColor: colors.border }]}
            onPress={handleTogglePin}
          >
            <Text style={[styles.pinButtonText, { color: colors.text }]}>
              {note.isPinned ? '📌 Unpin' : '📌 Pin Note'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
            onPress={handleDeleteNote}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    minWidth: 70,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  savingText: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingVertical: 8,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
    paddingTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 12,
  },
  pinButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditNoteScreen;
