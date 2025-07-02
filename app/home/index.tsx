import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

const Tab = createBottomTabNavigator();

function GroupsScreen({ handleAddExpense }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(list);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const totalOwed = expenses.reduce((sum, e) => e.status === 'owed' ? sum + e.amount : sum, 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.summary}>You are owed ${totalOwed.toFixed(2)}</Text>

      {expenses.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.amount}>
            {item.status === 'owed' && `You are owed $${item.amount}`}
            {item.status === 'owe' && `You owe $${item.amount}`}
            {item.status === 'split' && `Split: $${item.amount}`}
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

function FriendsScreen() {
  return (
    <View style={styles.screen}>
      <Text>Friends screen (coming soon)</Text>
    </View>
  );
}

function ActivityScreen() {
  return (
    <View style={styles.screen}>
      <Text>Activity screen (coming soon)</Text>
    </View>
  );
}

function AccountScreen({ onLogout }) {
  return (
    <View style={styles.screen}>
      <Text>Account screen</Text>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeTabs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const handleAddExpense = () => {
    router.push('/add-expense');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon;
          switch (route.name) {
            case 'Groups':
              icon = 'people';
              break;
            case 'Friends':
              icon = 'person-add';
              break;
            case 'Activity':
              icon = 'bar-chart';
              break;
            case 'Account':
              icon = 'settings';
              break;
          }
          return <Ionicons name={icon} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Groups">
        {() => <GroupsScreen handleAddExpense={handleAddExpense} />}
      </Tab.Screen>
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Account">
        {() => <AccountScreen onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  summary: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '600' },
  amount: { marginTop: 6, color: '#666' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: 'tomato',
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
