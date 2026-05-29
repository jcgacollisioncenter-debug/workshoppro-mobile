import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Camera, Maximize2, Trash2, CheckCircle2, Image as ImageIcon, Star, Package } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decodeVin, analyzeDamage, performVinOcr } from '../services/vehicleService';
import CustomCamera from '../components/CustomCamera';
import { Theme } from '../styles/theme';

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  engineDisplacement?: string;
  plantCountry?: string;
}

interface DamagePhoto {
  uri: string;
  mimeType: string;
}

const REPAIR_ZONES = [
  'Bodywork', 'Bumper', 'Hood', 'Doors', 'Paint', 'Engine', 'Suspension', 'Brakes', 'Interior'
];

const QuotePage = ({ onNext, onAdminTrigger }: { onNext: () => void, onAdminTrigger: () => void }) => {
  const [vin, setVin] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [images, setImages] = useState<DamagePhoto[]>([]);
  const [description, setDescription] = useState('');
  const [showDescriptionReader, setShowDescriptionReader] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVinCamera, setShowVinCamera] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [interested, setInterested] = useState<string[]>([]);

  // Admin Trigger Logic (Triple Tap)
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = React.useRef<number>(0);

  const handleHeaderTap = () => {
    const now = Date.now();
    const TIME_LIMIT = 500;
    if (now - lastTapRef.current < TIME_LIMIT) {
      const newCount = tapCount + 1;
      if (newCount === 3) {
        onAdminTrigger();
        setTapCount(0);
      } else {
        setTapCount(newCount);
      }
    } else {
      setTapCount(1);
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    if (vin.length === 17) handleDecodeVin();
  }, [vin]);

  // Load accessories when AI analysis completes
  useEffect(() => {
    if (aiEstimate && vehicleInfo) {
      setAccessories([
        { id: '1', name: 'Premium Floor Mats', price: 120, install_price: 0 },
        { id: '2', name: 'LED Headlight Upgrade', price: 250, install_price: 80 },
        { id: '3', name: 'Leather Seat Covers', price: 450, install_price: 150 }
      ]);
    }
  }, [aiEstimate]);

  const handleDecodeVin = async () => {
    setLoading(true);
    try {
      const data = await decodeVin(vin);
      if (data) setVehicleInfo(data);
      else Alert.alert('Error', 'Could not decode VIN.');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to VIN service.');
    } finally {
      setLoading(false);
    }
  };

  const toggleZone = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleCapture = (uri: string) => {
    if (images.length < 5) setImages([...images, { uri, mimeType: 'image/jpeg' }]);
    else Alert.alert('Limit Reached', 'Maximum 5 photos allowed.');
    setShowCamera(false);
  };

  const handleVinCapture = async (uri: string) => {
    setShowVinCamera(false);
    setLoading(true);
    try {
      const detectedVin = await performVinOcr(uri);
      setVin(detectedVin);
      Alert.alert('VIN Detected', `Scanned VIN: ${detectedVin}`);
    } catch (error: any) {
      const errorMsg = error?.message || 'Could not read VIN from photo. Please try again or type it manually.';
      Alert.alert('OCR Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (images.length < 5) setImages([...images, { uri: asset.uri, mimeType: asset.mimeType || 'image/jpeg' }]);
      else Alert.alert('Limit Reached', 'Max 5 photos.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeDamage = async () => {
    if (images.length === 0) return Alert.alert('No Photo', 'Take a photo first.');
    if (selectedZones.length === 0) return Alert.alert('Repair Zones Required', 'Select the repair zones you want the AI to assess.');
    setAnalyzing(true);
    try {
      const photo = images[0]!;
      const result = await analyzeDamage(photo.uri, selectedZones, photo.mimeType);
      setDescription(prev => prev ? `${prev}\n\nAI Assessment: ${result.description}` : `AI Assessment: ${result.description}`);
      setAiEstimate(result.estimate);
    } catch (error) {
      // Fallback for demo
      setAiEstimate({ total: { min: 800, max: 1200 }, labour: { min: 400, max: 600 }, parts: { min: 400, max: 600 } });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInterest = (id: string) => {
    if (interested.includes(id)) return;
    setInterested([...interested, id]);
  };

  const getPlaceholder = () => {
    if (selectedZones.includes('Bumper')) return 'Describe the impact... is it deformed?';
    if (selectedZones.includes('Paint')) return 'Describe the colour damage...';
    return 'Describe the repair needed...';
  };

  const isFormValid = vin.length === 17 && vehicleInfo && selectedZones.length > 0;

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Information',
      'Are you sure you want to delete all entered data, including photos and VIN?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setVin('');
            setVehicleInfo(null);
            setSelectedZones([]);
            setImages([]);
            setDescription('');
            setAiEstimate(null);
            setInterested([]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.headerContainer}>
          <View style={{ width: 40 }} />
          <TouchableOpacity onPress={handleHeaderTap} activeOpacity={1} style={styles.adminTriggerArea}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Repair Estimate</Text>
              <Text style={styles.headerSubtitle}>Professional Canadian Auto Care</Text>
            </View>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
          {/* VIN Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vehicle VIN</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 60 }]}
                placeholder="Enter 17-character VIN"
                value={vin}
                onChangeText={setVin}
                maxLength={17}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={styles.vinCameraButton} 
                onPress={() => setShowVinCamera(true)}
                disabled={loading}
              >
                <Camera size={22} color={Theme.colors.navyDeep} />
              </TouchableOpacity>
              {loading && <ActivityIndicator style={styles.inlineLoader} color={Theme.colors.navyDeep} />}
            </View>
          </View>

          {/* Vehicle Info */}
          {vehicleInfo && (
            <View style={styles.gridSection}>
              <View style={styles.gridHeader}>
                <Text style={styles.gridTitle}>Vehicle Details</Text>
                <View style={styles.autoFillBadge}>
                  <CheckCircle2 size={14} color={Theme.colors.workshopGreen} />
                  <Text style={styles.autoFillText}>Auto-filled</Text>
                </View>
              </View>
              <View style={styles.grid}>
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}><Text style={styles.gridLabel}>Make</Text><Text style={styles.gridValue}>{vehicleInfo.make}</Text></View>
                  <View style={styles.gridItem}><Text style={styles.gridLabel}>Model</Text><Text style={styles.gridValue}>{vehicleInfo.model}</Text></View>
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}><Text style={styles.gridLabel}>Year</Text><Text style={styles.gridValue}>{vehicleInfo.year}</Text></View>
                  <View style={styles.gridItem}><Text style={styles.gridLabel}>Engine</Text><Text style={styles.gridValue}>{vehicleInfo.engineDisplacement}L</Text></View>
                </View>
              </View>
            </View>
          )}

          {/* AI Estimate & Accessories */}
          {aiEstimate && (
            <View style={styles.aiResultPane}>
              <View style={styles.estimateSection}>
                <View style={styles.estimateHeader}>
                  <Text style={styles.estimateTitle}>AI Suggested Range</Text>
                  <Text style={styles.estimateRange}>${aiEstimate.total.min} - ${aiEstimate.total.max} CAD</Text>
                </View>
                <View style={styles.disclaimerBox}>
                  <Text style={styles.disclaimerText}>⚠️ Guidance only. Professional review required.</Text>
                </View>
              </View>

              {accessories.length > 0 && (
                <View style={styles.upsellContainer}>
                  <View style={styles.upsellHeader}>
                    <Star size={18} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.upsellTitle}>Upgrade Your {vehicleInfo?.make}</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accessoryScroll}>
                    {accessories.map(acc => (
                      <View key={acc.id} style={styles.accessoryCard}>
                        <View style={styles.accIconBox}><Package size={24} color="#ccc" /></View>
                        <Text style={styles.accName} numberOfLines={1}>{acc.name}</Text>
                        <Text style={styles.accPrice}>${acc.price} <Text style={styles.accPriceSmall}>+ ${acc.install_price} inst.</Text></Text>
                        <TouchableOpacity 
                          style={[styles.interestBtn, interested.includes(acc.id) && styles.interestBtnActive]}
                          onPress={() => handleInterest(acc.id)}
                        >
                          <Text style={[styles.interestBtnText, interested.includes(acc.id) && styles.interestBtnTextActive]}>
                            {interested.includes(acc.id) ? 'Interested' : "I'm Interested"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Zones */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Repair Zones</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {REPAIR_ZONES.map(zone => (
                <TouchableOpacity key={zone} style={[styles.chip, selectedZones.includes(zone) && styles.activeChip]} onPress={() => toggleZone(zone)}>
                  <Text style={[styles.chipText, selectedZones.includes(zone) && styles.activeChipText]}>{zone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Damage Description</Text>
              {images.length > 0 && (
                <TouchableOpacity style={[styles.aiAssistButton, analyzing && styles.disabledButton]} onPress={handleAnalyzeDamage} disabled={analyzing}>
                  {analyzing ? <ActivityIndicator size="small" color={Theme.colors.aiPurple} /> : <Text style={styles.aiAssistText}>AI Assist</Text>}
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.descriptionWrapper}>
              <TextInput style={styles.textArea} multiline placeholder={getPlaceholder()} value={description} onChangeText={setDescription} placeholderTextColor="#999" />
              {description.length > 0 && (
                <TouchableOpacity style={styles.readerButton} onPress={() => setShowDescriptionReader(true)}>
                  <Maximize2 size={16} color={Theme.colors.navyDeep} />
                  <Text style={styles.readerButtonText}>Read full description</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photos (Max 5)</Text>
            <View style={styles.photoActionRow}>
              <TouchableOpacity style={styles.actionIconButton} onPress={() => setShowCamera(true)}>
                <Camera color={Theme.colors.navyDeep} size={24} /><Text style={styles.actionIconText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconButton} onPress={pickImageFromGallery}>
                <ImageIcon color={Theme.colors.navyDeep} size={24} /><Text style={styles.actionIconText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.photoGrid}>
              {images.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removePhoto} onPress={() => removeImage(index)}><Trash2 color="#fff" size={14} /></TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.submitButton, !isFormValid && styles.disabledButton]} onPress={onNext} disabled={!isFormValid}>
            <Text style={styles.submitButtonText}>View Availability</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showCamera} animationType="slide">
        <CustomCamera onCapture={handleCapture} onClose={() => setShowCamera(false)} />
      </Modal>

      <Modal visible={showVinCamera} animationType="slide">
        <CustomCamera onCapture={handleVinCapture} onClose={() => setShowVinCamera(false)} />
      </Modal>

      <Modal visible={showDescriptionReader} animationType="slide">
        <SafeAreaView style={styles.readerSafeArea}>
          <View style={styles.readerHeader}>
            <Text style={styles.readerTitle}>Repair Description</Text>
            <TouchableOpacity onPress={() => setShowDescriptionReader(false)}>
              <Text style={styles.readerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.readerContent} contentContainerStyle={{ paddingBottom: 40 }}>
            <TextInput
              style={styles.readerTextInput}
              multiline
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.navyDeep },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: Theme.spacing.screen, backgroundColor: Theme.colors.navyDeep },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.textWhite, textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: Theme.colors.textMuted, textAlign: 'center' },
  adminTriggerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  container: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Theme.spacing.screen },
  section: { marginBottom: Theme.spacing.section },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Theme.colors.navyDeep, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { position: 'relative' },
  input: { backgroundColor: Theme.colors.surfaceGray, borderWidth: 1, borderColor: Theme.colors.borderGray, borderRadius: Theme.borderRadius.input, padding: 14, fontSize: 16, color: Theme.colors.navyDeep },
  vinCameraButton: { position: 'absolute', right: 12, top: 12, padding: 4 },
  inlineLoader: { position: 'absolute', right: 15, top: 15 },
  gridSection: { backgroundColor: Theme.colors.surfaceGray, borderRadius: Theme.borderRadius.card, padding: 16, marginBottom: Theme.spacing.section, borderWidth: 1, borderColor: Theme.colors.borderGray },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.navyDeep },
  autoFillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.greenTint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  autoFillText: { fontSize: 10, color: Theme.colors.workshopGreen, fontWeight: 'bold', marginLeft: 4 },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 2 },
  gridValue: { fontSize: 14, color: Theme.colors.navyDeep, fontWeight: '500' },
  estimateSection: { backgroundColor: Theme.colors.navyDeep, borderRadius: Theme.borderRadius.card, padding: 16, marginBottom: 12 },
  estimateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  estimateTitle: { color: Theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase' },
  estimateRange: { color: Theme.colors.textWhite, fontSize: 18, fontWeight: 'bold' },
  disclaimerBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 8, marginBottom: 10 },
  disclaimerText: { color: Theme.colors.textWhite, fontSize: 11, fontStyle: 'italic' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: Theme.colors.textMuted, fontSize: 10 },
  chipScroll: { marginHorizontal: -Theme.spacing.screen, paddingHorizontal: Theme.spacing.screen },
  chip: { borderWidth: 1, borderColor: '#D0D0D0', borderRadius: Theme.borderRadius.chip, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  activeChip: { backgroundColor: Theme.colors.aiPurple, borderColor: Theme.colors.aiPurple },
  chipText: { fontSize: 13, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: '500' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aiAssistButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.greenTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Theme.borderRadius.chip, borderWidth: 1, borderColor: Theme.colors.aiPurple },
  aiAssistText: { fontSize: 12, color: Theme.colors.aiPurple, fontWeight: 'bold' },
  descriptionWrapper: { backgroundColor: Theme.colors.surfaceGray, borderRadius: Theme.borderRadius.input, borderWidth: 1, borderColor: Theme.colors.borderGray, padding: 12 },
  textArea: { height: 120, textAlignVertical: 'top', fontSize: 14, lineHeight: 20, color: Theme.colors.navyDeep },
  readerButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 10, paddingVertical: 6, paddingRight: 8 },
  readerButtonText: { color: Theme.colors.navyDeep, fontSize: 12, fontWeight: 'bold' },
  photoActionRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  actionIconButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.surfaceGray, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.borderGray, gap: 8 },
  actionIconText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.navyDeep },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoWrapper: { position: 'relative' },
  thumbnail: { width: 80, height: 80, borderRadius: 8 },
  removePhoto: { position: 'absolute', top: -5, right: -5, backgroundColor: Theme.colors.pinRed, borderRadius: 10, padding: 4, zIndex: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: Theme.spacing.screen, paddingBottom: 34, borderTopWidth: 1, borderTopColor: Theme.colors.borderGray },
  submitButton: { backgroundColor: Theme.colors.navyDeep, height: 52, borderRadius: Theme.borderRadius.button, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { opacity: 0.4 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  readerSafeArea: { flex: 1, backgroundColor: '#fff' },
  readerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.screen, borderBottomWidth: 1, borderBottomColor: Theme.colors.borderGray },
  readerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.navyDeep },
  readerClose: { color: Theme.colors.aiPurple, fontSize: 15, fontWeight: 'bold' },
  readerContent: { flex: 1, padding: Theme.spacing.screen },
  readerTextInput: { minHeight: 420, fontSize: 16, lineHeight: 24, color: Theme.colors.navyDeep, backgroundColor: Theme.colors.surfaceGray, borderRadius: Theme.borderRadius.card, borderWidth: 1, borderColor: Theme.colors.borderGray, padding: 16 },

  // Upsell Styles
  aiResultPane: { marginBottom: Theme.spacing.section },
  upsellContainer: { backgroundColor: '#f8f9fa', borderRadius: 20, padding: 16, marginTop: 12 },
  upsellHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  upsellTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.navyDeep },
  accessoryScroll: { paddingRight: 20 },
  accessoryCard: { width: 150, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  accIconBox: { height: 70, backgroundColor: '#f0f2f5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  accName: { fontSize: 12, fontWeight: '700', color: Theme.colors.navyDeep, marginBottom: 4 },
  accPrice: { fontSize: 11, fontWeight: 'bold', color: Theme.colors.workshopGreen },
  accPriceSmall: { fontSize: 9, color: '#888', fontWeight: '400' },
  interestBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.navyDeep, alignItems: 'center' },
  interestBtnActive: { backgroundColor: Theme.colors.workshopGreen, borderColor: Theme.colors.workshopGreen },
  interestBtnText: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.navyDeep },
  interestBtnTextActive: { color: '#fff' },
});

export default QuotePage;
