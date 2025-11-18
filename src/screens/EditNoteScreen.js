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
import { updateNote, deleteNote, togglePinNote } from '../services/notesStorage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study'];

const EditNoteScreen = ({ navigation, route }) => {
    const { note } = route.params;
    const { colors } = useTheme();
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [category, setCategory] = useState(note.category || 'General');
    const [tags, setTags] = useState(note.tags ? note.tags.join(', ') : '');
    const [image, setImage] = useState(note.imageUrl || null);
    const [saving, setSaving] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to attach images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSaveNote = async () => {
        // Validation
        if (!title.trim() && !content.trim()) {
            Alert.alert('Empty Note', 'Please add a title or content to save the note.');
            return;
        }

        try {
            setSaving(true);
            
            const noteData = {
                title: title.trim() || 'Untitled',
                content: content.trim(),
                category: category.toLowerCase(), // Backend expects lowercase
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                imageUrl: image,
            };

            if (isAuthenticated) {
                // Save to backend
                await ApiService.updateNote(note.id, noteData);
                Alert.alert('Success', '☁️ Note updated and synced to cloud!');
            } else {
                // Fallback to local storage
                await updateNote(note.id, noteData);
                Alert.alert('Success', '📱 Note updated locally!');
            }

            // Navigate back to home screen
            navigation.goBack();
        } catch (error) {
            console.error('Error updating note:', error);
            
            // If backend fails, try local storage as fallback
            if (isAuthenticated) {
                try {
                    await updateNote(note.id, {
                        title: title.trim() || 'Untitled',
                        content: content.trim(),
                        category: category.toLowerCase(),
                    });
                    Alert.alert('Note Saved Locally', 'Could not sync to cloud, but saved locally.');
                    navigation.goBack();
                } catch (localError) {
                    Alert.alert('Error', 'Failed to update note. Please try again.');
                }
            } else {
                Alert.alert('Error', 'Failed to update note. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isAuthenticated) {
                                try {
                                    // Try backend delete first
                                    await ApiService.deleteNote(note.id);
                                    Alert.alert('Deleted', '☁️ Note moved to trash.');
                                    navigation.goBack();
                                } catch (apiError) {
                                    // Backend failed, delete locally
                                    console.log('Backend delete failed, deleting locally');
                                    await deleteNote(note.id);
                                    Alert.alert('Deleted Locally', '📱 Note deleted from device.');
                                    navigation.goBack();
                                }
                            } else {
                                // Delete locally (not authenticated)
                                await deleteNote(note.id);
                                Alert.alert('Deleted', '📱 Note deleted locally.');
                                navigation.goBack();
                            }
                        } catch (error) {
                            console.error('Error deleting note:', error);
                            Alert.alert('Error', 'Failed to delete note. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const handleTogglePin = async () => {
        try {
            if (isAuthenticated) {
                // Toggle pin via backend
                await ApiService.togglePin(note.id);
            } else {
                // Toggle pin locally
                await togglePinNote(note.id);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error toggling pin:', error);
            // Try local fallback
            if (isAuthenticated) {
                try {
                    await togglePinNote(note.id);
                    navigation.goBack();
                } catch (localError) {
                    Alert.alert('Error', 'Failed to toggle pin.');
                }
            } else {
                Alert.alert('Error', 'Failed to toggle pin.');
            }
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
                    <View style={styles.headerCenter}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Note</Text>
                        {isAuthenticated && (
                            <TouchableOpacity
                                onPress={() => setShowShareModal(true)}
                                style={styles.shareButton}
                            >
                                <Text style={styles.shareIcon}>🔗</Text>
                            </TouchableOpacity>
                        )}
                    </View>
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

                        {/* Tags Input */}
                        <TextInput
                            style={[styles.tagsInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Tags (comma separated, e.g., work, important)"
                            placeholderTextColor={colors.placeholder}
                            value={tags}
                            onChangeText={setTags}
                        />

                        {/* Image Picker */}
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
                                <Image source={{ uri: image }} style={styles.imagePreviewImg} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setImage(null)}
                                >
                                    <Text style={styles.removeImageText}>✕ Remove</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    visible={showShareModal}
                    noteId={note.id}
                    onClose={() => setShowShareModal(false)}
                    colors={colors}
                />
            )}
        </SafeAreaView>
    );
};

// Share Modal Component
const ShareModal = ({ visible, noteId, onClose, colors }) => {
    const [email, setEmail] = useState('');
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            setSharing(true);
            await ApiService.shareNote(noteId, email.trim());
            Alert.alert('Success', `Note shared with ${email}!`);
            setEmail('');
            onClose();
        } catch (error) {
            console.error('Error sharing note:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to share note. Please try again.');
        } finally {
            setSharing(false);
        }
    };

    return (
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Share Note</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Enter the email address of the person you want to share this note with:
                </Text>
                <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: colors.border }]}
                        onPress={onClose}
                        disabled={sharing}
                    >
                        <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.modalShareButton, { backgroundColor: colors.primary }]}
                        onPress={handleShare}
                        disabled={sharing}
                    >
                        {sharing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={[styles.modalButtonText, { color: '#fff' }]}>Share</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    shareButton: {
        padding: 4,
    },
    shareIcon: {
        fontSize: 18,
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
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    imageButton: {
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    imageButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    imagePreview: {
        marginTop: 16,
        alignItems: 'center',
    },
    imagePreviewImg: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    removeImageButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    removeImageText: {
        color: '#fff',
        fontWeight: '600',
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
    // Modal styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    modalInput: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#f0f0f0',
    },
    modalShareButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditNoteScreen;
