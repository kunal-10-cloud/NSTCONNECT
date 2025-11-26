import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const ProfileScreen = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                setProfile(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!profile) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.coverPhoto} />
                    <Image
                        source={{ uri: profile.profilePic || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
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
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
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
    editButton: {
        position: 'absolute',
        top: 130,
        right: spacing.m,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: 20,
        ...shadows.small,
    },
    editButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
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
    logoutButton: {
        margin: spacing.m,
        backgroundColor: colors.white,
        padding: spacing.m,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
        ...shadows.small,
    },
    logoutText: {
        color: colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProfileScreen;

