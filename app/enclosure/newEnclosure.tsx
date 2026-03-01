import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';

export default function NewEnclosureScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { longitude: initLongitude, latitude: initLatitude } =
    useLocalSearchParams<{ longitude?: string; latitude?: string }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longitude, setLongitude] = useState(initLongitude ?? '');
  const [latitude, setLatitude] = useState(initLatitude ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/Enclosures`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          location: {
            longitude: parseFloat(longitude) || 0,
            latitude: parseFloat(latitude) || 0,
          },
          animals: [],
          jobs: [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create enclosure');
      router.back();
    } catch {
      setError('Failed to create enclosure. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.textInput, { color: colors.text, borderColor: colors.icon }];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.heading}>New Enclosure</ThemedText>

          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Enclosure name"
            placeholderTextColor={colors.icon}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[inputStyle, styles.multiline]}
            placeholder="Optional description"
            placeholderTextColor={colors.icon}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <ThemedText style={styles.label}>Longitude</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 50"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            value={longitude}
            onChangeText={setLongitude}
          />

          <ThemedText style={styles.label}>Latitude</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 50"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            value={latitude}
            onChangeText={setLatitude}
          />

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Create Enclosure</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={[styles.cancelButtonText, { color: colors.icon }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  multiline: {
    minHeight: 80,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});
