import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const SearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendingRequests, setSendingRequests] = useState(new Set());

    const searchUsers = async (text) => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/users/search?q=${text}`);
            setResults(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (userId) => {
        setSendingRequests(prev => new Set(prev).add(userId));
        try {
            await api.post(`/friends/request/${userId}`);
            Alert.alert('Success', 'Connection request sent!');
            // Refresh search results to update button state
            searchUsers(query);
        } catch (error) {
            console.error('Error sending request:', error);
            const errorMessage = error.response?.data?.error || 'Failed to send connection request';
            Alert.alert('Error', errorMessage);
        } finally {
            setSendingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const handleUserPress = (userId) => {
        navigation.navigate('UserProfile', { userId });
    };

    const renderConnectionButton = (item) => {
        const isSending = sendingRequests.has(item.id);

        if (item.isFriend) {
            // Already friends - show checkmark, disabled
            return (
                <TouchableOpacity style={styles.connectedButton} disabled>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </TouchableOpacity>
            );
        }

        if (item.hasPendingRequest) {
            // Pending request - show clock icon, disabled
            return (
                <TouchableOpacity style={styles.pendingButton} disabled>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            );
        }

        // Not friends, no pending request - show add button
        return (
            <TouchableOpacity
                style={styles.connectButton}
                onPress={(e) => {
                    e.stopPropagation();
                    sendRequest(item.id);
                }}
                disabled={isSending}
            >
                {isSending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <Ionicons name="person-add" size={20} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleUserPress(item.id)}
        >
            <Image
                source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.headline}>{item.headline || item.department}</Text>
            </View>
            {renderConnectionButton(item)}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="Search alumni, students..."
                    value={query}
                    onChangeText={searchUsers}
                />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        query.length > 0 ? (
                            <Text style={styles.emptyText}>No users found</Text>
                        ) : (
                            <Text style={styles.emptyText}>Search for people</Text>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: spacing.m,
        padding: spacing.s,
        borderRadius: 8,
        ...shadows.small,
    },
    input: {
        flex: 1,
        marginLeft: spacing.s,
        fontSize: 16,
    },
    list: {
        paddingHorizontal: spacing.m,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.m,
        marginBottom: spacing.s,
        borderRadius: 8,
        ...shadows.small,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: spacing.m,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        ...typography.h3,
        fontSize: 16,
    },
    headline: {
        ...typography.caption,
    },
    connectButton: {
        padding: spacing.s,
    },
    connectedButton: {
        padding: spacing.s,
        opacity: 0.6,
    },
    pendingButton: {
        padding: spacing.s,
        opacity: 0.6,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: spacing.xl,
        color: colors.textSecondary,
    },
});

export default SearchScreen;
