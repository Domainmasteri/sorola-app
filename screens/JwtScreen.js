import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';

export default function JwtScreen() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);

  const decodeBase64Url = (str) => {
    try {
      let output = str.replace(/-/g, '+').replace(/_/g, '/');
      switch (output.length % 4) {
        case 0: break;
        case 2: output += '=='; break;
        case 3: output += '='; break;
        default: throw new Error('Virheellinen Base64URL-merkkijono');
      }
      return decodeURIComponent(escape(global.atob(output)));
    } catch {
      return null;
    }
  };

  const handleDecode = () => {
    const token = input.trim();
    if (!token) {
      setStatus({ type: 'error', message: 'Syötä JWT-merkkijono.' });
      setHeader('');
      setPayload('');
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setStatus({ type: 'error', message: 'Virheellinen JWT (tulisi koostua kolmesta osasta).' });
      setHeader('');
      setPayload('');
      return;
    }

    try {
      const decodedHeader = decodeBase64Url(parts[0]);
      const decodedPayload = decodeBase64Url(parts[1]);

      if (!decodedHeader || !decodedPayload) {
        throw new Error('Dekoodaus epäonnistui.');
      }

      setHeader(JSON.stringify(JSON.parse(decodedHeader), null, 2));
      setPayload(JSON.stringify(JSON.parse(decodedPayload), null, 2));
      setStatus({ type: 'success', message: 'JWT purettu onnistuneesti!' });
      setCopied(false);
    } catch (error) {
      setHeader('');
      setPayload('');
      setStatus({ type: 'error', message: 'JWT:n purkaminen epäonnistui (virheellinen muoto).' });
    }
  };

  const clearAll = () => {
    setInput('');
    setHeader('');
    setPayload('');
    setStatus({ type: '', message: '' });
    setCopied(false);
  };

  const copyPayload = async () => {
    if (!payload) return;
    await Clipboard.setStringAsync(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>JWT-dekooderi</Text>
        <Text style={styles.helperText}>Liitä JSON Web Token (JWT) nähdäksesi sen otsikon ja datan (payload) selkokielellä.</Text>

        <TextInput
          style={styles.textArea}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          placeholderTextColor="#a0aec0"
          value={input}
          onChangeText={setInput}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleDecode}>
            <Text style={styles.primaryBtnText}>Dekoodaa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={clearAll}>
            <Text style={styles.secondaryBtnText}>Tyhjennä</Text>
          </TouchableOpacity>
        </View>

        {status.message ? (
          <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
            <Text style={[styles.statusText, status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError]}>
              {status.message}
            </Text>
          </View>
        ) : null}
      </View>

      {(header !== '' || payload !== '') && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Otsikko (Header)</Text>
            <TextInput
              style={[styles.textArea, styles.outputArea]}
              value={header}
              editable={false}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payload (Data)</Text>
            <TextInput
              style={[styles.textArea, styles.outputArea]}
              value={payload}
              editable={false}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyPayload}>
              <Text style={styles.copyBtnText}>{copied ? 'Payload kopioitu!' : 'Kopioi payload'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    color: '#e2e8f0', padding: 15, borderRadius: 8, fontSize: 14,
    minHeight: 120, fontFamily: 'monospace',
  },
  outputArea: { color: '#4ade80', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  primaryBtn: {
    flex: 1, backgroundColor: '#ffaa00', padding: 15, borderRadius: 8, alignItems: 'center',
  },
  primaryBtnText: { color: '#0b0d13', fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' },
  secondaryBtn: {
    flex: 1, backgroundColor: '#191f2d', borderWidth: 1, borderColor: '#ffaa00',
    padding: 15, borderRadius: 8, alignItems: 'center',
  },
  secondaryBtnText: { color: '#ffaa00', fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' },
  statusBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 15 },
  statusSuccess: { borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.12)' },
  statusError: { borderColor: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.12)' },
  statusText: { fontWeight: 'bold' },
  statusTextSuccess: { color: '#4ade80' },
  statusTextError: { color: '#f87171' },
  copyBtn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' },
});
