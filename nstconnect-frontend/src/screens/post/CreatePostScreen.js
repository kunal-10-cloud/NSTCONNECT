import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !image) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                content,
                image: image ? `data:image/jpeg;base64,${image.base64}` : null
            };

            await api.post('/posts', payload);
            setContent('');
            setImage(null);
            navigation.navigate('Feed');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create post');
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
                <TouchableOpacity
                    style={[styles.postButton, (!content.trim() && !image) && styles.disabledButton]}
                    onPress={handlePost}
                    disabled={Boolean((!content.trim() && !image) || loading)}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={styles.postButtonText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="What do you want to talk about?"
                    multiline={true}
                    value={content}
                    onChangeText={setContent}
                    autoFocus={true}
                />

                {image && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                            <Ionicons name="close-circle" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={24} color={colors.primary} />
                    <Text style={styles.mediaButtonText}>Add Photo</Text>
                </TouchableOpacity>
            </View>
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
    postButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.s,
        borderRadius: 20,
    },
    disabledButton: {
        backgroundColor: colors.gray,
    },
    postButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        padding: spacing.m,
    },
    input: {
        ...typography.body,
        fontSize: 18,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: spacing.m,
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: spacing.m,
    },
    imagePreview: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: colors.lightGray,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaButtonText: {
        marginLeft: spacing.s,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default CreatePostScreen;
