import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme';
import { AuthContext } from '../../context/AuthContext';

const ChatScreen = ({ route }) => {
    const { userId, userName } = route.params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { userInfo } = React.useContext(AuthContext);
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
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [userId]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            const response = await api.post('/messages', {
                receiverId: userId,
                content: input
            });
            setMessages([...messages, response.data]);
            setInput('');
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }) => {
        const isMe = item.senderId === userInfo.id;
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Ionicons name="send" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        padding: spacing.m,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: spacing.m,
        borderRadius: 16,
        marginBottom: spacing.s,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        ...typography.body,
    },
    myMessageText: {
        color: colors.white,
    },
    theirMessageText: {
        color: colors.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: colors.lightGray,
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        marginRight: spacing.m,
        fontSize: 16,
    },
    sendButton: {
        padding: spacing.s,
    },
});

export default ChatScreen;
