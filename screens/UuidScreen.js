import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';

export default function UuidScreen() {
  const { t } = useTranslation();
  const [uuid, setUuid] = useState(() => generateUuidV4());
  const [copied, setCopied] = useState(false);

  function generateUuidV4() {
    // Generoi standardin mukaisen UUID v4:n ilman ulkoisia kirjastoja
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handleGenerate = () => {
    setUuid(generateUuidV4());
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
        <Text style={styles.sectionTitle}>UUID-generaattori</Text>
        <Text style={styles.helperText}>Luo uniikkeja versio 4 -tunnisteita (UUID v4) sovellus- ja tietokantakäyttöön.</Text>

        <TextInput
          style={[styles.textArea, styles.outputArea]}
          value={uuid}
          editable={false}
          multiline
          textAlignVertical="center"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerate}>
            <Text style={styles.primaryBtnText}>Luo uusi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
            <Text style={styles.copyBtnText}>{copied ? 'Kopioitu!' : 'Kopioi'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: {
    backgroundColor: '#191f2d', padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3748', marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffaa00', fontSize: 18, fontWeight: 'bold', marginBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#2d3748', paddingBottom: 10,
  },
  helperText: { color: '#a0aec0', marginBottom: 15, lineHeight: 20 },
  textArea: {
    backgroundColor: '#0b0d13', borderWidth: 1, borderColor: '#4a5568',
    color: '#e2e8f0', padding: 15, borderRadius: 8, fontSize: 15,
    minHeight: 80, fontFamily: 'monospace', textAlign: 'center', marginBottom: 15,
  },
  outputArea: { color: '#4ade80', fontWeight: 'bold', fontSize: 16 },
  actionRow: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1, backgroundColor: '#ffaa00', padding: 15, borderRadius: 8, alignItems: 'center',
  },
  primaryBtnText: { color: '#0b0d13', fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' },
  copyBtn: {
    flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center',
  },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' },
});
