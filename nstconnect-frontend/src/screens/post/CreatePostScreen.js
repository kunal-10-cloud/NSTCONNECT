import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!content.trim()) {
            return;
        }

        setLoading(true);
        try {
            await api.post('/posts', { content });
            setContent('');
            navigation.navigate('Feed');
        } catch (error) {
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity
                    style={[styles.postButton, !content.trim() && styles.disabledButton]}
                    onPress={handlePost}
                    disabled={Boolean(!content.trim() || loading)}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={styles.postButtonText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="What do you want to talk about?"
                multiline={true}
                value={content}
                onChangeText={setContent}
                autoFocus={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    headerTitle: {
        ...typography.h2,
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
    input: {
        ...typography.body,
        fontSize: 18,
        minHeight: 150,
        textAlignVertical: 'top',
    },
});

export default CreatePostScreen;
