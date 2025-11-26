import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { colors } from '../../theme';

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
            await api.post(`/posts/${postId}/like`);
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
            console.error('Like error:', error);
            fetchPosts(); // Revert on error
        }
    };

    const handleComment = (postId) => {
        // Navigate to comment screen (to be implemented)
        console.log('Comment on', postId);
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
});

export default FeedScreen;

