import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ImageBackground,
  StatusBar,
  Alert
} from 'react-native';

const Login = ({ onLogin }: { onLogin: (data: { name: string; address: string }) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminAuth = () => {
    if (email === 'admin@workshoppro.ca' && password === 'admin123') {
      onLogin({ name: 'System Admin', address: 'Workshop HQ' });
    } else {
      Alert.alert('Auth Error', 'Invalid admin credentials.');
    }
  };

  const backgroundImage = { uri: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=2000' };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <View style={styles.darkOverlay} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.loginContent}>
            <View style={styles.loginCard}>
              <View style={styles.header}>
                <Text style={styles.welcomeText}>Staff Access</Text>
                <Text style={styles.brandText}>Workshop<Text style={styles.brandAccent}>Pro</Text></Text>
                <Text style={styles.tagline}>Administrator Portal</Text>
              </View>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Admin Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="admin@workshoppro.ca"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.button, (!email || !password) && styles.buttonDisabled]} 
                  onPress={handleAdminAuth}
                  disabled={!email || !password}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Access Dashboard</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>SECURE • PROFESSIONAL • INTERNAL</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  keyboardView: {
    flex: 1,
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '500',
  },
  brandText: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandAccent: {
    color: '#3b82f6',
    fontStyle: 'italic',
  },
  tagline: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },
});

export default Login;
