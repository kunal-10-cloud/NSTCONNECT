import React, { useContext, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const ProfileScreen = ({ navigation }) => {
    const { userInfo, setUserInfo, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ friends: 0, posts: 0 });

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile');
            setUserInfo(response.data);
            setStats(response.data._count || { friends: 0, posts: 0 });
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const renderSkillChip = (skill) => (
        <View key={skill} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill.trim()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Banner & Header */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: 'https://picsum.photos/800/200' }} // Random banner for now
                        style={styles.banner}
                    />
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Ionicons name="pencil" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.profileInfo}>
                        <Image
                            source={{ uri: userInfo?.profilePic || 'https://via.placeholder.com/100' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.name}>{userInfo?.name}</Text>
                        <Text style={styles.headline}>{userInfo?.headline || 'Student at NST'}</Text>
                        <Text style={styles.location}>New Delhi, India • {stats.friends} connections</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.primaryButton}>
                                <Text style={styles.primaryButtonText}>Open to work</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>Add section</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Dashboard / Analytics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Analytics</Text>
                    <View style={styles.analyticsContainer}>
                        <TouchableOpacity style={styles.analyticsItem}>
                            <Ionicons name="people" size={24} color={colors.textSecondary} />
                            <View style={styles.analyticsText}>
                                <Text style={styles.analyticsValue}>12 profile views</Text>
                                <Text style={styles.analyticsLabel}>Discover who's viewed your profile.</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.analyticsItem}>
                            <Ionicons name="bar-chart" size={24} color={colors.textSecondary} />
                            <View style={styles.analyticsText}>
                                <Text style={styles.analyticsValue}>{stats.posts} posts</Text>
                                <Text style={styles.analyticsLabel}>Check your post impressions.</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                            <Ionicons name="pencil" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.bio}>{userInfo?.bio || 'No bio added yet.'}</Text>
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                            <Ionicons name="add" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.skillsContainer}>
                        {userInfo?.skills ? (
                            userInfo.skills.split(',').map(renderSkillChip)
                        ) : (
                            <Text style={styles.emptyText}>Add skills to showcase your expertise</Text>
                        )}
                    </View>
                </View>

                {/* Resources */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resources</Text>
                    <TouchableOpacity style={styles.resourceItem}>
                        <Ionicons name="bookmark" size={24} color={colors.text} />
                        <View style={styles.resourceText}>
                            <Text style={styles.resourceTitle}>My items</Text>
                            <Text style={styles.resourceSubtitle}>Keep track of your saved jobs and posts.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resourceItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                        <View style={styles.resourceText}>
                            <Text style={[styles.resourceTitle, { color: colors.error }]}>Logout</Text>
                            <Text style={styles.resourceSubtitle}>Sign out of your account</Text>
                        </View>
                    </TouchableOpacity>
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
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    headerContainer: {
        backgroundColor: colors.white,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    banner: {
        width: '100%',
        height: 100,
        backgroundColor: colors.primary,
    },
    editButton: {
        position: 'absolute',
        top: 110,
        right: spacing.m,
        backgroundColor: colors.white,
        padding: 8,
        borderRadius: 20,
        ...shadows.small,
        zIndex: 1,
    },
    profileInfo: {
        padding: spacing.m,
        marginTop: -50,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.white,
        marginBottom: spacing.s,
    },
    name: {
        ...typography.h2,
        marginBottom: 2,
    },
    headline: {
        ...typography.body,
        color: colors.text,
        marginBottom: 4,
    },
    location: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.m,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.s,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: spacing.m,
        borderRadius: 20,
        marginRight: spacing.s,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: spacing.m,
        borderRadius: 20,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        backgroundColor: colors.white,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.s,
    },
    analyticsContainer: {
        marginTop: spacing.s,
    },
    analyticsItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.s,
    },
    analyticsText: {
        marginLeft: spacing.m,
        flex: 1,
    },
    analyticsValue: {
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.text,
    },
    analyticsLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGray,
        marginVertical: spacing.s,
    },
    bio: {
        ...typography.body,
        lineHeight: 20,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillChip: {
        backgroundColor: colors.lightGray,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        ...typography.caption,
        fontWeight: '500',
    },
    emptyText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    resourceText: {
        marginLeft: spacing.m,
    },
    resourceTitle: {
        fontWeight: '600',
        fontSize: 14,
        color: colors.text,
    },
    resourceSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});

export default ProfileScreen;
