import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const NoteCard = ({ note, onPress }) => {
    const { colors } = useTheme();
    // Get preview of content (first 100 characters)
    const getPreview = (content) => {
        if (!content) return 'No content';
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                {note.isPinned && (
                    <View style={styles.pinnedBadge}>
                        <Text style={styles.pinnedText}>📌 Pinned</Text>
                    </View>
                )}
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {note.title || 'Untitled'}
                </Text>
                <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={3}>
                    {getPreview(note.content)}
                </Text>

                {/* Image thumbnail if available */}
                {note.imageUrl && (
                    <View style={styles.imageThumbnailContainer}>
                        <Image source={{ uri: note.imageUrl }} style={styles.imageThumbnail} />
                    </View>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tagsContainer}
                    >
                        {note.tags.map((tag, index) => (
                            <View key={index} style={[styles.tagChip, { backgroundColor: colors.border }]}>
                                <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.footer}>
                    <Text style={[styles.date, { color: colors.textTertiary }]}>
                        {formatDate(note.createdAt)}
                    </Text>
                    {note.category && note.category !== 'general' && (
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(note.category) }]}>
                            <Text style={styles.categoryText}>{note.category}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getCategoryColor = (category) => {
    const colors = {
        work: '#FF6B6B',
        personal: '#4ECDC4',
        ideas: '#FFE66D',
        study: '#95E1D3',
        general: '#999',
    };
    return colors[category] || colors.general;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardContent: {
        flex: 1,
    },
    pinnedBadge: {
        marginBottom: 8,
    },
    pinnedText: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    preview: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    imageThumbnailContainer: {
        marginBottom: 8,
    },
    imageThumbnail: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tagChip: {
        backgroundColor: '#e8e8e8',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#555',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});

export default NoteCard;
