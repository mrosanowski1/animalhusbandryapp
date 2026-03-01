import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';

const ROLES = ['Admin', 'Staff', 'ReadOnly'];

export default function RegisterUserScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    role !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });
      if (!response.ok) throw new Error('Failed to register user');
      router.back();
    } catch {
      setError('Failed to register user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.textInput, { color: colors.text, borderColor: colors.icon }];
  const selectorStyle = [styles.selector, { borderColor: colors.icon }];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.heading}>Register New User</ThemedText>

          <ThemedText style={styles.label}>First Name *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="First name"
            placeholderTextColor={colors.icon}
            value={firstName}
            onChangeText={setFirstName}
            autoFocus
          />

          <ThemedText style={styles.label}>Last Name *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Last name"
            placeholderTextColor={colors.icon}
            value={lastName}
            onChangeText={setLastName}
          />

          <ThemedText style={styles.label}>Email Address *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="email@example.com"
            placeholderTextColor={colors.icon}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <ThemedText style={styles.label}>Initial Password *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Initial password"
            placeholderTextColor={colors.icon}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <ThemedText style={styles.label}>Permission Level *</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setRoleModalVisible(true)}>
            <ThemedText style={role ? undefined : { color: colors.icon }}>
              {role ?? 'Select permission level…'}
            </ThemedText>
          </TouchableOpacity>

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Register User</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={[styles.cancelButtonText, { color: colors.icon }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={roleModalVisible} transparent animationType="fade" onRequestClose={() => setRoleModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setRoleModalVisible(false)}>
          <ThemedView style={styles.dropdownCard}>
            <ThemedText type="subtitle" style={styles.dropdownTitle}>Select Permission Level</ThemedText>
            <FlatList
              data={ROLES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomColor: colors.icon }]}
                  onPress={() => { setRole(item); setRoleModalVisible(false); }}
                >
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.dropdownCancel, { borderColor: colors.icon }]}
              onPress={() => setRoleModalVisible(false)}
            >
              <ThemedText style={{ color: colors.icon }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40 },
  heading: { marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  error: { color: 'red', marginBottom: 16 },
  submitButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: { paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  dropdownCard: {
    borderRadius: 12,
    padding: 20,
  },
  dropdownTitle: { marginBottom: 12 },
  dropdownItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownCancel: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
});
