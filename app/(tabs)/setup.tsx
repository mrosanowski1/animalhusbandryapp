import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUser } from '@/context/UserContext';

export default function SetupScreen() {
  const { user } = useUser();
  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === 'admin') ?? false;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.heading}>Setup</ThemedText>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/enclosure/newEnclosure')}>
          <ThemedText style={styles.buttonText}>+ New Enclosure</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => router.push('/animal/newAnimal')}>
          <ThemedText style={styles.buttonText}>+ New Animal</ThemedText>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => router.push('/auth/registerUser')}>
            <ThemedText style={styles.buttonText}>+ Register New User</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heading: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#4a9e6e',
  },
  buttonTertiary: {
    backgroundColor: '#7a5ea4',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
