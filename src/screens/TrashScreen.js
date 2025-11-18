import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';

const TrashScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [trashedNotes, setTrashedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState({});
    const [backendError, setBackendError] = useState(false);

    const loadTrashedNotes = useCallback(async () => {
        try {
            setLoading(true);
            setBackendError(false);
            const response = await ApiService.getTrash();
            if (response.success && response.data) {
                setTrashedNotes(response.data.notes || []);
            }
        } catch (error) {
            console.error('Error loading trash:', error);
            setBackendError(true);
            setTrashedNotes([]);
            // Don't show alert, just display message in UI
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTrashedNotes();
        }, [loadTrashedNotes])
    );

    const handleRestore = async (noteId) => {
        Alert.alert(
            'Restore Note',
            'Do you want to restore this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    onPress: async () => {
                        try {
                            setRestoring(prev => ({ ...prev, [noteId]: true }));
                            await ApiService.restoreNote(noteId);
                            Alert.alert('Success', 'Note restored successfully!');
                            // Reload trash
                            await loadTrashedNotes();
                        } catch (error) {
                            console.error('Error restoring note:', error);
                            Alert.alert('Error', 'Failed to restore note.');
                        } finally {
                            setRestoring(prev => ({ ...prev, [noteId]: false }));
                        }
                    }
                },
            ]
        );
    };

    const renderTrashItem = ({ item }) => (
        <View style={[styles.noteCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.noteContent}>
                <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title || 'Untitled'}
                </Text>
                <Text style={[styles.notePreview, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.content}
                </Text>
                <Text style={[styles.deleteDate, { color: colors.textSecondary }]}>
                    Deleted: {new Date(item.deletedAt).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.restoreButton, { backgroundColor: colors.primary }]}
                onPress={() => handleRestore(item.id)}
                disabled={restoring[item.id]}
            >
                {restoring[item.id] ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.restoreButtonText}>↺ Restore</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Trash</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : backendError ? (
                <View style={styles.centered}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        ⚠️ Trash Unavailable
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        Cloud trash feature requires backend connection.
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary, marginTop: 8 }]}>
                        Deleted notes are removed from your device.
                    </Text>
                </View>
            ) : trashedNotes.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        🗑️ Trash is empty
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        Deleted notes will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={trashedNotes}
                    renderItem={renderTrashItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    backButton: {
        minWidth: 70,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSpacer: {
        minWidth: 70,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 24,
        color: '#999',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
    listContainer: {
        padding: 16,
    },
    noteCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteContent: {
        flex: 1,
        marginRight: 12,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    notePreview: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    deleteDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    restoreButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    restoreButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TrashScreen;
