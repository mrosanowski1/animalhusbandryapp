import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';

interface Job {
  id: string;
  name: string;
  actionType?: string;
  description?: string;
  completedAt?: string;
  completedBy?: string;
  isRecurring?: boolean;
}

interface Comment {
  id?: string;
  text?: string;
  createdBy?: string;
}

interface DataLogField {
  id: string;
  name: string;
}

interface DataLog {
  id: string;
  name: string;
  animalId: string | null;
  enclosureId: string | null;
  fields: DataLogField[];
}

interface Animal {
  id: string;
  name: string;
  species: string;
  sex: number;
  enclosureId?: string;
  jobs?: Job[];
  comments?: Comment[];
  dataLogs?: DataLog[];
}

const SEX_LABELS: Record<number, string> = { 0: 'Unknown', 1: 'Male', 2: 'Female' };

export default function AnimalDetailScreen() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completingJobId, setCompletingJobId] = useState<string | null>(null);
  const [dataLogValues, setDataLogValues] = useState<Record<string, Record<string, string>>>({});
  const [submittingDataLogId, setSubmittingDataLogId] = useState<string | null>(null);

  const fetchAnimal = useCallback(async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/Animals/${animalId}`);
      if (!response.ok) throw new Error('Failed to fetch animal');
      setAnimal(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    if (animalId) fetchAnimal();
  }, [animalId, fetchAnimal]);

  const isCompletedToday = (completedAt?: string): boolean => {
    if (!completedAt) return false;
    const completed = new Date(completedAt);
    const today = new Date();
    return (
      completed.getFullYear() === today.getFullYear() &&
      completed.getMonth() === today.getMonth() &&
      completed.getDate() === today.getDate()
    );
  };

  const completeJob = async (jobId: string) => {
    setCompletingJobId(jobId);
    try {
      const response = await apiFetch(`${API_BASE_URL}/Jobs/${jobId}/Complete`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to complete job');
      setAnimal((prev) =>
        prev
          ? { ...prev, jobs: prev.jobs?.map((j) => j.id === jobId ? { ...j, completedAt: new Date().toISOString() } : j) }
          : prev
      );
    } catch {
      setError('Failed to mark job as complete');
    } finally {
      setCompletingJobId(null);
    }
  };

  const setDataLogFieldValue = (dataLogId: string, fieldId: string, value: string) => {
    setDataLogValues((prev) => ({
      ...prev,
      [dataLogId]: { ...prev[dataLogId], [fieldId]: value },
    }));
  };

  const canSubmitDataLogEntry = (dataLog: DataLog): boolean => {
    const values = dataLogValues[dataLog.id] ?? {};
    return dataLog.fields.every((f) => (values[f.id] ?? '').trim().length > 0);
  };

  const submitDataLogEntry = async (dataLog: DataLog) => {
    if (!canSubmitDataLogEntry(dataLog)) return;
    setSubmittingDataLogId(dataLog.id);
    try {
      const values = dataLogValues[dataLog.id] ?? {};
      const response = await apiFetch(`${API_BASE_URL}/datalogs/${dataLog.id}/entries`, {
        method: 'POST',
        body: JSON.stringify({
          values: dataLog.fields.map((f) => ({ fieldId: f.id, value: values[f.id] })),
        }),
      });
      if (!response.ok) throw new Error('Failed to submit entry');
      setDataLogValues((prev) => ({ ...prev, [dataLog.id]: {} }));
    } catch {
      setError('Failed to submit data log entry');
    } finally {
      setSubmittingDataLogId(null);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (error) return <ThemedText style={styles.error}>Error: {error}</ThemedText>;
  if (!animal) return <ThemedText>No animal found</ThemedText>;

  const dataLogs = animal.dataLogs ?? [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title">{animal.name}</ThemedText>

        <ThemedView style={styles.detailCard}>
          <ThemedText style={styles.detailRow}>Species: {animal.species}</ThemedText>
          <ThemedText style={styles.detailRow}>Sex: {SEX_LABELS[animal.sex] ?? 'Unknown'}</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Jobs</ThemedText>
        {(animal.jobs?.length ?? 0) === 0 ? (
          <ThemedText>No jobs for this animal</ThemedText>
        ) : (
          animal.jobs!.map((job) => (
            <ThemedView key={job.id} style={styles.card}>
              <View style={styles.jobRow}>
                <View style={styles.jobInfo}>
                  <ThemedText style={[styles.cardTitle, isCompletedToday(job.completedAt) && styles.completedText]}>
                    {job.name}
                  </ThemedText>
                  {job.actionType && (
                    <ThemedText style={[styles.detailRow, isCompletedToday(job.completedAt) && styles.completedText]}>
                      Type: {job.actionType}
                    </ThemedText>
                  )}
                  {job.description && (
                    <ThemedText style={[styles.detailRow, isCompletedToday(job.completedAt) && styles.completedText]}>
                      {job.description}
                    </ThemedText>
                  )}
                  {job.isRecurring && (
                    <ThemedText style={[styles.recurringBadge, isCompletedToday(job.completedAt) && styles.completedText]}>
                      ↻ Daily
                    </ThemedText>
                  )}
                  {job.completedBy && isCompletedToday(job.completedAt) && (
                    <ThemedText style={[styles.detailRow, styles.completedText]}>
                      Completed by: {job.completedBy}
                    </ThemedText>
                  )}
                </View>
                {!isCompletedToday(job.completedAt) && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => completeJob(job.id)}
                    disabled={completingJobId === job.id}
                  >
                    {completingJobId === job.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.completeButtonText}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ThemedView>
          ))
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>Comments</ThemedText>
        {(animal.comments?.length ?? 0) === 0 ? (
          <ThemedText>No comments for this animal</ThemedText>
        ) : (
          animal.comments!.map((comment, index) => (
            <ThemedView key={comment.id ?? index} style={styles.card}>
              <ThemedText style={styles.detailRow}>{comment.text}</ThemedText>
              {comment.createdBy && (
                <ThemedText style={styles.commentAuthor}>{comment.createdBy}</ThemedText>
              )}
            </ThemedView>
          ))
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>Data Logs</ThemedText>
        {dataLogs.length === 0 ? (
          <ThemedText>No data logs for this animal</ThemedText>
        ) : (
          dataLogs.map((dataLog) => {
            const values = dataLogValues[dataLog.id] ?? {};
            const ready = canSubmitDataLogEntry(dataLog);
            const isSubmitting = submittingDataLogId === dataLog.id;
            return (
              <ThemedView key={dataLog.id} style={styles.card}>
                <ThemedText style={styles.cardTitle}>{dataLog.name}</ThemedText>
                {dataLog.fields.map((field) => (
                  <View key={field.id} style={styles.fieldRow}>
                    <ThemedText style={styles.fieldLabel}>{field.name}</ThemedText>
                    <TextInput
                      style={[styles.fieldInput, { color: colors.text, borderColor: colors.icon }]}
                      placeholder={`Enter ${field.name}`}
                      placeholderTextColor={colors.icon}
                      value={values[field.id] ?? ''}
                      onChangeText={(text) => setDataLogFieldValue(dataLog.id, field.id, text)}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.submitButton, !ready && styles.submitButtonDisabled]}
                  onPress={() => submitDataLogEntry(dataLog)}
                  disabled={!ready || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Entry</Text>
                  )}
                </TouchableOpacity>
              </ThemedView>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    marginTop: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
  },
  detailCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    marginBottom: 4,
  },
  card: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fieldRow: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 13,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  jobInfo: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.45,
  },
  completeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 36,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  recurringBadge: {
    fontSize: 12,
    color: '#0a7ea4',
    marginTop: 2,
  },
  commentAuthor: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  error: {
    color: 'red',
    margin: 20,
  },
});
