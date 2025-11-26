import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../theme';

const PostCard = ({ post, onLike, onComment, navigation }) => {
    const handleUserPress = () => {
        if (navigation && post.author?.id) {
            navigation.navigate('UserProfile', { userId: post.author.id });
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleUserPress} style={styles.headerContent}>
                    <Image
                        source={{ uri: post.author.profilePic || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.name}>{post.author.name}</Text>
                        <Text style={styles.headline}>{post.author.headline || post.author.department}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.content}>{post.content}</Text>

            {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
            )}

            <View style={styles.stats}>
                <Text style={styles.statsText}>{post._count?.likes || 0} Likes</Text>
                <Text style={styles.statsText}>{post._count?.comments || 0} Comments</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onLike(post.id)}>
                    <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={22} color={post.isLiked ? colors.error : colors.textSecondary} />
                    <Text style={[styles.actionText, post.isLiked && { color: colors.error }]}>Like</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post.id)}>
                    <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
                    <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={22} color={colors.textSecondary} />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        marginBottom: spacing.m,
        marginHorizontal: spacing.s,
        padding: spacing.m,
        borderRadius: 12,
        ...shadows.small,
    },
    header: {
        marginBottom: spacing.m,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: spacing.m,
        borderWidth: 2,
        borderColor: colors.lightGray,
    },
    headerText: {
        flex: 1,
    },
    name: {
        ...typography.h3,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    headline: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    content: {
        ...typography.body,
        marginBottom: spacing.m,
        lineHeight: 20,
        color: colors.text,
    },
    postImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: spacing.m,
        backgroundColor: colors.lightGray,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
        paddingBottom: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    statsText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: spacing.s,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
    },
    actionText: {
        marginLeft: 6,
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
});

export default PostCard;

