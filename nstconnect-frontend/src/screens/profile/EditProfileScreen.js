import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const EditProfileScreen = ({ navigation }) => {
    const { userInfo, setUserInfo } = useContext(AuthContext);
    const [name, setName] = useState(userInfo?.name || '');
    const [headline, setHeadline] = useState(userInfo?.headline || '');
    const [bio, setBio] = useState(userInfo?.bio || '');
    const [skills, setSkills] = useState(userInfo?.skills || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await api.put('/users/profile', {
                name,
                headline,
                bio,
                skills
            });
            // Update local context
            // setUserInfo(response.data); // Ideally update context
            Alert.alert('Success', 'Profile updated');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView>
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

                    <Text style={styles.label}>Skills</Text>
                    <TextInput
                        style={styles.input}
                        value={skills}
                        onChangeText={setSkills}
                        placeholder="e.g. React, Node.js, Python"
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={Boolean(loading)}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
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
    form: {
        padding: spacing.m,
    },
    label: {
        ...typography.h3,
        marginBottom: spacing.xs,
        marginTop: spacing.m,
    },
    input: {
        backgroundColor: colors.white,
        padding: spacing.m,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditProfileScreen;
