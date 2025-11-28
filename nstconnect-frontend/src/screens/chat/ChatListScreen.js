import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const ChatListScreen = ({ navigation }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFriends = async () => {
        try {
            // For MVP, we'll just show all friends. 
            // Ideally, we'd merge this with recent conversations.
            const response = await api.get('/friends');
            setFriends(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Chat', { userId: item.id, userName: item.name })}
        >
            <Image
                source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.preview}>{item.headline || 'Tap to chat'}</Text>
            </View>
            <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
            </View>
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No connections yet.</Text>
                        <Text style={styles.emptySubText}>Connect with people to start chatting!</Text>
                    </View>
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
    header: {
        padding: spacing.m,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    headerTitle: {
        ...typography.h2,
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
        borderRadius: 12,
        ...shadows.small,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: spacing.m,
    },
    content: {
        flex: 1,
    },
    name: {
        ...typography.h3,
        fontSize: 16,
        marginBottom: 2,
    },
    preview: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    arrow: {
        justifyContent: 'center',
    },
    arrowText: {
        fontSize: 24,
        color: colors.gray,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.s,
    },
    emptySubText: {
        ...typography.body,
        color: colors.textSecondary,
    },
});

export default ChatListScreen;
