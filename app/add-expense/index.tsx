import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { auth } from '../../firebase';

export default function AddExpenseScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();

  const handleAdd = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return Alert.alert('Not logged in');

      if (!name.trim() || !amount) {
        return Alert.alert('Please enter both name and amount');
      }

      await addDoc(collection(db, 'expenses'), {
        name: name.trim(),
        amount: parseFloat(amount),
        type: 'group',
        status: 'owed',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      router.replace('/home');
    } catch (err) {
      Alert.alert('Failed to add expense', err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Add New Expense</Text>
        <TextInput
          placeholder="Expense name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={{ color: '#888' }}>← Cancel and go back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00a87e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backLink: { marginTop: 16, alignItems: 'center' },
});
