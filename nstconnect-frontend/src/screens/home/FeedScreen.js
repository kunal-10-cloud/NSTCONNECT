import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { colors, spacing, typography, shadows } from '../../theme';

const FeedScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleLike = async (postId) => {
        try {
            console.log(`[FeedScreen] Attempting to like post ${postId}`);
            await api.post(`/posts/${postId}/like`);
            console.log(`[FeedScreen] Successfully liked post ${postId}`);
            // Optimistic update
            setPosts(currentPosts =>
                currentPosts.map(post => {
                    if (post.id === postId) {
                        const isLiked = !post.isLiked;
                        return {
                            ...post,
                            isLiked,
                            _count: {
                                ...post._count,
                                likes: isLiked ? post._count.likes + 1 : post._count.likes - 1
                            }
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            console.error('[FeedScreen] Like error:', {
                postId,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            alert('Failed to like post. Please try again.');
            fetchPosts(); // Revert on error
        }
    };

    const handleComment = (postId) => {
        navigation.navigate('Comments', { postId });
    };

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
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Text style={styles.logoIconText}>N</Text>
                    </View>
                    <Text style={styles.logoText}>NST Connect</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onLike={handleLike}
                        onComment={handleComment}
                        navigation={navigation}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.list}
            />
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
        backgroundColor: colors.background,
    },
    list: {
        paddingVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
        ...shadows.small,
        zIndex: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    logoIconText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoText: {
        ...typography.h2,
        color: colors.primary,
        fontSize: 20,
    },
});

export default FeedScreen;

