import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, ListOrdered, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingVertical: 16,
          height: Platform.OS === 'ios' ? 94 : 62,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 8 : 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarActiveTintColor: '#4FACFE',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <ListOrdered size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
