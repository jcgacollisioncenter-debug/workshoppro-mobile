import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { CheckCircle, MapPin, Navigation, Calendar, ChevronDown, ChevronUp, Star, Phone, Globe } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const LocationPage = ({ onBack, workshopSettings }: { onBack: () => void, workshopSettings?: any }) => {
  const [showSuppliers, setShowSuppliers] = useState(false);
  
  // Use admin-pinned coordinates or fallback to default
  const workshopCoords = {
    latitude: workshopSettings?.latitude || 43.6532,
    longitude: workshopSettings?.longitude || -79.3832
  };

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${workshopCoords.latitude},${workshopCoords.longitude}`,
      android: `geo:0,0?q=${workshopCoords.latitude},${workshopCoords.longitude}(WorkshopPro)`
    });
    Linking.openURL(url || '');
  };

  const handlePhoneCall = () => {
    if (workshopSettings?.phone_number) {
      Linking.openURL(`tel:${workshopSettings.phone_number}`);
    } else {
      Alert.alert("Contact Info", "Phone number not configured by workshop.");
    }
  };

  const handleOpenWeb = () => {
    if (workshopSettings?.website_url) {
      const url = workshopSettings.website_url.startsWith('http') 
        ? workshopSettings.website_url 
        : `https://${workshopSettings.website_url}`;
      Linking.openURL(url);
    } else {
      Alert.alert("Contact Info", "Workshop website not configured.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <CheckCircle color={Theme.colors.workshopGreen} size={28} />
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerTitle}>Visit Workshop</Text>
          <Text style={styles.headerSubtitle}>Location based on active bays</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              ...workshopCoords,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={workshopCoords} pinColor={Theme.colors.pinRed}>
               <View style={styles.customMarker}>
                 <MapPin size={24} color={Theme.colors.pinRed} fill="#fff" />
               </View>
            </Marker>
          </MapView>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.workshopName}>WorkshopPro Toronto HQ</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color="#888" />
            <Text style={styles.addressText}>Admin-Verified Geolocation Active</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statText}>4.9 Ratings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle size={14} color={Theme.colors.workshopGreen} />
              <Text style={styles.statText}>Certified Shop</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.mainAction} onPress={openMaps}>
              <Navigation size={20} color="#fff" />
              <Text style={styles.mainActionText}>Start Navigation</Text>
            </TouchableOpacity>
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.iconAction} onPress={handlePhoneCall}><Phone size={20} color={Theme.colors.navyDeep} /></TouchableOpacity>
              <TouchableOpacity style={styles.iconAction} onPress={handleOpenWeb}><Globe size={20} color={Theme.colors.navyDeep} /></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalTitle}>What to expect on arrival:</Text>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Park in the designated "AI Quote" bays.</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Show your digital estimate to the concierge.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.navyDeep },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  container: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  mapContainer: { height: 300, width: '100%', overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  map: { ...StyleSheet.absoluteFillObject },
  customMarker: { backgroundColor: '#fff', padding: 5, borderRadius: 10, shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.2, elevation: 5 },
  infoCard: { padding: 24, backgroundColor: '#fff' },
  workshopName: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.navyDeep, marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  addressText: { color: '#666', fontSize: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 24 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, fontWeight: '600', color: '#444' },
  statDivider: { width: 1, height: 15, backgroundColor: '#eee' },
  actionGrid: { flexDirection: 'row', gap: 12 },
  mainAction: { flex: 1, backgroundColor: Theme.colors.navyDeep, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryActions: { flexDirection: 'row', gap: 12 },
  iconAction: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
  arrivalCard: { margin: 24, padding: 20, backgroundColor: Theme.colors.greenTint, borderRadius: 20 },
  arrivalTitle: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.workshopGreen, marginBottom: 15 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.workshopGreen },
  stepText: { fontSize: 13, color: '#444', lineHeight: 18 }
});

export default LocationPage;
