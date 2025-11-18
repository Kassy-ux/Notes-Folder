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
import { saveNote } from '../services/notesStorage';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['general', 'work', 'personal', 'ideas', 'study'];

const AddNoteScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [saving, setSaving] = useState(false);

    const handleSaveNote = async () => {
        // Validation
        if (!title.trim() && !content.trim()) {
            Alert.alert('Empty Note', 'Please add a title or content to save the note.');
            return;
        }

        try {
            setSaving(true);
            await saveNote({
                title: title.trim() || 'Untitled',
                content: content.trim(),
                category: category,
            });

            // Navigate back to home screen
            navigation.goBack();
        } catch (error) {
            console.error('Error saving note:', error);
            Alert.alert('Error', 'Failed to save note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (title.trim() || content.trim()) {
            Alert.alert(
                'Discard Note?',
                'You have unsaved changes. Are you sure you want to discard this note?',
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
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Note</Text>
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
                            autoFocus
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
});

export default AddNoteScreen;
