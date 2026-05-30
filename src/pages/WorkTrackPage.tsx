import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Circle, Clock, ChevronLeft, Car, Tool, SprayCan, Sparkles, ClipboardCheck } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const REPAIR_STEPS = [
  { id: 'inspection', label: 'Physical Inspection', icon: ClipboardCheck },
  { id: 'disassembly', label: 'Disassembly', icon: Tool },
  { id: 'bodywork', label: 'Body Work (Metal)', icon: Car },
  { id: 'prep', label: 'Surface Preparation', icon: Tool },
  { id: 'paint', label: 'Paint & Refinish', icon: SprayCan },
  { id: 'reassembly', label: 'Reassembly', icon: Tool },
  { id: 'detailing', label: 'Detailing & Cleaning', icon: Sparkles },
  { id: 'ready', label: 'Ready for Pickup', icon: CheckCircle2 },
];

const WorkTrackPage = ({ onBack, repairPlan }: { onBack: () => void, repairPlan: any }) => {
  // Use repairPlan data from backend
  const plan = repairPlan || {
    step_inspection: 2,
    step_disassembly: 2,
    step_bodywork: 1,
    step_prep: 0,
    step_paint: 0,
    step_reassembly: 0,
    step_detailing: 0,
    step_ready: 0,
    progress_percentage: 31
  };

  const getStepStatus = (stepId: string) => {
    return plan[`step_${stepId}`] || 0; // 0: pending, 1: in_progress, 2: completed
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack}><ChevronLeft color="#fff" size={28} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Repair Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>OVERALL PROGRESS</Text>
            <Text style={styles.progressValue}>{plan.progress_percentage}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${plan.progress_percentage}%` }]} />
          </View>
          <View style={styles.statusBadge}>
            <Clock size={14} color={Theme.colors.aiPurple} />
            <Text style={styles.statusText}>Estimated Completion: 3-5 Business Days</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Repair Journey</Text>
        
        <View style={styles.stepsList}>
          {REPAIR_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.iconCircle, 
                    status === 2 && styles.iconCompleted,
                    status === 1 && styles.iconInProgress
                  ]}>
                    <StepIcon 
                      size={20} 
                      color={status === 2 ? '#fff' : status === 1 ? Theme.colors.aiPurple : '#888'} 
                    />
                  </View>
                  {index < REPAIR_STEPS.length - 1 && (
                    <View style={[
                      styles.stepConnector,
                      status === 2 && styles.connectorCompleted
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    status === 2 && styles.labelCompleted,
                    status === 1 && styles.labelInProgress
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepStatusText}>
                    {status === 2 ? 'Completed' : status === 1 ? 'Current Stage' : 'Pending'}
                  </Text>
                </View>

                {status === 2 && (
                  <CheckCircle2 size={24} color={Theme.colors.workshopGreen} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.navyDeep },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  progressCard: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, marginBottom: 30 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  progressLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold' },
  progressValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden', marginBottom: 20 },
  progressBarFill: { height: '100%', backgroundColor: Theme.colors.workshopGreen },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(83, 74, 183, 0.2)', padding: 12, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.navyDeep, marginBottom: 20 },
  stepsList: { paddingLeft: 10 },
  stepItem: { flexDirection: 'row', marginBottom: 0, minHeight: 80 },
  stepLeft: { alignItems: 'center', width: 40, marginRight: 15 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee', zIndex: 1 },
  iconCompleted: { backgroundColor: Theme.colors.workshopGreen, borderColor: Theme.colors.workshopGreen },
  iconInProgress: { backgroundColor: 'rgba(83, 74, 183, 0.1)', borderColor: Theme.colors.aiPurple, borderWidth: 2 },
  stepConnector: { width: 2, flex: 1, backgroundColor: '#eee', marginVertical: -5 },
  connectorCompleted: { backgroundColor: Theme.colors.workshopGreen },
  stepContent: { flex: 1, paddingTop: 5 },
  stepLabel: { fontSize: 15, fontWeight: 'bold', color: '#888' },
  labelCompleted: { color: Theme.colors.navyDeep },
  labelInProgress: { color: Theme.colors.aiPurple },
  stepStatusText: { fontSize: 12, color: '#aaa', marginTop: 4 },
  footer: { padding: 20, backgroundColor: '#fff' }
});

export default WorkTrackPage;
