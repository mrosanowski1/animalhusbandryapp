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
import { router } from 'expo-router';

import { useUser } from '@/context/UserContext';
import { apiFetch } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';
import { deleteToken } from '@/utils/storage';

export function UserMenuButton() {
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [visible, setVisible] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    newPassword === confirmPassword;

  const close = () => {
    setVisible(false);
    setAccordionOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    setResetSuccess(false);
  };

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } finally {
      await deleteToken();
      router.replace('/login');
    }
  };

  const handleResetPassword = async () => {
    if (!canSubmit) return;
    setResetting(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      const response = await apiFetch(`${API_BASE_URL}/Auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) throw new Error();
      setResetSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setResetError('Failed to update password. Please check your current password.');
    } finally {
      setResetting(false);
    }
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.icon }];

  return (
    <>
      <TouchableOpacity style={styles.headerButton} onPress={() => setVisible(true)}>
        <IconSymbol name="person.circle.fill" size={26} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <ThemedView style={styles.menu}>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>

            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.email ?? '—'}</ThemedText>

            <ThemedText style={styles.infoLabel}>Permission Level</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.role ?? '—'}</ThemedText>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.icon }]} />

            {/* Accordion header */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => {
                setAccordionOpen((v) => !v);
                setResetError(null);
                setResetSuccess(false);
              }}
              activeOpacity={0.7}
            >
              <ThemedText type="subtitle">Reset Password</ThemedText>
              <ThemedText style={{ color: colors.icon }}>{accordionOpen ? '▲' : '▼'}</ThemedText>
            </TouchableOpacity>

            {accordionOpen && (
              <View style={styles.accordionBody}>
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
                <TextInput
                  style={[inputStyle, passwordMismatch && styles.inputError]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                {passwordMismatch && (
                  <ThemedText style={styles.error}>Passwords do not match.</ThemedText>
                )}
                {resetError && <ThemedText style={styles.error}>{resetError}</ThemedText>}
                {resetSuccess && (
                  <ThemedText style={styles.success}>Password updated successfully.</ThemedText>
                )}

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
              </View>
            )}

          </ThemedView>
          </TouchableOpacity>
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
  logoutButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#c0392b',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionBody: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  inputError: {
    borderColor: 'red',
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
