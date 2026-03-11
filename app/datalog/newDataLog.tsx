import { useEffect, useState } from 'react';
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
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';

interface EnclosureSummary {
  id: string;
  name: string;
}

interface AnimalSummary {
  id: string;
  name: string;
}

const NONE_ITEM = { id: '', name: 'None' };

function DropdownModal<T extends { id: string; name: string }>({
  visible,
  title,
  items,
  onSelect,
  onClose,
  loading,
}: {
  visible: boolean;
  title: string;
  items: T[];
  onSelect: (item: T | null) => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const allItems = [NONE_ITEM as T, ...items];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <ThemedView style={styles.dropdownCard}>
          <ThemedText type="subtitle" style={styles.dropdownTitle}>{title}</ThemedText>
          {loading ? (
            <ActivityIndicator size="small" style={styles.dropdownLoader} />
          ) : (
            <FlatList
              data={allItems}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomColor: colors.icon }]}
                  onPress={() => {
                    onSelect(item.id === '' ? null : item);
                    onClose();
                  }}
                >
                  <ThemedText style={item.id === '' ? { color: colors.icon } : undefined}>
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={[styles.dropdownCancel, { borderColor: colors.icon }]} onPress={onClose}>
            <ThemedText style={{ color: colors.icon }}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
}

export default function NewDataLogScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [fields, setFields] = useState<string[]>(['']);
  const [enclosure, setEnclosure] = useState<EnclosureSummary | null>(null);
  const [animal, setAnimal] = useState<AnimalSummary | null>(null);

  const [enclosures, setEnclosures] = useState<EnclosureSummary[]>([]);
  const [enclosuresLoading, setEnclosuresLoading] = useState(true);
  const [animals, setAnimals] = useState<AnimalSummary[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(true);

  const [enclosureModalVisible, setEnclosureModalVisible] = useState(false);
  const [animalModalVisible, setAnimalModalVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/Enclosures`)
      .then((res) => res.json())
      .then((data: EnclosureSummary[]) => setEnclosures(data))
      .catch(() => setEnclosures([]))
      .finally(() => setEnclosuresLoading(false));

    apiFetch(`${API_BASE_URL}/Animals`)
      .then((res) => res.json())
      .then((data: AnimalSummary[]) => setAnimals(data))
      .catch(() => setAnimals([]))
      .finally(() => setAnimalsLoading(false));
  }, []);

  const updateField = (index: number, value: string) =>
    setFields((prev) => prev.map((f, i) => (i === index ? value : f)));

  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));

  const canSubmit = name.trim().length > 0 && fields.some((f) => f.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/datalogs`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          animalId: animal?.id ?? null,
          enclosureId: enclosure?.id ?? null,
          fields: fields.map((f) => f.trim()).filter((f) => f.length > 0),
        }),
      });
      if (!response.ok) throw new Error('Failed to create data log');
      router.back();
    } catch {
      setError('Failed to create data log. Please try again.');
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
          <ThemedText type="title" style={styles.heading}>New Data Log</ThemedText>

          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Log name"
            placeholderTextColor={colors.icon}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <ThemedText style={styles.label}>Enclosure</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setEnclosureModalVisible(true)}>
            <ThemedText style={enclosure ? undefined : { color: colors.icon }}>
              {enclosure ? enclosure.name : 'None'}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.label}>Animal</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setAnimalModalVisible(true)}>
            <ThemedText style={animal ? undefined : { color: colors.icon }}>
              {animal ? animal.name : 'None'}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.label}>Fields *</ThemedText>
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldRow}>
              <TextInput
                style={[inputStyle, styles.fieldInput, { marginBottom: 0 }]}
                placeholder={`Field ${index + 1}`}
                placeholderTextColor={colors.icon}
                value={field}
                onChangeText={(text) => updateField(index, text)}
              />
              {fields.length > 1 && (
                <TouchableOpacity style={styles.removeButton} onPress={() => removeField(index)}>
                  <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addFieldButton, { borderColor: colors.icon }]}
            onPress={() => setFields((prev) => [...prev, ''])}
          >
            <ThemedText style={{ color: colors.icon }}>+ Add Field</ThemedText>
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
              <ThemedText style={styles.submitButtonText}>Create Data Log</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelTouchable} onPress={() => router.back()}>
            <ThemedText style={[styles.cancelText, { color: colors.icon }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DropdownModal
        visible={enclosureModalVisible}
        title="Select Enclosure"
        items={enclosures}
        onSelect={setEnclosure}
        onClose={() => setEnclosureModalVisible(false)}
        loading={enclosuresLoading}
      />

      <DropdownModal
        visible={animalModalVisible}
        title="Select Animal"
        items={animals}
        onSelect={setAnimal}
        onClose={() => setAnimalModalVisible(false)}
        loading={animalsLoading}
      />
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  fieldInput: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: 'red',
  },
  addFieldButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 24,
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
  cancelTouchable: { paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  dropdownCard: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  dropdownTitle: { marginBottom: 12 },
  dropdownLoader: { marginVertical: 16 },
  dropdownList: { marginBottom: 12 },
  dropdownItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownCancel: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
});
