import { useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface Animal {
  id: string;
  name: string;
  species: string;
  age?: number;
}

interface Enclosure {
  id: string;
  name: string;
  description?: string;
  animals: Animal[];
}

export default function ModalScreen() {
  const { enclosureId } = useLocalSearchParams();
  const [enclosure, setEnclosure] = useState<Enclosure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnclosure = async () => {
      try {
        const response = await fetch(`https://localhost:44311/Enclosures/${enclosureId}`);
        if (!response.ok) throw new Error('Failed to fetch enclosure');
        const data = await response.json();
        setEnclosure(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (enclosureId) fetchEnclosure();
  }, [enclosureId]);

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
            <ThemedView key={animal.id} style={styles.animalCard}>
              <ThemedText style={styles.animalName}>{animal.name}</ThemedText>
              <ThemedText style={styles.animalDetail}>Species: {animal.species}</ThemedText>
              {animal.age && <ThemedText style={styles.animalDetail}>Age: {animal.age}</ThemedText>}
            </ThemedView>
          ))
        ) : (
          <ThemedText>No animals in this enclosure</ThemedText>
        )}

        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
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
  description: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  animalCard: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  animalName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  animalDetail: {
    marginBottom: 4,
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
  },
  error: {
    color: 'red',
  },
});
