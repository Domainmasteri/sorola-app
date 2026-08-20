import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function PasswordScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [lowers, setLowers] = useState(true);
  const [uppers, setUppers] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [specials, setSpecials] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePassword();
  }, [length, lowers, uppers, numbers, specials]);

  const generatePassword = () => {
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let allowed = '';
    if (lowers) allowed += lowerChars;
    if (uppers) allowed += upperChars;
    if (numbers) allowed += numberChars;
    if (specials) allowed += specialChars;

    if (allowed.length === 0) {
      allowed = lowerChars;
      setLowers(true);
    }

    let newPass = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allowed.length);
      newPass += allowed[randomIndex];
    }
    setPassword(newPass);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ToggleRow = ({ label, value, onValueChange }) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderStrong, true: colors.accent }}
        thumbColor={value ? colors.surfaceElevated : colors.textMuted}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('password.settingsTitle')}</Text>

        <View style={styles.lengthContainer}>
          <Text style={styles.toggleText}>{t('password.length')}</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setLength(Math.max(6, length - 1))} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.lengthText}>{length}</Text>
            <TouchableOpacity onPress={() => setLength(Math.min(32, length + 1))} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ToggleRow label={t('password.lower')} value={lowers} onValueChange={setLowers} />
        <ToggleRow label={t('password.upper')} value={uppers} onValueChange={setUppers} />
        <ToggleRow label={t('password.numbers')} value={numbers} onValueChange={setNumbers} />
        <ToggleRow label={t('password.specials')} value={specials} onValueChange={setSpecials} />

        <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
          <Text style={styles.generateBtnText}>{t('password.generate')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('password.ready')}</Text>

        <View style={styles.passwordBox}>
          <Text style={styles.passwordText}>{password}</Text>
        </View>

        <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
          <Text style={styles.copyBtnText}>{copied ? t('password.copied') : t('password.copy')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleText: {
    color: colors.text,
    fontSize: 16,
  },
  lengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  lengthText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  generateBtn: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  generateBtnText: {
    color: colors.onAccent,
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  passwordBox: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordText: {
    color: colors.accent,
    fontSize: 20,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyBtnSuccess: {
    backgroundColor: '#22c55e',
  },
  copyBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
