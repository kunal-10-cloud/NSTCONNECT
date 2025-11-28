import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState(new Set());

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAcceptRequest = async (notification) => {
        if (!notification.friendRequestId) return;

        setProcessingIds(prev => new Set(prev).add(notification.id));
        try {
            await api.post(`/friends/accept/${notification.friendRequestId}`);
            // Remove notification from list
            setNotifications(curr => curr.filter(n => n.id !== notification.id));
            Alert.alert('Success', 'Friend request accepted!');
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept friend request');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
            });
        }
    };

    const handleRejectRequest = async (notification) => {
        if (!notification.friendRequestId) return;

        setProcessingIds(prev => new Set(prev).add(notification.id));
        try {
            await api.post(`/friends/reject/${notification.friendRequestId}`);
            // Remove notification from list
            setNotifications(curr => curr.filter(n => n.id !== notification.id));
        } catch (error) {
            console.error('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to reject friend request');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
            });
        }
    };

    const handlePress = async (notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification.id}/read`);
                setNotifications(curr =>
                    curr.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error(error);
            }
        }

        // Navigate to sender's profile for friend requests
        if (notification.type === 'FRIEND_REQUEST' && notification.sender) {
            navigation.navigate('UserProfile', { userId: notification.sender.id });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'FRIEND_REQUEST': return 'person-add';
            case 'FRIEND_ACCEPTED': return 'people';
            case 'LIKE': return 'heart';
            case 'COMMENT': return 'chatbubble';
            default: return 'notifications';
        }
    };

    const renderFriendRequestItem = (notification) => {
        const isProcessing = processingIds.has(notification.id);
        const sender = notification.sender;

        return (
            <View style={[styles.item, !notification.isRead && styles.unread]}>
                <TouchableOpacity
                    style={styles.mainContent}
                    onPress={() => handlePress(notification)}
                >
                    <Image
                        source={{ uri: sender?.profilePic || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.content}>
                        <Text style={styles.message}>
                            <Text style={styles.senderName}>{sender?.name || 'Someone'}</Text>
                            {' wants to connect with you'}
                        </Text>
                        {sender?.headline && (
                            <Text style={styles.headline}>{sender.headline}</Text>
                        )}
                        <Text style={styles.time}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {!notification.isRead && <View style={styles.dot} />}
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.acceptButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleAcceptRequest(notification)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.rejectButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleRejectRequest(notification)}
                        disabled={isProcessing}
                    >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderRegularItem = (notification) => (
        <TouchableOpacity
            style={[styles.item, !notification.isRead && styles.unread]}
            onPress={() => handlePress(notification)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(notification.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
            </View>
            {!notification.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        if (item.type === 'FRIEND_REQUEST' && item.sender) {
            return renderFriendRequestItem(item);
        }
        return renderRegularItem(item);
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
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notifications yet</Text>
                }
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
    },
    list: {
        padding: spacing.m,
    },
    item: {
        backgroundColor: colors.white,
        padding: spacing.m,
        marginBottom: spacing.s,
        borderRadius: 8,
        ...shadows.small,
    },
    unread: {
        backgroundColor: '#E3F2FD',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: spacing.m,
    },
    iconContainer: {
        marginRight: spacing.m,
    },
    content: {
        flex: 1,
    },
    message: {
        ...typography.body,
        marginBottom: 4,
    },
    senderName: {
        fontWeight: 'bold',
        color: colors.text,
    },
    headline: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    time: {
        ...typography.caption,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
        marginLeft: spacing.s,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.m,
        gap: spacing.s,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: spacing.s,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.white,
        paddingVertical: spacing.s,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    rejectButtonText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
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

export default NotificationScreen;
