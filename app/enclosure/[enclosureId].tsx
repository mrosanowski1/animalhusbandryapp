import { useCallback, useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

interface Animal {
  id: string;
  name: string;
  species: string;
  age?: number;
}

interface Job {
  id: string;
  name: string;
  actionType?: string;
  description?: string;
  isCompleted?: boolean;
}

interface Comment {
  id?: string;
  text?: string;
}

interface Enclosure {
  id: string;
  name: string;
  description?: string;
  animals: Animal[];
  jobs: Job[];
  comments: Comment[];
}

export default function ModalScreen() {
  const { enclosureId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [enclosure, setEnclosure] = useState<Enclosure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completingJobId, setCompletingJobId] = useState<string | null>(null);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEnclosure = useCallback(async () => {
    try {
      const response = await apiFetch(`https://localhost:44311/Enclosures/${enclosureId}`);
      if (!response.ok) throw new Error('Failed to fetch enclosure');
      const data = await response.json();
      setEnclosure(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [enclosureId]);

  useEffect(() => {
    if (enclosureId) fetchEnclosure();
  }, [enclosureId, fetchEnclosure]);

  const completeJob = async (jobId: string) => {
    setCompletingJobId(jobId);
    try {
      const response = await apiFetch(`https://localhost:44311/Jobs/${jobId}/Complete`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to complete job');
      setEnclosure((prev) =>
        prev
          ? { ...prev, jobs: prev.jobs.map((j) => j.id === jobId ? { ...j, isCompleted: true } : j) }
          : prev
      );
    } catch {
      setError('Failed to mark job as complete');
    } finally {
      setCompletingJobId(null);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch(`https://localhost:44311/Enclosures/${enclosureId}/Comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      setCommentModalVisible(false);
      fetchEnclosure();
    } catch {
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <ThemedText style={styles.error}>Error: {error}</ThemedText>;
  if (!enclosure) return <ThemedText>No enclosure found</ThemedText>;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title">{enclosure.name}</ThemedText>
        {enclosure.description && (
          <ThemedText style={styles.description}>{enclosure.description}</ThemedText>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>Animals</ThemedText>
        {enclosure.animals?.length > 0 ? (
          enclosure.animals.map((animal) => (
            <ThemedView key={animal.id} style={styles.card}>
              <ThemedText style={styles.cardTitle}>{animal.name}</ThemedText>
              <ThemedText style={styles.cardDetail}>Species: {animal.species}</ThemedText>
              {animal.age && <ThemedText style={styles.cardDetail}>Age: {animal.age}</ThemedText>}
            </ThemedView>
          ))
        ) : (
          <ThemedText>No animals in this enclosure</ThemedText>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>Jobs</ThemedText>
        {enclosure.jobs?.length > 0 ? (
          enclosure.jobs.map((job) => (
            <ThemedView key={job.id} style={styles.card}>
              <View style={styles.jobRow}>
                <View style={styles.jobInfo}>
                  <ThemedText style={[styles.cardTitle, job.isCompleted && styles.completedText]}>
                    {job.name}
                  </ThemedText>
                  {job.actionType && (
                    <ThemedText style={[styles.cardDetail, job.isCompleted && styles.completedText]}>
                      Type: {job.actionType}
                    </ThemedText>
                  )}
                  {job.description && (
                    <ThemedText style={[styles.cardDetail, job.isCompleted && styles.completedText]}>
                      {job.description}
                    </ThemedText>
                  )}
                </View>
                {!job.isCompleted && (
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
        ) : (
          <ThemedText>No jobs for this enclosure</ThemedText>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>Comments</ThemedText>
        {enclosure.comments?.length > 0 ? (
          enclosure.comments.map((comment, index) => (
            <ThemedView key={comment.id ?? index} style={styles.card}>
              <ThemedText style={styles.cardDetail}>{comment.text}</ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedText>No comments yet</ThemedText>
        )}

        <TouchableOpacity
          style={styles.addCommentButton}
          onPress={() => setCommentModalVisible(true)}
        >
          <ThemedText style={styles.addCommentButtonText}>Add Comment</ThemedText>
        </TouchableOpacity>

        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ScrollView>

      <Modal
        visible={commentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ThemedView style={styles.modalCard}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Add a Comment</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.text, borderColor: colors.icon },
              ]}
              placeholder="Type your comment..."
              placeholderTextColor={colors.icon}
              multiline
              value={commentText}
              onChangeText={setCommentText}
              autoFocus
            />
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.icon }]}
                onPress={() => {
                  setCommentText('');
                  setCommentModalVisible(false);
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitComment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
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
  description: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDetail: {
    marginBottom: 4,
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
  addCommentButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  addCommentButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
  },
  error: {
    color: 'red',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
