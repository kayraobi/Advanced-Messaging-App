import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { businessService } from '../services/businessService';

const BusinessPartnershipScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const name = companyName.trim();
    if (!name) {
      Alert.alert('Required', 'Please enter your company or organization name.');
      return;
    }
    setSubmitting(true);
    try {
      await businessService.submit({
        companyName: name,
        contactEmail: email.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
      });
      Alert.alert('Thank you', 'Your partnership request has been submitted.');
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : 'Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Business partnership</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Tell us about your business and we’ll get back to you.
        </Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Company / organization</Text>
        <TextInput
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+387 …"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="How would you like to partner with Sarajevo Expats?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.primary }]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit request</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  form: { padding: 16, paddingBottom: 48, gap: 6 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  submit: {
    marginTop: 24,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default BusinessPartnershipScreen;
