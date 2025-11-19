import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: string, value: string) => setFormData({ ...formData, [field]: value });
  const isFormValid = Object.values(formData).every((val) => val.length > 0);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account</Text>
      
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

      <TouchableOpacity style={[styles.button, !isFormValid && styles.buttonDisabled]} onPress={() => navigation.navigate('Login' as never)} disabled={!isFormValid}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, marginLeft: 12 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
