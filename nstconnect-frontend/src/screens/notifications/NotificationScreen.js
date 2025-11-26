import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const NotificationScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handlePress = async (notification) => {
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
        // Navigate based on type (e.g., to Post or Profile)
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, !item.isRead && styles.unread]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(item.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.m,
        marginBottom: spacing.s,
        borderRadius: 8,
        ...shadows.small,
    },
    unread: {
        backgroundColor: '#E3F2FD', // Light blue
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
    emptyText: {
        textAlign: 'center',
        marginTop: spacing.xl,
        color: colors.textSecondary,
    },
});

export default NotificationScreen;
