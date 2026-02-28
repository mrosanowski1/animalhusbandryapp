import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { apiFetch } from '@/utils/api';

export function UserMenuButton() {
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [visible, setVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const close = () => {
    setVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setResetError(null);
    setResetSuccess(false);
  };

  const handleResetPassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) return;
    setResetting(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      const response = await apiFetch('https://localhost:44311/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) throw new Error();
      setResetSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setResetError('Failed to update password. Please check your current password.');
    } finally {
      setResetting(false);
    }
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.icon }];
  const canSubmit = currentPassword.trim().length > 0 && newPassword.trim().length > 0;

  return (
    <>
      <TouchableOpacity style={styles.headerButton} onPress={() => setVisible(true)}>
        <IconSymbol name="person.circle.fill" size={26} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
          <ThemedView style={styles.menu}>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>

            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.email ?? '—'}</ThemedText>

            <ThemedText style={styles.infoLabel}>Permission Level</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.role ?? '—'}</ThemedText>

            <View style={[styles.divider, { backgroundColor: colors.icon }]} />

            <ThemedText type="subtitle" style={styles.sectionTitle}>Reset Password</ThemedText>

            <TextInput
              style={inputStyle}
              placeholder="Current password"
              placeholderTextColor={colors.icon}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={inputStyle}
              placeholder="New password"
              placeholderTextColor={colors.icon}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {resetError && <ThemedText style={styles.error}>{resetError}</ThemedText>}
            {resetSuccess && <ThemedText style={styles.success}>Password updated successfully.</ThemedText>}

            <TouchableOpacity
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={!canSubmit || resetting}
            >
              {resetting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Update Password</ThemedText>
              )}
            </TouchableOpacity>

          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  menu: {
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    marginBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 13,
  },
  success: {
    color: '#2e7d4f',
    marginBottom: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
