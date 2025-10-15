import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';

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
  purple: '#8B5CF6',
};

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_cost: number;
  address: string;
  created_at: string;
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      setError('');
      const response = await api.get('/projects');
      setProjects(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
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

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/project/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        {item.estimated_cost > 0 && (
          <View style={styles.costContainer}>
            <Text style={styles.costLabel}>Budget:</Text>
            <Text style={styles.costValue}>
              ${item.estimated_cost.toLocaleString()}
            </Text>
          </View>
        )}

        {item.address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.address} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No projects yet</Text>
      <Text style={styles.emptyText}>
        {user?.user_type === 'house_owner'
          ? 'Create your first project to start managing your construction work'
          : 'Projects assigned to you will appear here'}
      </Text>
      {user?.user_type === 'house_owner' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/project/new')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.createButtonText}>Create First Project</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          projects.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {user?.user_type === 'house_owner' && projects.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/project/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
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
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  projectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    gap: 8,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});