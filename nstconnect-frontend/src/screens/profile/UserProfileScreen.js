import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const UserProfileScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingRequest, setSendingRequest] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [userId])
    );

    const handleSendRequest = async () => {
        setSendingRequest(true);
        try {
            await api.post(`/friends/request/${userId}`);
            Alert.alert('Success', 'Connection request sent!');
            // Refresh profile to update button state
            fetchUserProfile();
        } catch (error) {
            console.error('Error sending friend request:', error);
            const errorMessage = error.response?.data?.error || 'Failed to send connection request';
            Alert.alert('Error', errorMessage);
        } finally {
            setSendingRequest(false);
        }
    };

    const renderConnectionButton = () => {
        if (!profile) return null;

        if (profile.isFriend) {
            // Already friends
            return (
                <TouchableOpacity style={styles.connectedButton} disabled>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.connectedButtonText}>Connected</Text>
                </TouchableOpacity>
            );
        }

        if (profile.hasPendingRequest) {
            // Pending request
            if (profile.requestSentByMe) {
                return (
                    <TouchableOpacity style={styles.pendingButton} disabled>
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.pendingButtonText}>Pending</Text>
                    </TouchableOpacity>
                );
            } else {
                // They sent you a request - show in notifications
                return (
                    <TouchableOpacity style={styles.pendingButton} disabled>
                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        <Text style={styles.pendingButtonText}>Request Received</Text>
                    </TouchableOpacity>
                );
            }
        }

        // Not friends, no pending request
        return (
            <TouchableOpacity
                style={styles.connectButton}
                onPress={handleSendRequest}
                disabled={sendingRequest}
            >
                {sendingRequest ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <>
                        <Ionicons name="person-add" size={20} color={colors.white} />
                        <Text style={styles.connectButtonText}>Connect</Text>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorText}>User not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.coverPhoto} />
                    <Image
                        source={{ uri: profile.profilePic || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.headline}>{profile.headline || profile.department}</Text>
                    <Text style={styles.location}>{profile.department} • Class of {profile.graduationYear}</Text>

                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statCount}>{profile._count?.friends || 0}</Text>
                            <Text style={styles.statLabel}>Connections</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statCount}>{profile._count?.posts || 0}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                    </View>

                    {/* Connection Button */}
                    <View style={styles.actionButtonContainer}>
                        {renderConnectionButton()}
                    </View>

                    {profile.bio && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.sectionContent}>{profile.bio}</Text>
                        </View>
                    )}

                    {profile.skills && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            <View style={styles.skillsContainer}>
                                {profile.skills.split(',').map((skill, index) => (
                                    <View key={index} style={styles.skillChip}>
                                        <Text style={styles.skillText}>{skill.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {(profile.linkedinUrl || profile.githubUrl) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Links</Text>
                            <View style={styles.linksContainer}>
                                {profile.linkedinUrl && (
                                    <TouchableOpacity style={styles.linkButton}>
                                        <Ionicons name="logo-linkedin" size={20} color={colors.primary} />
                                        <Text style={styles.linkText}>LinkedIn</Text>
                                    </TouchableOpacity>
                                )}
                                {profile.githubUrl && (
                                    <TouchableOpacity style={styles.linkButton}>
                                        <Ionicons name="logo-github" size={20} color={colors.text} />
                                        <Text style={styles.linkText}>GitHub</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    errorText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    header: {
        backgroundColor: colors.white,
        marginBottom: spacing.m,
        position: 'relative',
    },
    coverPhoto: {
        height: 120,
        backgroundColor: colors.primary,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.white,
        position: 'absolute',
        top: 60,
        left: spacing.m,
    },
    info: {
        backgroundColor: colors.white,
        padding: spacing.m,
        paddingTop: 70,
        marginBottom: spacing.m,
        borderRadius: 12,
        marginHorizontal: spacing.s,
        ...shadows.small,
    },
    name: {
        ...typography.h1,
        marginBottom: 4,
        fontSize: 24,
    },
    headline: {
        ...typography.body,
        marginBottom: 4,
        fontSize: 16,
    },
    location: {
        ...typography.caption,
        marginBottom: spacing.m,
        color: colors.textSecondary,
    },
    stats: {
        flexDirection: 'row',
        marginBottom: spacing.m,
        paddingBottom: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    statItem: {
        marginRight: spacing.l,
        alignItems: 'center',
    },
    statCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    actionButtonContainer: {
        marginBottom: spacing.m,
    },
    connectButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: 8,
        gap: spacing.xs,
    },
    connectButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
        marginLeft: spacing.xs,
    },
    connectedButton: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: 8,
        gap: spacing.xs,
    },
    connectedButtonText: {
        color: colors.success,
        fontWeight: '600',
        fontSize: 16,
        marginLeft: spacing.xs,
    },
    pendingButton: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.lightGray,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: 8,
        gap: spacing.xs,
    },
    pendingButtonText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 16,
        marginLeft: spacing.xs,
    },
    section: {
        marginTop: spacing.m,
        paddingTop: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.s,
        fontSize: 18,
    },
    sectionContent: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.xs,
    },
    skillChip: {
        backgroundColor: colors.lightGray,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        marginRight: spacing.s,
        marginBottom: spacing.s,
    },
    skillText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '500',
    },
    linksContainer: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: 8,
        marginRight: spacing.s,
    },
    linkText: {
        marginLeft: spacing.xs,
        ...typography.body,
        fontWeight: '600',
    },
});

export default UserProfileScreen;
