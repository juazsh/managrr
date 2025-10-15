import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import projectService from '../../src/services/projectService';
import AssignContractorModal from '../../src/components/assign-contractor-modal'
import EditProjectModal from '../../src/components/edit-project-modal';


const COLORS = {
  primary: '#2563EB',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  error: '#EF4444',
  success: '#10B981',
  border: '#E5E7EB',
  warning: '#F59E0B',
};

const { width } = Dimensions.get('window');

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('photos');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setError('');
      const data = await projectService.getProjectDashboard(id as string);
      setDashboard(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return COLORS.success;
      case 'draft':
        return COLORS.warning;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };

  const isOwner = user?.user_type === 'house_owner';
  const isContractor = user?.user_type === 'contractor';
  const isEmployee = user?.user_type === 'employee';

  const handleUpdateProject = async (projectData: any) => {
    await projectService.updateProject(id as string, projectData);
    await fetchDashboard();
  };

  const handleAssignContractor = async (contractorEmail: string) => {
    await projectService.assignContractor(id as string, contractorEmail);
    await fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{dashboard.project.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dashboard.project.status) }]}>
            <Text style={styles.statusText}>{dashboard.project.status}</Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <Text style={styles.description}>{dashboard.project.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estimated Cost:</Text>
            <Text style={styles.value}>
              ${Number.parseFloat(dashboard.project.estimated_cost).toLocaleString()}
            </Text>
          </View>
          {dashboard.project.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.addressText}>{dashboard.project.address}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.contactText}>{dashboard.owner_info.name}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.contactText}>{dashboard.owner_info.email}</Text>
          </View>
          {dashboard.owner_info.phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.contactText}>{dashboard.owner_info.phone}</Text>
            </View>
          )}
        </View>

        {dashboard.contractor && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Contractor</Text>
            <View style={styles.contactRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.contactText}>{dashboard.contractor.name}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.contactText}>{dashboard.contractor.email}</Text>
            </View>
            {dashboard.contractor.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.contactText}>{dashboard.contractor.phone}</Text>
              </View>
            )}
          </View>
        )}

        {!dashboard.contractor && isOwner && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Contractor</Text>
            <Text style={styles.noContractorText}>No contractor assigned yet</Text>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => setShowAssignModal(true)}
            >
              <Ionicons name="person-add" size={20} color={COLORS.white} />
              <Text style={styles.assignButtonText}>Assign Contractor</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isEmployee && (
        <>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
              onPress={() => setActiveTab('photos')}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={activeTab === 'photos' ? COLORS.primary : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
              onPress={() => setActiveTab('updates')}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={activeTab === 'updates' ? COLORS.primary : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>Updates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
              onPress={() => setActiveTab('expenses')}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={activeTab === 'expenses' ? COLORS.primary : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'worklogs' && styles.activeTab]}
              onPress={() => setActiveTab('worklogs')}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={activeTab === 'worklogs' ? COLORS.primary : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'worklogs' && styles.activeTabText]}>Work Logs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'photos' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Photos</Text>
                {dashboard.recent_photos && dashboard.recent_photos.length > 0 ? (
                  <View style={styles.photoGrid}>
                    {dashboard.recent_photos.slice(0, 6).map((photo: any) => (
                      <Image
                        key={photo.id}
                        source={{ uri: photo.photo_url }}
                        style={styles.photoImage}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No photos yet</Text>
                )}
              </View>
            )}

            {activeTab === 'updates' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Updates</Text>
                {dashboard.latest_updates && dashboard.latest_updates.length > 0 ? (
                  dashboard.latest_updates.map((update: any) => (
                    <View key={update.id} style={styles.updateCard}>
                      <View style={styles.updateHeader}>
                        <Text style={styles.updateType}>{update.update_type}</Text>
                        <Text style={styles.updateDate}>
                          {new Date(update.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.updateContent}>{update.content}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No updates yet</Text>
                )}
              </View>
            )}

            {activeTab === 'expenses' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expense Summary</Text>
                {dashboard.expense_summary && (
                  <View style={styles.expenseSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total:</Text>
                      <Text style={styles.summaryValue}>
                        ${dashboard.expense_summary.total_spent?.toLocaleString() || '0'}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>By Contractor:</Text>
                      <Text style={styles.summaryValue}>
                        ${dashboard.expense_summary.total_by_contractor?.toLocaleString() || '0'}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>By Owner:</Text>
                      <Text style={styles.summaryValue}>
                        ${dashboard.expense_summary.total_by_owner?.toLocaleString() || '0'}
                      </Text>
                    </View>
                  </View>
                )}
                {dashboard.recent_expenses && dashboard.recent_expenses.length > 0 ? (
                  dashboard.recent_expenses.map((expense: any) => (
                    <View key={expense.id} style={styles.expenseCard}>
                      <View style={styles.expenseHeader}>
                        <Text style={styles.expenseAmount}>${expense.amount.toLocaleString()}</Text>
                        <Text style={styles.expenseCategory}>{expense.category}</Text>
                      </View>
                      {expense.vendor && <Text style={styles.expenseVendor}>{expense.vendor}</Text>}
                      <Text style={styles.expenseDate}>
                        {new Date(expense.date).toLocaleDateString()} • Paid by {expense.paid_by}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No expenses recorded</Text>
                )}
              </View>
            )}

            {activeTab === 'worklogs' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Logs Summary</Text>
                {dashboard.work_logs_summary && (
                  <View style={styles.workLogSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Hours:</Text>
                      <Text style={styles.summaryValue}>
                        {dashboard.work_logs_summary.total_hours?.toFixed(1) || '0'} hrs
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>This Week:</Text>
                      <Text style={styles.summaryValue}>
                        {dashboard.work_logs_summary.this_week_hours?.toFixed(1) || '0'} hrs
                      </Text>
                    </View>
                  </View>
                )}
                {dashboard.recent_check_ins && dashboard.recent_check_ins.length > 0 ? (
                  dashboard.recent_check_ins.map((log: any) => (
                    <View key={log.id} style={styles.workLogCard}>
                      <Text style={styles.workLogEmployee}>{log.employee_name}</Text>
                      <Text style={styles.workLogTime}>
                        {new Date(log.check_in_time).toLocaleString()}
                      </Text>
                      {log.hours_worked && (
                        <Text style={styles.workLogHours}>{log.hours_worked.toFixed(1)} hours</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No work logs yet</Text>
                )}
              </View>
            )}
          </View>
        </>
      )}
      
      {showEditModal && (
        <EditProjectModal
          visible={showEditModal}
          project={dashboard.project}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateProject}
        />
      )}

      {showAssignModal && (
        <AssignContractorModal
          visible={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignContractor}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    marginRight: 8,
  },
  editButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoSection: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  noContractorText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoImage: {
    width: (width - 64) / 3,
    height: (width - 64) / 3,
    borderRadius: 8,
  },
  updateCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  updateType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  updateDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  updateContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  expenseSummary: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  expenseCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  expenseCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  expenseVendor: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  workLogSummary: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  workLogCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  workLogEmployee: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  workLogTime: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  workLogHours: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});