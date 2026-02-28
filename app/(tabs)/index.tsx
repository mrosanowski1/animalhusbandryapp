import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { apiFetch } from '@/utils/api';

interface EnclosureSummary {
  id: string;
  name: string;
  coordinate: {
    longitude: number;
    latitude: number;
  };
}

interface Size {
  width: number;
  height: number;
}

interface ImageOverlay {
  left: number;
  top: number;
  width: number;
  height: number;
}

function calcImageOverlay(container: Size, image: Size): ImageOverlay {
  const containerAR = container.width / container.height;
  const imageAR = image.width / image.height;
  const renderedWidth = imageAR > containerAR ? container.width : container.height * imageAR;
  const renderedHeight = imageAR > containerAR ? container.width / imageAR : container.height;
  return {
    left: (container.width - renderedWidth) / 2,
    top: (container.height - renderedHeight) / 2,
    width: renderedWidth,
    height: renderedHeight,
  };
}

export default function HomeScreen() {
  const [enclosures, setEnclosures] = useState<EnclosureSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  const [imageSize, setImageSize] = useState<Size | null>(null);

  useEffect(() => {
    apiFetch('https://localhost:44311/Enclosures')
      .then((res) => res.json())
      .then((data) => setEnclosures(data))
      .catch(() => setEnclosures([]))
      .finally(() => setLoading(false));
  }, []);

  const overlay = containerSize && imageSize ? calcImageOverlay(containerSize, imageSize) : null;

  // Always-current ref so the gesture callback reads the latest overlay without stale closures
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  const doubleTap = useMemo(() =>
    Gesture.Tap()
      .numberOfTaps(2)
      .runOnJS(true)
      .onEnd((event) => {
        const ov = overlayRef.current;
        if (!ov) return;
        const relX = event.x - ov.left;
        const relY = event.y - ov.top;
        const longitude = Math.max(0, Math.min(100, (relX / ov.width) * 100));
        const latitude = Math.max(0, Math.min(100, (relY / ov.height) * 100));
        router.push({
          pathname: '/enclosure/newEnclosure',
          params: { longitude: longitude.toFixed(1), latitude: latitude.toFixed(1) },
        });
      }),
  []);

  return (
    <GestureDetector gesture={doubleTap}>
      <View
        style={styles.container}
        onLayout={(e) => setContainerSize(e.nativeEvent.layout)}
      >
      <Image
        source={require('@/assets/images/NgaManuMap.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="contain"
        onLoad={(e) => {
          const { width, height } = e.source;
          if (width && height) setImageSize({ width, height });
        }}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" />}

      {overlay && enclosures.map((enclosure) => (
        <Link
          key={enclosure.id}
          href={`/enclosure/${enclosure.id}`}
          style={{
            position: 'absolute',
            left: overlay.left + (enclosure.coordinate.longitude / 100) * overlay.width,
            top: overlay.top + (enclosure.coordinate.latitude / 100) * overlay.height,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ThemedText type="defaultSemiBold" style={styles.label}>{enclosure.name}</ThemedText>
        </Link>
      ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  label: {
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
