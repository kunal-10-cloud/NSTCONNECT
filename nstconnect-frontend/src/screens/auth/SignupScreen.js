import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, typography, shadows } from '../../theme';

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [gradYear, setGradYear] = useState('');

    const { signup, isLoading } = useContext(AuthContext);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        try {
            await signup(name, email, password, department, gradYear);
        } catch (e) {
            Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.title}>Join NST Connect</Text>
                    <Text style={styles.subtitle}>Create your alumni profile</Text>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Department (e.g. CSE)"
                            value={department}
                            onChangeText={setDepartment}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Graduation Year (e.g. 2024)"
                            value={gradYear}
                            onChangeText={setGradYear}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={Boolean(isLoading)}>
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: spacing.l,
    },
    title: {
        ...typography.h1,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
        color: colors.textSecondary,
    },
    form: {
        backgroundColor: colors.white,
        padding: spacing.l,
        borderRadius: 12,
        ...shadows.medium,
    },
    input: {
        backgroundColor: colors.lightGray,
        padding: spacing.m,
        borderRadius: 8,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: colors.border,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.s,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.l,
    },
    footerText: {
        ...typography.body,
    },
    link: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
