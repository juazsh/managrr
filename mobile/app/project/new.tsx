import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import projectService from '../../src/services/projectService';

const COLORS = {
  primary: '#2563EB',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB',
};

export default function CreateProjectScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_cost: '',
    address: '',
  });
  const [photos, setPhotos] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      newErrors.estimated_cost = 'Please enter a valid estimated cost';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to upload photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const projectData = {
        ...formData,
        estimated_cost: parseFloat(formData.estimated_cost),
        photos,
      };

      const response = await projectService.createProject(projectData);
      Alert.alert('Success', 'Project created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push(`/project/${response.project.id}`),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Project</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Project Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Kitchen Renovation"
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
              placeholder="Describe the project scope and requirements"
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
                placeholder="0.00"
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
              placeholder="123 Main St, City, State"
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
            <Text style={styles.label}>Project Photos (Optional)</Text>
            <Text style={styles.helperText}>Add up to 10 photos</Text>

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={takePhoto}
                disabled={loading || photos.length >= 10}
              >
                <Ionicons name="camera" size={20} color={COLORS.white} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
                disabled={loading || photos.length >= 10}
              >
                <Ionicons name="images" size={20} color={COLORS.white} />
                <Text style={styles.photoButtonText}>Choose Photos</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Create Project</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
  errorText: {
    fontSize: 14,
    color: COLORS.error,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  photoButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  photoItem: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});