import React, { useEffect, useRef } from 'react';
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, CalendarCheck, Camera, Car, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const backgroundImage = {
  uri: 'https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?auto=format&fit=crop&q=85&w=2000',
};

const SERVICE_STEPS = [
  { label: 'Identify vehicle', detail: 'VIN decoding', icon: Car },
  { label: 'Review damage', detail: 'Photos and notes', icon: Camera },
  { label: 'Book visit', detail: 'Live availability', icon: CalendarCheck },
];

const ServiceIntroScreen = ({ onFinish }: { onFinish: () => void }) => {
  const hasFinished = useRef(false);

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    onFinish();
  };

  useEffect(() => {
    const timer = setTimeout(finish, 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.background}>
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Text style={styles.brandText}>
            Workshop<Text style={styles.brandAccent}>Pro</Text>
          </Text>
          <View style={styles.statusPill}>
            <ShieldCheck size={14} color="#A7F3D0" />
            <Text style={styles.statusText}>Certified care</Text>
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>Auto repair estimate</Text>
          <Text style={styles.title}>A modern way to start your service request.</Text>
          <Text style={styles.subtitle}>
            Share your VIN, add damage photos, and find appointment availability in one guided flow.
          </Text>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.stepsRow}>
            {SERVICE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <View key={step.label} style={styles.stepCard}>
                  <View style={styles.stepIcon}>
                    <Icon size={18} color={Theme.colors.navyDeep} />
                  </View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={finish} activeOpacity={0.86}>
            <Text style={styles.primaryButtonText}>Start Estimate</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.58)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  brandAccent: {
    color: '#60A5FA',
    fontStyle: 'italic',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 70,
  },
  eyebrow: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 340,
  },
  bottomPanel: {
    paddingBottom: Platform.OS === 'ios' ? 18 : 28,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  stepCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 8,
    padding: 11,
    justifyContent: 'space-between',
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    color: Theme.colors.navyDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  stepDetail: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 14,
  },
  primaryButton: {
    height: 56,
    borderRadius: Theme.borderRadius.button,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ServiceIntroScreen;
