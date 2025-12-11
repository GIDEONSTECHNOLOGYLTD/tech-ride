import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api.service';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string) => setFormData({ ...formData, [field]: value });
  const isFormValid = Object.values(formData).every((val) => val.length > 0);

  const handleRegister = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.register({
        ...formData,
        role: 'RIDER', // This app is for riders only
      });

      Alert.alert(
        'Registration Successful!',
        'Your rider account has been created. Please login to continue.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Rider Account</Text>
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>You're registering as a Rider. This app is for passengers only.</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#6B7280" />
        <TextInput style={styles.input} placeholder="First Name" value={formData.firstName} onChangeText={(val) => updateField('firstName', val)} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#6B7280" />
        <TextInput style={styles.input} placeholder="Last Name" value={formData.lastName} onChangeText={(val) => updateField('lastName', val)} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#6B7280" />
        <TextInput style={styles.input} placeholder="Phone" value={formData.phoneNumber} onChangeText={(val) => updateField('phoneNumber', val)} keyboardType="phone-pad" />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#6B7280" />
        <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(val) => updateField('email', val)} keyboardType="email-address" />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#6B7280" />
        <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(val) => updateField('password', val)} secureTextEntry={!showPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" /></TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity 
        style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]} 
        onPress={handleRegister} 
        disabled={!isFormValid || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up as Rider'}</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, marginLeft: 12 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { marginLeft: 8, color: '#1E40AF', fontSize: 13, flex: 1 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { marginLeft: 8, color: '#EF4444', fontSize: 14, flex: 1 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
});
