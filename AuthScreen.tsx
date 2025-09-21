import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const BG = '#F5F5E6'; // soft cream similar to splash
const TEAL = '#2FB7A6';
const BLUEGRAY = '#6B7A8F';
const INPUT_BG = '#EEF2F6';
const PILL_BG = '#EDEFF3';

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
  </Pressable>
);

const SocialPill = ({ label }: { label: string }) => (
  <View style={styles.socialPill}>
    <Text style={styles.socialText}>{label}</Text>
  </View>
);

const Divider = () => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>Or {" "+(true ? 'sign up' : 'log in')}</Text>
    <View style={styles.dividerLine} />
  </View>
);

export default function AuthScreen({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [agree, setAgree] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const { login, signup, loading, error, devBypass } = useAuth();

  // Safety check: ensure we have required auth functions
  if (!login || !signup) {
    console.error('[AUTHSCREEN] Missing auth functions');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Authentication Error
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
          Unable to load authentication. Please restart the app.
        </Text>
      </View>
    );
  }

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Signup specific
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    try {
      if (!email || !password) {
        setLocalError('Please enter email and password');
        return;
      }
      await login({ email, password });
      console.log('[AUTHSCREEN] Login successful, calling onSuccess');
      onSuccess?.();
    } catch (e: any) {
      console.error('[AUTHSCREEN] Login failed:', e);
      // Error is handled by AuthContext
    }
  };

  const handleSignup = async () => {
    setLocalError(null);
    if (!agree) {
      setLocalError('Please agree to the Terms and Privacy Policy.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    // Basic validation for added fields
    if (!name) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!phone) {
      setLocalError('Please enter your phone number.');
      return;
    }
    if (!aadhar) {
      setLocalError('Please enter your Aadhar number.');
      return;
    }
    if (!dob) {
      setLocalError('Please enter your date of birth (YYYY-MM-DD).');
      return;
    }
    if (!gender) {
      setLocalError('Please enter your gender.');
      return;
    }
    try {
      await signup(
        { email, password },
        {
          name,
          phone_number: phone,
          aadhaar_number: aadhar,
          date_of_birth: dob,
          gender,
          age: Number(age || '0') || 0,
        }
      );
      console.log('[AUTHSCREEN] Signup successful, calling onSuccess');
      onSuccess?.();
    } catch (e: any) {
      console.error('[AUTHSCREEN] Signup failed:', e);
      // Error is handled by AuthContext
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome</Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TabButton title="Sign Up" active={activeTab === 'signup'} onPress={() => setActiveTab('signup')} />
          <TabButton title="Log In" active={activeTab === 'login'} onPress={() => setActiveTab('login')} />
        </View>

        {activeTab === 'signup' ? (
          <View>
            <TextInput placeholder="Full Name" placeholderTextColor="#90A4AE" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Email" placeholderTextColor="#90A4AE" style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Phone Number" placeholderTextColor="#90A4AE" style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput placeholder="Aadhar Number" placeholderTextColor="#90A4AE" style={styles.input} keyboardType="number-pad" value={aadhar} onChangeText={setAadhar} />
            {/* DOB Picker */}
            <TouchableOpacity
              onPress={() => setShowDobPicker(true)}
              activeOpacity={0.8}
              style={[styles.input, { justifyContent: 'center' }]}
            >
              <Text style={{ color: dob ? '#111' : '#90A4AE' }}>
                {dob || 'Date of Birth (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>
            {showDobPicker && (
              <DateTimePicker
                value={dobDate ?? new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                onChange={(event: DateTimePickerEvent, selDate?: Date) => {
                  // On Android, user can cancel which returns undefined
                  if (event.type === 'dismissed') {
                    setShowDobPicker(false);
                    return;
                  }
                  const d = selDate ?? dobDate ?? new Date(2000, 0, 1);
                  setDobDate(d);
                  // Format YYYY-MM-DD
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setDob(`${y}-${m}-${day}`);
                  setShowDobPicker(false);
                }}
                maximumDate={new Date()}
              />
            )}
            <TextInput placeholder="Gender" placeholderTextColor="#90A4AE" style={styles.input} value={gender} onChangeText={setGender} />
            <TextInput placeholder="Age" placeholderTextColor="#90A4AE" style={styles.input} keyboardType="number-pad" value={age} onChangeText={setAge} />
            <TextInput placeholder="Password" placeholderTextColor="#90A4AE" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput placeholder="Confirm Password" placeholderTextColor="#90A4AE" style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} />

            <View style={styles.checkboxRow}>
              <Pressable onPress={() => setAgree(!agree)} style={[styles.checkbox, agree && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>I agree to the Terms and Privacy Policy</Text>
            </View>

            {(localError || error) ? <Text style={styles.errorText}>{localError || error}</Text> : null}
            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign Up</Text>}
            </TouchableOpacity>

            <Text style={styles.orText}>Or sign up with</Text>

            <View style={styles.socialRow}>
              <SocialPill label="Google" />
              <SocialPill label="Facebook" />
            </View>

            <Text style={styles.footerText}>Already have an account? <Text style={styles.link} onPress={() => setActiveTab('login')}>Log In</Text></Text>
          </View>
        ) : (
          <View>
            <TextInput placeholder="Email or Mobile Number" placeholderTextColor="#90A4AE" style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" placeholderTextColor="#90A4AE" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

            <Text style={styles.linkInline}>Forgot Password?</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Stay Logged In</Text>
              <Switch value={stayLoggedIn} onValueChange={setStayLoggedIn} trackColor={{ false: '#D0D5DD', true: TEAL }} thumbColor={'#fff'} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Log In</Text>}
            </TouchableOpacity>

            <Text style={styles.orText}>Or log in with</Text>

            <View style={styles.socialRow}>
              <SocialPill label="Google" />
              <SocialPill label="Facebook" />
              <SocialPill label="Apple" />
            </View>

            <Text style={styles.footerText}>New here? <Text style={styles.link} onPress={() => setActiveTab('signup')}>Sign Up</Text></Text>
          </View>
        )}
        {__DEV__ && devBypass ? (
          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              style={styles.devBypassBtn}
              onPress={() => {
                console.log('[DEV] Starting dev bypass...');
                devBypass();
                console.log('[DEV] Calling onSuccess callback...');
                onSuccess?.();
              }}
            >
              <Text style={styles.devBypassText}>Continue (Dev Bypass)</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#222',
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 24,
    marginBottom: 8,
  },
  tabBtn: {
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: TEAL,
  },
  tabText: {
    color: BLUEGRAY,
    fontWeight: '500',
  },
  tabTextActive: {
    color: TEAL,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    color: '#111',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#B0B8C4',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  checkboxLabel: {
    color: '#333',
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 6,
  },
  devBypassBtn: {
    backgroundColor: '#8B5CF6', // Purple color to make it stand out
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  devBypassText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    color: '#667085',
    marginVertical: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  socialPill: {
    flex: 1,
    backgroundColor: PILL_BG,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  socialText: {
    color: '#111827',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E3E8EF',
  },
  dividerText: {
    color: '#667085',
  },
  link: {
    color: TEAL,
    fontWeight: '600',
  },
  linkInline: {
    color: '#667085',
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    color: '#333',
  },
  footerText: {
    textAlign: 'center',
    color: '#667085',
    marginTop: 6,
  },
});
