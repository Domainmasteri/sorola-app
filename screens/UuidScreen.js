import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

// Apufunktio UUID v4 luomiseen (toimii luotettavasti React Nativessa)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function UuidScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [uuid, setUuid] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateNewUuid();
  }, []);

  const generateNewUuid = () => {
    setUuid(generateUUID());
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!uuid) return;
    await Clipboard.setStringAsync(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('uuid.inputTitle')}</Text>
        <Text style={styles.helperText}>{t('uuid.helperText')}</Text>

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{uuid}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.generateBtn} onPress={generateNewUuid}>
            <Text style={styles.generateBtnText}>{t('uuid.generate')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
            <Text style={styles.copyBtnText}>{copied ? t('uuid.copied') : t('uuid.copy')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  sectionTitle: { color: colors.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  helperText: { color: colors.textMuted, marginBottom: 20, fontSize: 14, lineHeight: 20 },
  resultBox: { backgroundColor: colors.input, borderWidth: 1, borderColor: '#4ade80', padding: 20, borderRadius: 8, marginBottom: 20 },
  resultText: { color: '#4ade80', fontSize: 16, fontWeight: 'bold', textAlign: 'center', fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  generateBtn: { flex: 1, backgroundColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center' },
  generateBtnText: { color: colors.onAccent, fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
  copyBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
