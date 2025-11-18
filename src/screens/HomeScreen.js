import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getNotes } from '../services/notesStorage';
import NoteCard from '../components/NoteCard';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
    const { colors, isDark, toggleTheme } = useTheme();
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'pinned'

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            const loadedNotes = await getNotes();
            setNotes(loadedNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load notes whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [loadNotes])
    );

    const filterAndSortNotes = useCallback(() => {
        let result = [...notes];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(note =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
        }

        // Sort notes
        result.sort((a, b) => {
            // Always show pinned notes first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            // Then sort by selected criteria
            if (sortBy === 'date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        setFilteredNotes(result);
    }, [notes, searchQuery, sortBy]);

    // Search and sort when notes or query changes
    React.useEffect(() => {
        filterAndSortNotes();
    }, [filterAndSortNotes]);

    const handleSortSelect = (sortOption) => {
        setSortBy(sortOption);
        setSortModalVisible(false);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? 'Try a different search term'
                    : 'Tap the + button to create your first note'
                }
            </Text>
        </View>
    );

    const renderNoteItem = ({ item }) => (
        <NoteCard
            note={item}
            onPress={() => navigation.navigate('EditNote', { note: item })}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Notes</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[styles.sortButton, { backgroundColor: isDark ? colors.border : '#f0f0f0' }]}
                        onPress={() => setSortModalVisible(true)}
                    >
                        <Text style={[styles.sortButtonText, { color: colors.text }]}>⇅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.themeButton}
                        onPress={toggleTheme}
                    >
                        <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddNote')}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.searchBackground }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search notes..."
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={[styles.clearButton, { color: colors.textTertiary }]}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredNotes}
                    renderItem={renderNoteItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Sort Modal */}
            <Modal
                visible={sortModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSortModalVisible(false)}
            >
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
                    activeOpacity={1}
                    onPress={() => setSortModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
                        <TouchableOpacity
                            style={[styles.modalOption, sortBy === 'date' && styles.modalOptionSelected,
                            { backgroundColor: sortBy === 'date' ? colors.primary : (isDark ? colors.border : '#f5f5f5') }]}
                            onPress={() => handleSortSelect('date')}
                        >
                            <Text style={[styles.modalOptionText, { color: sortBy === 'date' ? '#fff' : colors.text }]}>
                                📅 Date (Newest First)
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, sortBy === 'title' && styles.modalOptionSelected,
                            { backgroundColor: sortBy === 'title' ? colors.primary : (isDark ? colors.border : '#f5f5f5') }]}
                            onPress={() => handleSortSelect('title')}
                        >
                            <Text style={[styles.modalOptionText, { color: sortBy === 'title' ? '#fff' : colors.text }]}>
                                🔤 Title (A-Z)
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setSortModalVisible(false)}
                        >
                            <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 25, // Add more space from status bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sortButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortButtonText: {
        fontSize: 20,
        color: '#333',
    },
    themeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeButtonText: {
        fontSize: 20,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
        marginTop: -2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        fontSize: 20,
        color: '#999',
        paddingHorizontal: 8,
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalOption: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
    },
    modalOptionSelected: {
        backgroundColor: '#007AFF',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalCancel: {
        padding: 16,
        marginTop: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default HomeScreen;
