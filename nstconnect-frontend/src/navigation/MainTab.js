import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from '../screens/home/FeedScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const MainTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray,
                tabBarIcon: ({ focused, color, size }) => {
                    const isFocused = Boolean(focused);
                    let iconName;

                    if (route.name === 'Feed') {
                        iconName = isFocused ? 'home' : 'home-outline';
                    } else if (route.name === 'Search') {
                        iconName = isFocused ? 'search' : 'search-outline';
                    } else if (route.name === 'Post') {
                        iconName = isFocused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Messages') {
                        iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Notifications') {
                        iconName = isFocused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Profile') {
                        iconName = isFocused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={Number(size) || 24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Feed" component={FeedScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Post" component={CreatePostScreen} />
            <Tab.Screen name="Messages" component={ChatListScreen} />
            <Tab.Screen name="Notifications" component={NotificationScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainTab;
