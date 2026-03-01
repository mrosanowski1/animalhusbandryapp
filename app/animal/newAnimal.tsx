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

interface EnumOption {
  label: string;
  value: number;
}

const SEX_OPTIONS: EnumOption[] = [
  { label: 'Unknown', value: 0 },
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
];

function DropdownModal<T>({
  visible,
  title,
  items,
  keyExtractor,
  labelExtractor,
  onSelect,
  onClose,
  loading,
}: {
  visible: boolean;
  title: string;
  items: T[];
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  onSelect: (item: T) => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <ThemedView style={styles.dropdownCard}>
          <ThemedText type="subtitle" style={styles.dropdownTitle}>{title}</ThemedText>
          {loading ? (
            <ActivityIndicator size="small" style={styles.dropdownLoader} />
          ) : items.length === 0 ? (
            <ThemedText style={styles.dropdownEmpty}>No options available</ThemedText>
          ) : (
            <FlatList
              data={items}
              keyExtractor={keyExtractor}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomColor: colors.icon }]}
                  onPress={() => { onSelect(item); onClose(); }}
                >
                  <ThemedText>{labelExtractor(item)}</ThemedText>
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

export default function NewAnimalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<EnumOption | null>(null);
  const [sex, setSex] = useState<EnumOption>(SEX_OPTIONS[0]);
  const [enclosure, setEnclosure] = useState<EnclosureSummary | null>(null);

  const [enclosures, setEnclosures] = useState<EnclosureSummary[]>([]);
  const [enclosuresLoading, setEnclosuresLoading] = useState(true);

  const [speciesOptions, setSpeciesOptions] = useState<EnumOption[]>([]);
  const [speciesLoading, setSpeciesLoading] = useState(true);

  const [enclosureModalVisible, setEnclosureModalVisible] = useState(false);
  const [speciesModalVisible, setSpeciesModalVisible] = useState(false);
  const [sexModalVisible, setSexModalVisible] = useState(false);

  const [includeHealthDetail, setIncludeHealthDetail] = useState(false);
  const [healthWeight, setHealthWeight] = useState('');
  const [healthComments, setHealthComments] = useState<string[]>(['']);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/Enclosures`)
      .then((res) => res.json())
      .then((data: EnclosureSummary[]) => setEnclosures(data))
      .catch(() => setEnclosures([]))
      .finally(() => setEnclosuresLoading(false));

    apiFetch(`${API_BASE_URL}/Animals/Species`)
      .then((res) => res.json())
      .then((data: { value: number; description: string }[]) =>
        setSpeciesOptions(data.map((s) => ({ value: s.value, label: s.description })))
      )
      .catch(() => setSpeciesOptions([]))
      .finally(() => setSpeciesLoading(false));
  }, []);

  const canSubmit = name.trim().length > 0 && species !== null;

  const handleSubmit = async () => {
    if (!canSubmit || !species) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/Animals`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          species: species.value,
          sex: sex.value,
          ...(enclosure ? { enclosureId: enclosure.id } : {}),
          ...(includeHealthDetail && {
            healthDetail: {
              weight: parseFloat(healthWeight) || 0,
              comments: healthComments.map((c) => c.trim()).filter((c) => c.length > 0),
            },
          }),
        }),
      });
      if (!response.ok) throw new Error('Failed to create animal');
      router.back();
    } catch {
      setError('Failed to create animal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectorStyle = [styles.selector, { borderColor: colors.icon }];
  const inputStyle = [styles.textInput, { color: colors.text, borderColor: colors.icon }];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.heading}>New Animal</ThemedText>

          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Animal name"
            placeholderTextColor={colors.icon}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <ThemedText style={styles.label}>Species *</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setSpeciesModalVisible(true)}>
            <ThemedText style={species ? undefined : { color: colors.icon }}>
              {species ? species.label : 'Select species…'}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.label}>Sex</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setSexModalVisible(true)}>
            <ThemedText>{sex.label}</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.label}>Enclosure</ThemedText>
          <TouchableOpacity style={selectorStyle} onPress={() => setEnclosureModalVisible(true)}>
            <ThemedText style={enclosure ? undefined : { color: colors.icon }}>
              {enclosure ? enclosure.name : 'Select enclosure…'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.healthToggle, { borderColor: colors.icon }]}
            onPress={() => setIncludeHealthDetail((v) => !v)}
          >
            <ThemedText style={styles.label}>Health Detail</ThemedText>
            <ThemedText style={{ color: colors.icon }}>{includeHealthDetail ? '▲ Remove' : '▼ Add'}</ThemedText>
          </TouchableOpacity>

          {includeHealthDetail && (
            <ThemedView style={[styles.healthSection, { borderColor: colors.icon }]}>
              <ThemedText style={styles.label}>Weight</ThemedText>
              <TextInput
                style={[inputStyle, { marginBottom: 16 }]}
                placeholder="Weight (kg)"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
                value={healthWeight}
                onChangeText={setHealthWeight}
              />

              <ThemedText style={styles.label}>Comments</ThemedText>
              {healthComments.map((comment, index) => (
                <View key={index} style={styles.commentRow}>
                  <TextInput
                    style={[inputStyle, styles.commentInput, { marginBottom: 0 }]}
                    placeholder={`Comment ${index + 1}`}
                    placeholderTextColor={colors.icon}
                    value={comment}
                    onChangeText={(text) =>
                      setHealthComments((prev) => prev.map((c, i) => (i === index ? text : c)))
                    }
                  />
                  {healthComments.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeCommentButton}
                      onPress={() => setHealthComments((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <ThemedText style={styles.removeCommentText}>✕</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addCommentButton, { borderColor: colors.icon }]}
                onPress={() => setHealthComments((prev) => [...prev, ''])}
              >
                <ThemedText style={{ color: colors.icon }}>+ Add Comment</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Create Animal</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelTouchable} onPress={() => router.back()}>
            <ThemedText style={[styles.cancelText, { color: colors.icon }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DropdownModal
        visible={speciesModalVisible}
        title="Select Species"
        items={speciesOptions}
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onSelect={(item) => setSpecies(item)}
        onClose={() => setSpeciesModalVisible(false)}
        loading={speciesLoading}
      />

      <DropdownModal
        visible={sexModalVisible}
        title="Select Sex"
        items={SEX_OPTIONS}
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onSelect={(item) => setSex(item)}
        onClose={() => setSexModalVisible(false)}
      />

      <DropdownModal
        visible={enclosureModalVisible}
        title="Select Enclosure"
        items={enclosures}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        onSelect={(item) => setEnclosure(item)}
        onClose={() => setEnclosureModalVisible(false)}
        loading={enclosuresLoading}
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
  healthToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  healthSection: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  commentInput: {
    flex: 1,
  },
  removeCommentButton: {
    padding: 8,
  },
  removeCommentText: {
    fontSize: 16,
    color: 'red',
  },
  addCommentButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
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
  dropdownEmpty: { opacity: 0.6, marginBottom: 16 },
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
