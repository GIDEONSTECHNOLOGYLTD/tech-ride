import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { driverAPI } from '../../services/api';
import { format } from 'date-fns';

const DocumentsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await driverAPI.getProfile();
      setDocuments(response.data.driver);
    } catch (error) {
      console.error('Load documents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? '#00C851' : '#FFC107';
  };

  const getStatusText = (verified: boolean) => {
    return verified ? 'Verified' : 'Pending Verification';
  };

  const handleUploadDocument = async (type: string) => {
    try {
      let result;
      
      if (type === 'Profile Photo') {
        // Request camera permission
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Camera permission is needed to take photos');
          return;
        }

        // Show options for camera or gallery
        Alert.alert(
          'Upload Photo',
          'Choose an option',
          [
            {
              text: 'Take Photo',
              onPress: async () => {
                const photo = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                
                if (!photo.canceled && photo.assets[0]) {
                  uploadFile(photo.assets[0].uri, type);
                }
              },
            },
            {
              text: 'Choose from Gallery',
              onPress: async () => {
                const photo = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                
                if (!photo.canceled && photo.assets[0]) {
                  uploadFile(photo.assets[0].uri, type);
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        // For documents, use document picker
        result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          uploadFile(result.assets[0].uri, type);
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFile = async (uri: string, type: string) => {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Get file extension
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Map document type to field name
      const fieldMap: any = {
        "Driver's License": 'licensePhoto',
        'Vehicle Registration': 'vehicleRegistration',
        'Vehicle Insurance': 'insurance',
        'Profile Photo': 'profilePhoto',
      };
      
      const fieldName = fieldMap[type];
      
      // Add file to form data
      formData.append(fieldName, {
        uri,
        name: `${fieldName}.${fileType}`,
        type: fileType === 'pdf' ? 'application/pdf' : `image/${fileType}`,
      } as any);

      // Upload to backend
      Alert.alert('Uploading', 'Please wait while we upload your document...');
      
      // Note: This requires a multipart/form-data upload endpoint
      // The actual implementation will depend on your backend API
      await driverAPI.updateProfile(formData);
      
      Alert.alert('Success', `${type} uploaded successfully`);
      loadDocuments(); // Reload documents
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.response?.data?.error || 'Failed to upload document. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C851" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="shield-check" size={20} color="#00C851" />
          <Text style={styles.infoText}>
            Keep your documents up to date to continue accepting rides
          </Text>
        </View>

        {/* Driver's License */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentTitleRow}>
              <Icon name="card-account-details" size={24} color="#1E88E5" />
              <Text style={styles.documentTitle}>Driver's License</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(documents?.documentsVerified) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(documents?.documentsVerified) }]}>
                {getStatusText(documents?.documentsVerified)}
              </Text>
            </View>
          </View>
          {documents?.licenseNumber && (
            <Text style={styles.documentDetail}>License No: {documents.licenseNumber}</Text>
          )}
          {documents?.licenseExpiry && (
            <Text style={styles.documentDetail}>
              Expires: {format(new Date(documents.licenseExpiry), 'MMM dd, yyyy')}
            </Text>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Driver\'s License')}
          >
            <Icon name="upload" size={18} color="#1E88E5" />
            <Text style={styles.uploadButtonText}>Update Document</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Registration */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentTitleRow}>
              <Icon name="file-document" size={24} color="#1E88E5" />
              <Text style={styles.documentTitle}>Vehicle Registration</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(documents?.documentsVerified) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(documents?.documentsVerified) }]}>
                {getStatusText(documents?.documentsVerified)}
              </Text>
            </View>
          </View>
          {documents?.licensePlate && (
            <Text style={styles.documentDetail}>Plate: {documents.licensePlate}</Text>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Vehicle Registration')}
          >
            <Icon name="upload" size={18} color="#1E88E5" />
            <Text style={styles.uploadButtonText}>Update Document</Text>
          </TouchableOpacity>
        </View>

        {/* Insurance */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentTitleRow}>
              <Icon name="shield-car" size={24} color="#1E88E5" />
              <Text style={styles.documentTitle}>Vehicle Insurance</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(documents?.documentsVerified) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(documents?.documentsVerified) }]}>
                {getStatusText(documents?.documentsVerified)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Insurance')}
          >
            <Icon name="upload" size={18} color="#1E88E5" />
            <Text style={styles.uploadButtonText}>Update Document</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentTitleRow}>
              <Icon name="camera" size={24} color="#1E88E5" />
              <Text style={styles.documentTitle}>Profile Photo</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(true) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(true) }]}>
                {getStatusText(true)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('Profile Photo')}
          >
            <Icon name="upload" size={18} color="#1E88E5" />
            <Text style={styles.uploadButtonText}>Update Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#00C851',
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  documentDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DocumentsScreen;
