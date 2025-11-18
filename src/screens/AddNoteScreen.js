import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { saveNote } from '../services/notesStorage';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study'];

const AddNoteScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSaveNote = async () => {
        // Validation
        if (!title.trim() && !content.trim()) {
            Alert.alert('Empty Note', 'Please add a title or content to save the note.');
            return;
        }

        console.log('💾 Saving note...');
        console.log('  Authenticated:', isAuthenticated);
        console.log('  Title:', title.trim() || 'Untitled');
        console.log('  Category:', category);

        try {
            setSaving(true);

            const noteData = {
                title: title.trim() || 'Untitled',
                content: content.trim(),
                category: category.toLowerCase(), // Backend expects lowercase
                tags: tags.trim() ? tags.split(',').map(t => t.trim()) : [],
                imageUrl: image || null,
            };

            if (isAuthenticated) {
                try {
                    // Try to save to backend
                    console.log('🌐 Attempting backend save...');
                    const response = await ApiService.createNote(noteData);
                    if (response.success) {
                        console.log('✅ Backend save successful!');
                        Alert.alert('Success', '☁️ Note saved to cloud!');
                        navigation.goBack();
                        return;
                    }
                } catch (apiError) {
                    console.log('⚠️ Backend save failed:', apiError.message);
                    console.log('📱 Saving locally...');
                    // Fallback to local storage
                    await saveNote(noteData);
                    console.log('✅ Local save successful!');
                    Alert.alert('Saved Locally', '📱 Could not reach server. Note saved on device and will sync when online.');
                    navigation.goBack();
                    return;
                }
            } else {
                // Save locally
                console.log('📱 Saving locally (not authenticated)...');
                await saveNote(noteData);
                console.log('✅ Local save successful!');
                Alert.alert('Saved Locally', '📱 Note saved to device. Sign in to sync across devices.');
                navigation.goBack();
            }
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

                        {/* Tags Input */}
                        <TextInput
                            style={[styles.tagsInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Tags (comma separated: work, important, etc.)"
                            placeholderTextColor={colors.placeholder}
                            value={tags}
                            onChangeText={setTags}
                        />

                        {/* Image Attachment */}
                        <TouchableOpacity
                            style={[styles.imageButton, { borderColor: colors.border }]}
                            onPress={pickImage}
                        >
                            <Text style={[styles.imageButtonText, { color: colors.primary }]}>
                                📷 {image ? 'Change Image' : 'Add Image'}
                            </Text>
                        </TouchableOpacity>

                        {image && (
                            <View style={styles.imagePreview}>
                                <Text style={[styles.imageText, { color: colors.textSecondary }]}>
                                    ✓ Image attached
                                </Text>
                            </View>
                        )}
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
        paddingTop: 25, // Add more space from status bar
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
    tagsInput: {
        fontSize: 14,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 16,
    },
    imageButton: {
        marginTop: 16,
        padding: 16,
        borderWidth: 2,
        borderRadius: 8,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    imageButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreview: {
        marginTop: 8,
        padding: 8,
    },
    imageText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default AddNoteScreen;
