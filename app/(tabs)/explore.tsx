import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Link } from 'expo-router';


import ImageMarker, { Marker } from 'react-image-marker';


export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      {/*<Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>*/}
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/NgaManuMap.png')}
          style={{ width: 1492, height: 1177, alignSelf: 'center' }}
        />
        <Link href="/enclosure/8CEE767B-4C14-42D9-02EF-08DE144D6345" style={{ position: 'absolute', top: '35%', left: '55%', transform: 'translate(-50%, -50%)' }}>
          <Link.Trigger>
            <ThemedText type="defaultSemiBold">A01</ThemedText>
          </Link.Trigger>
          <Link.Preview />
        </Link>

        {/*<button data-value="1" onClick={enclosureClick} style={{ position: 'absolute', top: '35%', left: '55%', transform: 'translate(-50%, -50%)' }}>A01</button>*/}
        <button style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}>Dive</button>
        <button style={{ position: 'absolute', top: '62%', left: '52%', transform: 'translate(-50%, -50%)' }}>A03</button>
        <button style={{ position: 'absolute', top: '65%', left: '55%', transform: 'translate(-50%, -50%)' }}>A04</button>
        <button style={{ position: 'absolute', top: '50%', left: '65%', transform: 'translate(-50%, -50%)' }}>NH1</button>
        <button style={{ position: 'absolute', top: '60%', left: '73%', transform: 'translate(-50%, -50%)' }}>Numeric 1-3</button>
        <button style={{ position: 'absolute', top: '58%', left: '80%', transform: 'translate(-50%, -50%)' }}>Numeric 4</button>
        <button style={{ position: 'absolute', top: '68%', left: '91%', transform: 'translate(-50%, -50%)' }}>A09</button>
        <button style={{ position: 'absolute', top: '70%', left: '94%', transform: 'translate(-50%, -50%)' }}>A11</button>
        <button style={{ position: 'absolute', top: '72%', left: '97%', transform: 'translate(-50%, -50%)' }}>A13</button>

        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
      */}
    </ParallaxScrollView>
  );
}

const enclosureClick = (e) => {
  alert(`You clicked: ${e.target.getAttribute('data-value')}`);
};
const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

