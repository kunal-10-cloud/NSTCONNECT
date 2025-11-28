import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const EditProfileScreen = ({ navigation }) => {
    const { userInfo, setUserInfo } = useContext(AuthContext);
    const [name, setName] = useState(userInfo?.name || '');
    const [headline, setHeadline] = useState(userInfo?.headline || '');
    const [bio, setBio] = useState(userInfo?.bio || '');
    const [skills, setSkills] = useState(userInfo?.skills || '');
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setProfilePic(result.assets[0]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                name,
                headline,
                bio,
                skills,
                profilePic: profilePic ? `data:image/jpeg;base64,${profilePic.base64}` : userInfo.profilePic
            };

            const response = await api.put('/users/profile', payload);
            setUserInfo(response.data); // Update context
            Alert.alert('Success', 'Profile updated');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: profilePic ? profilePic.uri : (userInfo?.profilePic || 'https://via.placeholder.com/100') }}
                            style={styles.avatar}
                        />
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={20} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />

                    <Text style={styles.label}>Headline</Text>
                    <TextInput
                        style={styles.input}
                        value={headline}
                        onChangeText={setHeadline}
                        placeholder="e.g. Software Engineer at Google"
                    />

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        multiline={true}
                        numberOfLines={4}
                        placeholder="Tell us about yourself..."
                    />

                    <Text style={styles.label}>Skills (comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={skills}
                        onChangeText={setSkills}
                        placeholder="e.g. React, Node.js, Python"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 18,
    },
    saveButtonText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    imageSection: {
        alignItems: 'center',
        padding: spacing.l,
        backgroundColor: colors.background,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.white,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.white,
    },
    changePhotoText: {
        marginTop: spacing.s,
        color: colors.primary,
        fontWeight: '600',
    },
    form: {
        padding: spacing.m,
    },
    label: {
        ...typography.h3,
        fontSize: 14,
        marginBottom: spacing.xs,
        marginTop: spacing.m,
        color: colors.textSecondary,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: spacing.s,
        fontSize: 16,
        color: colors.text,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default EditProfileScreen;
