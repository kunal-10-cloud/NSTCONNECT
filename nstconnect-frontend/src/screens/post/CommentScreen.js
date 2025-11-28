import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const CommentScreen = ({ route, navigation }) => {
    const { postId } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSend = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            console.log(`[CommentScreen] Posting comment to post ${postId}`);
            const response = await api.post(`/posts/${postId}/comment`, {
                content: newComment
            });
            console.log(`[CommentScreen] Comment posted successfully`);
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('[CommentScreen] Comment error:', {
                postId,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            alert('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.commentItem}>
            <Image
                source={{ uri: item.author.profilePic || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
            />
            <View style={styles.commentContent}>
                <Text style={styles.name}>{item.author.name}</Text>
                <Text style={styles.text}>{item.content}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comments</Text>
            </View>

            <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No comments yet</Text>}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newComment.trim() && styles.disabledButton]}
                        onPress={handleSend}
                        disabled={!newComment.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="send" size={24} color={newComment.trim() ? colors.primary : colors.gray} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    backButton: {
        marginRight: spacing.m,
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 18,
    },
    list: {
        padding: spacing.m,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: spacing.m,
        backgroundColor: colors.white,
        padding: spacing.m,
        borderRadius: 8,
        ...shadows.small,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.m,
    },
    commentContent: {
        flex: 1,
    },
    name: {
        ...typography.h3,
        fontSize: 14,
        marginBottom: 2,
    },
    text: {
        ...typography.body,
        marginBottom: 4,
    },
    time: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    input: {
        flex: 1,
        backgroundColor: colors.lightGray,
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        marginRight: spacing.m,
        maxHeight: 100,
    },
    sendButton: {
        padding: spacing.s,
    },
    disabledButton: {
        opacity: 0.5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: spacing.xl,
        color: colors.textSecondary,
    },
});

export default CommentScreen;
