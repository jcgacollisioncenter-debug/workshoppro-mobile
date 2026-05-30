import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  Switch,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  TrendingUp,
  ArrowUpRight,
  GripVertical,
  Share2,
  Key,
  Plus,
  Trash2,
  Copy,
  Globe,
  Settings,
  CreditCard,
  Save,
  Zap,
  Rocket,
  Target,
  X,
  Package,
  CalendarDays,
  MapPin,
  LocateFixed
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { 
  fetchAdminQuotes, 
  fetchWorkshopSettings, 
  updateWorkshopSettings, 
  updateRepairPlanStatus 
} from '../services/vehicleService';
import { Theme } from '../styles/theme';

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('estimates');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(true);
  const [autopilotThreshold, setAutopilotThreshold] = useState(2500);
  const [alertCount, setAlertCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Integration & Store States
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [newAcc, setNewAcc] = useState({ name: '', price: '', install: '', stock: '' });
  const [workshopCapacity, setWorkshopCapacity] = useState(12);
  const [workshopPhone, setWorkshopPhone] = useState('');
  const [workshopWebsite, setWorkshopWebsite] = useState('');
  const [workshopLocation, setWorkshopLocation] = useState<{lat: number, lng: number} | null>(null);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plansData, settingsData] = await Promise.all([
          fetchAdminQuotes(),
          fetchWorkshopSettings()
        ]);
        
        setQuotes(plansData);
        setWorkshopCapacity(settingsData.bay_capacity);
        setWorkshopPhone(settingsData.phone_number || '');
        setWorkshopWebsite(settingsData.website_url || '');
        if (settingsData.latitude && settingsData.longitude) {
          setWorkshopLocation({ lat: settingsData.latitude, lng: settingsData.longitude });
        }
        setIsAutopilotEnabled(settingsData.autopilot_enabled);
        setAutopilotThreshold(settingsData.autopilot_trust_limit);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Payment Config
  const [paymentConfig, setPaymentConfig] = useState({ provider: 'stripe', is_enabled: true, is_visible_to_users: true, api_key_public: '' });

  // YieldMax™ Logic
  const [priorityWeights, setWeights] = useState({ profitability: 0.5, velocity: 0.3, severity: 0.2 });

  // Moderation States
  const [verifiedSegments, setVerifiedSegments] = useState({ labour: false, parts: false, paint: false, duration: false });
  const [finalLabour, setFinalLabour] = useState('');
  const [finalParts, setFinalParts] = useState('');
  const [finalPaint, setFinalPaint] = useState('');
  const [finalDuration, setFinalDuration] = useState('');

  // Check for alerts
  useEffect(() => {
    if (isAutopilotEnabled) {
      const highValue = quotes.filter(q => q.status === 'pending' && q.aiEstimate.total.max > autopilotThreshold);
      setAlertCount(highValue.length);
    } else {
      setAlertCount(0);
    }
  }, [isAutopilotEnabled, autopilotThreshold, quotes]);

  const openQuoteReview = (quote: any) => {
    setSelectedQuote(quote);
    setFinalLabour(quote.aiEstimate.labour.toString());
    setFinalParts(quote.aiEstimate.parts.toString());
    setFinalPaint(quote.aiEstimate.paint.toString());
    setFinalDuration(quote.aiEstimate.duration.hours.toString());
    setVerifiedSegments({ labour: false, parts: false, paint: false, duration: false });
  };

  const toggleSegment = (segment: keyof typeof verifiedSegments) => {
    setVerifiedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
  };

  const handleFinalApproval = () => {
    Alert.alert("Quote Approved", "Estimate finalized.");
    setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? { ...q, status: 'approved' } : q));
    setSelectedQuote(null);
  };

  const handleGenerateMobileKey = () => {
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      key_name: `Key ${apiKeys.length + 1}`,
      api_key: `wp_live_${Math.random().toString(36).substr(2, 24)}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
    Alert.alert("Success", "New API key generated.");
  };

  const handleAddAcc = () => {
    if (!newAcc.name || !newAcc.price) return;
    const item = { id: Math.random().toString(36).substr(2, 9), name: newAcc.name, price: Number(newAcc.price), install_price: Number(newAcc.install || 0), stock: Number(newAcc.stock || 0) };
    setAccessories([item, ...accessories]);
    setNewAcc({ name: '', price: '', install: '', stock: '' });
    Alert.alert("Success", "Product added.");
  };

  const handleSetCurrentLocation = () => {
    // Simulated pinning (In real app use expo-location)
    const lat = 43.6532;
    const lng = -79.3832;
    setWorkshopLocation({ lat, lng });
    Alert.alert("Location Pinned", `Workshop geopositional coordinates set to: ${lat}, ${lng}. Customers can now find you on Google Maps.`);
  };

  const isFullyVerified = Object.values(verifiedSegments).every(v => v === true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Staff Control</Text>
          {isAutopilotEnabled && (
            <View style={styles.autopilotBadge}>
              <CheckCircle2 size={12} color={Theme.colors.aiPurple} />
              <Text style={styles.autopilotBadgeText}>Autopilot</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onLogout}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          {['estimates', 'calendar', 'store', 'payments', 'integrations'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              {tab === 'estimates' && <LayoutDashboard size={18} color={activeTab === tab ? Theme.colors.navyDeep : '#888'} />}
              {tab === 'calendar' && <CalendarIcon size={18} color={activeTab === tab ? Theme.colors.navyDeep : '#888'} />}
              {tab === 'store' && <Package size={18} color={activeTab === tab ? Theme.colors.navyDeep : '#888'} />}
              {tab === 'payments' && <CreditCard size={18} color={activeTab === tab ? Theme.colors.navyDeep : '#888'} />}
              {tab === 'integrations' && <Share2 size={18} color={activeTab === tab ? Theme.colors.navyDeep : '#888'} />}
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
              {tab === 'estimates' && alertCount > 0 && <View style={styles.tabBadge} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'estimates' && (
          <View style={styles.pane}>
            {alertCount > 0 && (
              <View style={styles.alarmBox}>
                <AlertCircle size={20} color="#fff" />
                <Text style={styles.alarmText}>{alertCount} critical repairs require manual review.</Text>
              </View>
            )}
            <View style={[styles.autopilotCard, isAutopilotEnabled && styles.aiCardActive]}>
              <View style={styles.autoRow}>
                <View style={styles.aiTitleGroup}>
                  <View style={[styles.indicatorLight, isAutopilotEnabled && styles.indicatorOn]} />
                  <Zap size={18} color={isAutopilotEnabled ? Theme.colors.aiPurple : '#888'} />
                  <Text style={[styles.autoTitle, isAutopilotEnabled && { color: Theme.colors.aiPurple }]}>AI Autopilot</Text>
                </View>
                <Switch value={isAutopilotEnabled} onValueChange={setIsAutopilotEnabled} trackColor={{ true: Theme.colors.aiPurple }} />
              </View>
              {isAutopilotEnabled && (
                <View style={styles.thresholdControl}>
                  <View style={styles.thresholdLabelRow}><Text style={styles.thresholdLabel}>Limit:</Text><Text style={styles.thresholdValue}>${autopilotThreshold}</Text></View>
                  <Slider style={{ width: '100%', height: 40 }} minimumValue={500} maximumValue={10000} step={500} value={autopilotThreshold} onValueChange={setAutopilotThreshold} minimumTrackTintColor={Theme.colors.aiPurple} />
                </View>
              )}
            </View>
            <Text style={styles.sectionTitle}>Repair Requests</Text>
            {quotes.map(quote => {
              const isOverLimit = quote.aiEstimate.total.max > autopilotThreshold;
              return (
                <TouchableOpacity key={quote.id} style={[styles.quoteCard, quote.status === 'approved' && styles.approvedCard, (isAutopilotEnabled && isOverLimit) && styles.urgentCard]} onPress={() => quote.status === 'pending' && openQuoteReview(quote)}>
                  <View style={styles.quoteInfo}>
                    <Text style={styles.customerName}>{quote.customer}</Text>
                    <Text style={styles.vehicleName}>{quote.vehicle}</Text>
                  </View>
                  <View style={styles.quoteMeta}>
                    <Text style={styles.amountText}>${quote.aiEstimate.total.min}-${quote.aiEstimate.total.max}</Text>
                    {quote.status === 'approved' ? <CheckCircle2 size={18} color={Theme.colors.workshopGreen} /> : <ChevronRight size={18} color={Theme.colors.navyDeep} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === 'calendar' && (
          <View style={styles.pane}>
            <View style={styles.card}>
              <View style={styles.paneHeader}><CalendarDays size={22} color={Theme.colors.navyDeep} /><Text style={styles.paneTitle}>Today's Work Plan</Text></View>
              {quotes.filter(q => q.status === 'approved' || q.status === 'confirmed').length > 0 ? (
                quotes.filter(q => q.status === 'approved' || q.status === 'confirmed').map(item => (
                  <View key={item.id} style={styles.scheduleItem}>
                    <View style={styles.timeTag}><Text style={styles.timeTagText}>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</Text></View>
                    <View style={styles.itemMain}>
                      <Text style={styles.itemVehicle}>{item.vehicle?.make} {item.vehicle?.model}</Text>
                      <Text style={styles.itemType}>{item.current_step || 'In Queue'} · {item.client_name || 'Generic'}</Text>
                    </View>
                    <CheckCircle2 size={18} color={item.progress_percentage === 100 ? Theme.colors.workshopGreen : "#ddd"} />
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No active repairs scheduled for today.</Text>
                </View>
              )}
            </View>
            <View style={styles.yieldMaxCard}>
              <View style={styles.yieldHeader}><Rocket size={24} color={Theme.colors.aiPurple} /><Text style={styles.yieldTitle}>YieldMax™ Priority</Text></View>
              <View style={styles.weightControl}><Text style={styles.weightLabel}>Profitability</Text><Slider style={{flex:1}} minimumValue={0} maximumValue={1} value={priorityWeights.profitability} onValueChange={v => setWeights({...priorityWeights, profitability: v})} /></View>
              <View style={styles.weightControl}><Text style={styles.weightLabel}>Velocity</Text><Slider style={{flex:1}} minimumValue={0} maximumValue={1} value={priorityWeights.velocity} onValueChange={v => setWeights({...priorityWeights, velocity: v})} /></View>
              <View style={styles.capacityCard}>
                <View style={styles.thresholdLabelRow}><Text style={styles.capLabel}>Workshop Capacity:</Text><Text style={styles.thresholdValue}>{workshopCapacity} Bays</Text></View>
                <Slider style={{ width: '100%', height: 40 }} minimumValue={1} maximumValue={30} step={1} value={workshopCapacity} onValueChange={setWorkshopCapacity} minimumTrackTintColor={Theme.colors.workshopGreen} />
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '72%' }]} /></View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'store' && (
          <View style={styles.pane}>
            <View style={styles.card}>
              <View style={styles.paneHeader}><Package size={24} color={Theme.colors.workshopGreen} /><Text style={styles.paneTitle}>Workshop Store</Text></View>
              <View style={styles.accForm}>
                <TextInput style={styles.standardInput} placeholder="Product Name" value={newAcc.name} onChangeText={v => setNewAcc({...newAcc, name: v})} />
                <View style={styles.autoRow}>
                  <TextInput style={[styles.standardInput, {flex:1}]} placeholder="Price $" value={newAcc.price} onChangeText={v => setNewAcc({...newAcc, price: v})} keyboardType="numeric" />
                  <TextInput style={[styles.standardInput, {flex:1, marginLeft: 10}]} placeholder="Stock" value={newAcc.stock} onChangeText={v => setNewAcc({...newAcc, stock: v})} keyboardType="numeric" />
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleAddAcc}><Plus size={18} color="#fff" /><Text style={styles.primaryBtnText}>Add Product</Text></TouchableOpacity>
              </View>
              <Text style={[styles.sectionTitle, {marginTop: 20}]}>Current Inventory</Text>
              {accessories.map(acc => (
                <View key={acc.id} style={styles.apiKeyItem}>
                  <View style={styles.keyMeta}><Text style={styles.keyName}>{acc.name}</Text><Text style={styles.keyDate}>Stock: {acc.stock}</Text></View>
                  <View style={styles.keyValRow}><Text style={styles.amountText}>${acc.price} + ${acc.install_price} inst.</Text><TouchableOpacity onPress={() => setAccessories(accessories.filter(a => a.id !== acc.id))}><Trash2 size={16} color={Theme.colors.pinRed} /></TouchableOpacity></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'payments' && (
          <View style={styles.pane}>
            <View style={styles.card}>
              <View style={styles.paneHeader}><CreditCard size={24} color={Theme.colors.workshopGreen} /><Text style={styles.paneTitle}>Payments</Text></View>
              <View style={styles.settingRow}><Text style={styles.settingLabel}>Enable Gateway</Text><Switch value={true} /></View>
              <View style={styles.settingRow}><Text style={styles.settingLabel}>Visible to Clients</Text><Switch value={true} /></View>
              <Text style={styles.fieldLabel}>PROVIDER</Text>
              <View style={styles.providerSelector}>
                <TouchableOpacity style={[styles.providerBtn, paymentConfig.provider === 'stripe' && styles.providerActive]} onPress={() => setPaymentConfig({...paymentConfig, provider: 'stripe'})}><Text style={[styles.providerText, paymentConfig.provider === 'stripe' && styles.providerTextActive]}>STRIPE</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.providerBtn, paymentConfig.provider === 'paypal' && styles.providerActive]} onPress={() => setPaymentConfig({...paymentConfig, provider: 'paypal'})}><Text style={[styles.providerText, paymentConfig.provider === 'paypal' && styles.providerTextActive]}>PAYPAL</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveBtn}><Save size={18} color="#fff" /><Text style={styles.saveBtnText}>Save Settings</Text></TouchableOpacity>
            </View>

            <View style={[styles.card, {marginTop: 20}]}>
              <View style={styles.paneHeader}><MapPin size={24} color={Theme.colors.pinRed} /><Text style={styles.paneTitle}>Workshop Contact & Location</Text></View>
              
              <Text style={styles.fieldLabel}>WORKSHOP PHONE</Text>
              <TextInput 
                style={styles.standardInput} 
                placeholder="+1 416 555 0123" 
                value={workshopPhone} 
                onChangeText={setWorkshopPhone} 
                keyboardType="phone-pad" 
              />
              
              <Text style={[styles.fieldLabel, {marginTop: 15}]}>WORKSHOP WEBSITE</Text>
              <TextInput 
                style={styles.standardInput} 
                placeholder="www.workshoppro.com" 
                value={workshopWebsite} 
                onChangeText={setWorkshopWebsite} 
                autoCapitalize="none"
              />

              <Text style={[styles.yieldDesc, {marginTop: 20}]}>Pin your physical location for customer navigation.</Text>
              {workshopLocation ? (
                <View style={styles.locationBadge}><CheckCircle2 size={14} color={Theme.colors.workshopGreen} /><Text style={styles.locationText}>Location Set: {workshopLocation.lat}, {workshopLocation.lng}</Text></View>
              ) : (
                <View style={styles.locationBadgeEmpty}><AlertCircle size={14} color="#888" /><Text style={styles.locationTextEmpty}>Location not set</Text></View>
              )}
              <TouchableOpacity style={styles.locationBtn} onPress={handleSetCurrentLocation}>
                <LocateFixed size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Pin Current Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'integrations' && (
          <View style={styles.pane}>
            <View style={styles.card}>
              <View style={styles.paneHeader}><Share2 size={24} color={Theme.colors.aiPurple} /><Text style={styles.paneTitle}>Integrations</Text></View>
              <View style={styles.apiKeyHeader}><Key size={18} color={Theme.colors.navyDeep} /><Text style={styles.apiKeyTitle}>Active Keys</Text></View>
              {apiKeys.map(k => (
                <View key={k.id} style={styles.apiKeyItem}>
                  <Text style={styles.keyName}>{k.key_name}</Text>
                  <View style={styles.keyValRow}><Text style={styles.keyVal}>{k.api_key}</Text><TouchableOpacity onPress={() => setApiKeys(apiKeys.filter(key => key.id !== k.id))}><Trash2 size={16} color={Theme.colors.pinRed} /></TouchableOpacity></View>
                </View>
              ))}
              <TouchableOpacity style={styles.dashedBtn} onPress={handleGenerateMobileKey}><Plus size={18} color={Theme.colors.navyDeep} /><Text style={styles.dashedBtnText}>Generate New Key</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={selectedQuote !== null} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Segregated Review</Text><TouchableOpacity onPress={() => setSelectedQuote(null)}><Text style={styles.closeModal}>Close</Text></TouchableOpacity></View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.reviewBanner}><Text style={styles.reviewVehicle}>{selectedQuote?.vehicle}</Text><Text style={styles.reviewCustomer}>{selectedQuote?.customer}</Text></View>
            {['labour', 'parts', 'duration'].map((seg) => (
              <View key={seg} style={[styles.segment, verifiedSegments[seg as keyof typeof verifiedSegments] && styles.verifiedSegment]}>
                <View style={styles.segmentHeader}><Text style={styles.segmentLabel}>{seg.toUpperCase()}</Text></View>
                <View style={styles.segmentBody}>
                  <TextInput style={styles.segInput} value={seg === 'labour' ? finalLabour : seg === 'parts' ? finalParts : finalDuration} keyboardType="numeric" />
                  <TouchableOpacity style={[styles.verifyBtn, verifiedSegments[seg as keyof typeof verifiedSegments] && styles.verifiedBtn]} onPress={() => toggleSegment(seg as keyof typeof verifiedSegments)}><CheckCircle2 size={18} color="#fff" /></TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.approveBtn, !isFullyVerified && styles.disabledApprove]} disabled={!isFullyVerified} onPress={handleFinalApproval}><FileText size={20} color="#fff" /><Text style={styles.approveBtnText}>Finalize Estimate</Text></TouchableOpacity>
            
            {selectedQuote?.status === 'approved' && (
              <View style={styles.repairPlanAdmin}>
                <Text style={styles.sectionTitle}>Repair Journey Management</Text>
                {[
                  { id: 'inspection', label: '1. Physical Inspection' },
                  { id: 'disassembly', label: '2. Disassembly' },
                  { id: 'bodywork', label: '3. Body Work (Metal)' },
                  { id: 'prep', label: '4. Surface Prep' },
                  { id: 'paint', label: '5. Paint & Finish' },
                  { id: 'reassembly', label: '6. Reassembly' },
                  { id: 'detailing', label: '7. Detailing & Wash' },
                  { id: 'ready', label: '8. Ready for Pickup' }
                ].map((step) => (
                  <View key={step.id} style={styles.stepAdminRow}>
                    <Text style={styles.stepAdminLabel}>{step.label}</Text>
                    <View style={styles.stepStatusToggle}>
                      {[0, 1, 2].map((s) => (
                        <TouchableOpacity 
                          key={s} 
                          style={[
                            styles.statusDot, 
                            s === 0 && styles.statusPending, 
                            s === 1 && styles.statusWorking, 
                            s === 2 && styles.statusDone,
                            // In real app, bind to state
                          ]}
                        >
                          <Text style={styles.statusDotText}>{s === 0 ? 'P' : s === 1 ? 'W' : 'D'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: Theme.colors.navyDeep },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  autopilotBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(83, 74, 183, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: Theme.colors.aiPurple },
  autopilotBadgeText: { fontSize: 10, color: Theme.colors.aiPurple, fontWeight: 'bold' },
  logoutText: { color: Theme.colors.pinRed, fontWeight: 'bold' },
  tabContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabBarScroll: { paddingHorizontal: 20, paddingVertical: 10 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, marginRight: 10, borderRadius: 20, gap: 8, backgroundColor: '#f0f2f5' },
  activeTab: { backgroundColor: Theme.colors.greenTint },
  tabText: { fontSize: 12, color: '#888', fontWeight: '600' },
  activeTabText: { color: Theme.colors.navyDeep, fontWeight: 'bold' },
  tabBadge: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.pinRed, position: 'absolute', top: 5, right: 10 },
  content: { flex: 1, padding: 20 },
  pane: { gap: 16 },
  alarmBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.pinRed, padding: 12, borderRadius: 12, gap: 10, marginBottom: 20 },
  alarmText: { color: '#fff', fontSize: 11, fontWeight: 'bold', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.navyDeep, marginBottom: 15 },
  quoteCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  approvedCard: { opacity: 0.6, backgroundColor: '#f9f9f9' },
  urgentCard: { borderColor: Theme.colors.pinRed, borderLeftWidth: 4, borderLeftColor: Theme.colors.pinRed },
  quoteInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.navyDeep },
  vehicleName: { fontSize: 12, color: '#666' },
  quoteMeta: { alignItems: 'flex-end', gap: 6 },
  amountText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.workshopGreen },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  paneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  paneTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.navyDeep },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeTag: { backgroundColor: '#f0f2f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  timeTagText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  itemMain: { flex: 1 },
  itemVehicle: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.navyDeep },
  itemType: { fontSize: 11, color: '#888' },
  yieldMaxCard: { backgroundColor: '#fff', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  yieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  yieldTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.navyDeep },
  yieldDesc: { fontSize: 12, color: '#666', marginBottom: 20 },
  weightControl: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  weightLabel: { width: 90, fontSize: 11, color: '#444', fontWeight: 'bold' },
  capacityCard: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  capLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  progressTrack: { height: 8, backgroundColor: '#f0f2f5', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.colors.workshopGreen },
  thresholdLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  thresholdValue: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.aiPurple },
  autopilotCard: { backgroundColor: Theme.colors.surfaceGray, padding: 15, borderRadius: 16, marginTop: 10, borderLeftWidth: 5, borderLeftColor: 'transparent' },
  aiCardActive: { borderLeftColor: Theme.colors.aiPurple },
  autoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  indicatorLight: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  indicatorOn: { backgroundColor: Theme.colors.aiPurple, shadowColor: Theme.colors.aiPurple, shadowRadius: 5, shadowOpacity: 1 },
  autoTitle: { fontSize: 15, fontWeight: 'bold', color: '#666' },
  thresholdControl: { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 12 },
  thresholdLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  accForm: { gap: 10 },
  standardInput: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 14, color: Theme.colors.navyDeep },
  primaryBtn: { backgroundColor: Theme.colors.navyDeep, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  fieldLabel: { fontSize: 10, color: '#888', fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  providerSelector: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  providerBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  providerActive: { borderColor: Theme.colors.navyDeep, backgroundColor: 'rgba(26, 26, 46, 0.05)' },
  providerText: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  providerTextActive: { color: Theme.colors.navyDeep },
  saveBtn: { backgroundColor: Theme.colors.navyDeep, padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f5e9', padding: 12, borderRadius: 10, marginBottom: 15 },
  locationBadgeEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0f2f5', padding: 12, borderRadius: 10, marginBottom: 15 },
  locationText: { fontSize: 13, fontWeight: 'bold', color: Theme.colors.workshopGreen },
  locationTextEmpty: { fontSize: 13, color: '#888' },
  locationBtn: { backgroundColor: Theme.colors.aiPurple, padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  apiKeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, marginTop: 10 },
  apiKeyTitle: { fontSize: 14, fontWeight: 'bold' },
  apiKeyItem: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 12 },
  keyName: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  keyValRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  keyVal: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: Theme.colors.aiPurple },
  dashedBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  dashedBtnText: { color: Theme.colors.navyDeep, fontWeight: 'bold' },
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.navyDeep },
  closeModal: { color: Theme.colors.pinRed, fontWeight: 'bold' },
  modalContent: { flex: 1, padding: 20 },
  reviewBanner: { marginBottom: 25 },
  reviewVehicle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.navyDeep },
  reviewCustomer: { fontSize: 14, color: '#666' },
  segment: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  verifiedSegment: { backgroundColor: Theme.colors.greenTint, borderColor: Theme.colors.workshopGreen },
  segmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  segmentLabel: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.navyDeep },
  segmentBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  segInput: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.navyDeep, flex: 1 },
  verifyBtn: { backgroundColor: Theme.colors.navyDeep, padding: 12, borderRadius: 12 },
  verifiedBtn: { backgroundColor: Theme.colors.workshopGreen },
  approveBtn: { backgroundColor: Theme.colors.workshopGreen, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  disabledApprove: { backgroundColor: '#ccc' },
  approveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  repairPlanAdmin: { marginTop: 30, paddingTop: 30, borderTopWidth: 1, borderTopColor: '#eee' },
  stepAdminRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  stepAdminLabel: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.navyDeep },
  stepStatusToggle: { flexDirection: 'row', gap: 10 },
  statusDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd' },
  statusPending: { },
  statusWorking: { backgroundColor: 'rgba(83, 74, 183, 0.1)', borderColor: Theme.colors.aiPurple },
  statusDone: { backgroundColor: Theme.colors.workshopGreen, borderColor: Theme.colors.workshopGreen },
  statusDotText: { fontSize: 10, fontWeight: 'bold', color: '#888' }
});

export default AdminDashboard;
