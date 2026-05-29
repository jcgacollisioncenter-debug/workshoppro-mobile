import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');
const videoSource = 'https://player.vimeo.com/external/494252666.hd.mp4?s=2f0594e5fcc17568547efc462db9399ecf86f73a&profile_id=175';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
      <View style={styles.videoShade} />
      <View style={styles.overlay}>
        <View style={styles.brandBlock}>
          <Text style={styles.kicker}>Canadian Auto Care</Text>
          <Text style={styles.title}>Workshop<Text style={styles.titleAccent}>Pro</Text></Text>
          <View style={styles.loadingTrack}>
            <View style={styles.loadingFill} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    opacity: 0.5,
  },
  videoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.48)',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 70,
  },
  brandBlock: {
    width: '100%',
  },
  kicker: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
  },
  titleAccent: {
    color: '#60A5FA',
    fontStyle: 'italic',
  },
  loadingTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: 20,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '72%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#60A5FA',
  },
});

export default SplashScreen;
