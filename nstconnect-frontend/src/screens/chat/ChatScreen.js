import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography, shadows } from '../../theme';
import { AuthContext } from '../../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { userInfo } = useContext(AuthContext);
    const flatListRef = useRef();

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${userId}`);
            setMessages(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [userId]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            senderId: userInfo.id,
            receiverId: userId,
            content: input,
            createdAt: new Date().toISOString(),
            pending: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setInput('');

        try {
            const response = await api.post('/messages', {
                receiverId: userId,
                content: tempMessage.content
            });
            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
        } catch (error) {
            console.error(error);
            // Mark as failed or remove
        }
    };

    const renderItem = ({ item }) => {
        const isMe = item.senderId === userInfo.id;
        return (
            <View style={[styles.messageWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
                {!isMe && (
                    <View style={styles.avatarPlaceholder}>
                        {/* Ideally show avatar here if available */}
                    </View>
                )}
                <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{userName}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                        multiline
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={!input.trim()}>
                        <Ionicons name="send" size={24} color={input.trim() ? colors.primary : colors.gray} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    backButton: {
        marginRight: spacing.m,
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 18,
    },
    list: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: spacing.s,
        alignItems: 'flex-end',
    },
    myWrapper: {
        justifyContent: 'flex-end',
    },
    theirWrapper: {
        justifyContent: 'flex-start',
    },
    avatarPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.lightGray,
        marginRight: 8,
    },
    messageContainer: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    myMessage: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
        ...shadows.small,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: colors.white,
    },
    theirMessageText: {
        color: colors.text,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirTimeText: {
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    input: {
        flex: 1,
        backgroundColor: colors.lightGray,
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        marginRight: spacing.m,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        padding: spacing.s,
    },
});

export default ChatScreen;
