import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  primary: '#2563EB',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB',
  success: '#10B981',
};

interface EditProjectModalProps {
  visible: boolean;
  project: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function EditProjectModal({ visible, project, onClose, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    estimated_cost: project.estimated_cost.toString(),
    address: project.address,
    status: project.status,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      newErrors.estimated_cost = 'Valid cost is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        estimated_cost: parseFloat(formData.estimated_cost),
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Project</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Project Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                setErrors({ ...errors, title: '' });
              }}
              editable={!loading}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                setErrors({ ...errors, description: '' });
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Estimated Cost <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.currencyField, errors.estimated_cost && styles.inputError]}
                value={formData.estimated_cost}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  setFormData({ ...formData, estimated_cost: cleanText });
                  setErrors({ ...errors, estimated_cost: '' });
                }}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
            {errors.estimated_cost && <Text style={styles.errorText}>{errors.estimated_cost}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(text) => {
                setFormData({ ...formData, address: text });
                setErrors({ ...errors, address: '' });
              }}
              editable={!loading}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Draft" value="draft" />
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Completed" value="completed" />
              </Picker>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    zIndex: 1,
  },
  currencyField: {
    paddingLeft: 28,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: COLORS.white,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.error,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});