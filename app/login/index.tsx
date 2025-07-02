import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: '',
	webClientId: '',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    const loginWithGoogle = async () => {
      if (response?.type === 'success') {
        const id_token =
          response.authentication?.idToken || response.params?.id_token;

        if (!id_token) {
          console.error('No ID token found in response.');
          Alert.alert('Login Error', 'Could not get ID token from Google');
          return;
        }

        const credential = GoogleAuthProvider.credential(id_token);
        try {
          const result = await signInWithCredential(auth, credential);
          console.log('Firebase sign-in complete', result.user.email);
          router.replace('/home');
        } catch (err) {
          console.error('Firebase login error:', err.message);
          Alert.alert('Firebase Login Failed', err.message);
        }
      }
    };

    loginWithGoogle();
  }, [response]);

  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User logged in:', user.email);
        router.replace('/home');
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button
        title="Login with Email"
        onPress={() =>
          signInWithEmailAndPassword(auth, email, password)
            .then(() => router.replace('/home'))
            .catch((err) =>
              Alert.alert('Login failed', err.message || 'Unknown error')
            )
        }
      />
      <View style={{ marginVertical: 10 }} />
      <Button
        title="Sign in with Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
});
