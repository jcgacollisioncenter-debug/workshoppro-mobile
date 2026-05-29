import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarView } from 'react-native-calendars';
import * as ExpoCalendar from 'expo-calendar';
import { CalendarPlus, CheckCircle2, ChevronLeft, Info, Clock, MapPin } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const CalendarPage = ({ onNext, onBack, aiEstimate, workshopSettings }: { 
  onNext: () => void, 
  onBack: () => void,
  aiEstimate: any,
  workshopSettings: any
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // DYNAMIC AVAILABILITY ALGORITHM
  const generateAvailableSlots = (date: string) => {
    // 1. Calculate Daily Capacity in Hours
    const activeBays = workshopSettings?.capacity || 12;
    const totalDailyHours = activeBays * 8; 

    // 2. Estimate required time for this job
    const repairHours = aiEstimate?.duration?.hours || 4;
    
    // 3. Simulated existing load for the date (In real app, fetch from database)
    const simulatedLoadHours = Math.random() * (totalDailyHours * 0.8);
    const remainingHours = totalDailyHours - simulatedLoadHours;

    // 4. YieldMax Influence: High yield jobs see "Priority Slots"
    const isHighYield = (aiEstimate?.priorityScore || 0) > 0.7;

    // Generate slots based on remaining capacity
    const slots = [
      { id: '1', time: '08:00 AM', available: remainingHours > repairHours },
      { id: '2', time: '10:30 AM', available: remainingHours > (repairHours + 2) },
      { id: '3', time: '01:30 PM', available: remainingHours > (repairHours + 4) || isHighYield },
      { id: '4', time: '04:00 PM', available: remainingHours > (repairHours + 6) || isHighYield }
    ];

    return slots;
  };

  const currentSlots = selectedDate ? generateAvailableSlots(selectedDate) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack}><ChevronLeft color="#fff" size={28} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Visit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Yield-Aware Budget Header */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>REPAIR ESTIMATE</Text>
          <Text style={styles.budgetAmount}>${aiEstimate?.total?.min || 850} - ${aiEstimate?.total?.max || 1200} <Text style={styles.currency}>CAD</Text></Text>
          <View style={styles.durationBadge}>
            <Clock size={14} color={Theme.colors.aiPurple} />
            <Text style={styles.durationText}>Est. Time: {aiEstimate?.duration?.hours || 14} hours</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Arrival Date</Text>
          <CalendarView
            minDate={today}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: Theme.colors.navyDeep } }}
            theme={{ todayTextColor: Theme.colors.workshopGreen, arrowColor: Theme.colors.navyDeep }}
          />
        </View>

        {selectedDate !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Available Windows</Text>
            <View style={styles.timeGrid}>
              {currentSlots.map(slot => (
                <TouchableOpacity 
                  key={slot.id} 
                  disabled={!slot.available}
                  style={[styles.timeSlot, selectedSlot === slot.id && styles.activeSlot, !slot.available && styles.disabledSlot]}
                  onPress={() => setSelectedSlot(slot.id)}
                >
                  <Text style={[styles.timeText, selectedSlot === slot.id && styles.activeTimeText, !slot.available && styles.disabledTimeText]}>{slot.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.capacityHint}>Availability is dynamic based on workshop bay load.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmButton, (!selectedDate || !selectedSlot) && styles.btnDisabled]} 
          onPress={() => setShowConfirmation(true)}
          disabled={!selectedDate || !selectedSlot}
        >
          <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmationCard}>
            <CheckCircle2 size={48} color={Theme.colors.workshopGreen} />
            <Text style={styles.confirmTitle}>Appointment Set</Text>
            <Text style={styles.confirmSub}>We've reserved a bay for your {aiEstimate?.vehicle || 'vehicle'} on {selectedDate}.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={onNext}><Text style={styles.doneBtnText}>View Workshop Location</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.navyDeep },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  budgetCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, marginBottom: 20 },
  budgetLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
  budgetAmount: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  currency: { fontSize: 12, fontWeight: 'normal' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(83, 74, 183, 0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 15, textTransform: 'uppercase' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { width: '47%', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center', backgroundColor: '#f8f9fa' },
  activeSlot: { backgroundColor: Theme.colors.navyDeep, borderColor: Theme.colors.navyDeep },
  disabledSlot: { opacity: 0.3 },
  timeText: { fontWeight: 'bold', color: '#1a1a2e' },
  activeTimeText: { color: '#fff' },
  disabledTimeText: { color: '#888' },
  capacityHint: { fontSize: 11, color: '#888', marginTop: 15, fontStyle: 'italic' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { backgroundColor: Theme.colors.workshopGreen, padding: 18, borderRadius: 14, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#ccc' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 },
  confirmationCard: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center' },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#1a1a2e' },
  confirmSub: { textAlign: 'center', color: '#666', marginVertical: 15 },
  doneBtn: { backgroundColor: '#1a1a2e', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12 },
  doneBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default CalendarPage;
