import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiFetch } from '@/utils/api';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  enclosureId?: string;
  enclosureName?: string;
  animalId?: string;
  animalName?: string;
  jobId?: string;
  jobName?: string;
}

function getRelatedEntity(comment: Comment): { type: string; name: string } | null {
  if (comment.animalId && comment.animalName) return { type: 'Animal', name: comment.animalName };
  if (comment.jobId && comment.jobName) return { type: 'Job', name: comment.jobName };
  if (comment.enclosureId && comment.enclosureName) return { type: 'Enclosure', name: comment.enclosureName };
  return null;
}

export default function CommentsScreen() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('https://localhost:44311/Comments')
      .then((res) => res.json())
      .then((data: Comment[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComments(sorted);
      })
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (error) return <ThemedText style={styles.error}>{error}</ThemedText>;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.heading}>Comments</ThemedText>
        {comments.length === 0 ? (
          <ThemedText>No comments yet.</ThemedText>
        ) : (
          comments.map((comment) => (
            <ThemedView key={comment.id} style={styles.card}>
              <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
              <ThemedView style={styles.meta}>
                {(() => {
                  const related = getRelatedEntity(comment);
                  return related ? (
                    <ThemedText style={styles.source}>
                      {related.type}: {related.name}
                    </ThemedText>
                  ) : null;
                })()}
                <ThemedText style={styles.timestamp}>
                  {new Date(comment.createdAt).toLocaleString()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heading: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 15,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  source: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
});
