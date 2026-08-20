import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

// Luotettava Base64Url purku UTF-8 tuella React Nativelle
const decodeBase64Url = (base64UrlStr) => {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) { base64 += '='; }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = '';
    for (let block, charCode, i = 0, map = chars; base64.charAt(i | 0) || (map = '=', i % 1); str += String.fromCharCode(Math.floor(charCode / Math.pow(256, 1 - (i % 1) * 2)))) {
      charCode = map.indexOf(base64.charAt(i | 0));
      if (charCode !== -1) {
        block = (block << 6) | charCode;
        i += 0.75;
      } else { i += 1; }
    }
    return decodeURIComponent(escape(str));
  } catch (e) {
    return null;
  }
};

export default function JwtScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [token, setToken] = useState('');
  const [decodedHeader, setDecodedHeader] = useState(null);
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const decodeJwt = () => {
    setErrorMsg('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setCopied(false);

    const trimmed = token.trim();
    if (!trimmed) {
      setErrorMsg(t('jwt.emptyError'));
      return;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setErrorMsg(t('jwt.formatError'));
      return;
    }

    try {
      const headerStr = decodeBase64Url(parts[0]);
      const payloadStr = decodeBase64Url(parts[1]);

      if (!headerStr || !payloadStr) {
         throw new Error("Invalid base64");
      }

      setDecodedHeader(JSON.stringify(JSON.parse(headerStr), null, 2));
      setDecodedPayload(JSON.stringify(JSON.parse(payloadStr), null, 2));
    } catch (e) {
      setErrorMsg(t('jwt.decodeError'));
    }
  };

  const clearAll = () => {
    setToken('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setErrorMsg('');
    setCopied(false);
  };

  const copyPayload = async () => {
    if (!decodedPayload) return;
    await Clipboard.setStringAsync(decodedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('jwt.inputTitle')}</Text>
        <Text style={styles.helperText}>{t('jwt.helperText')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('jwt.placeholder')}
          placeholderTextColor={colors.textMuted}
          value={token}
          onChangeText={setToken}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.generateBtn} onPress={decodeJwt}>
             <Text style={styles.generateBtnText}>{t('jwt.decode')}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
             <Text style={styles.clearBtnText}>{t('jwt.clear')}</Text>
           </TouchableOpacity>
        </View>
      </View>

      {decodedPayload && (
        <View style={styles.section}>
          <Text style={styles.successTitle}>{t('jwt.decodeSuccess')}</Text>
          
          <Text style={styles.label}>{t('jwt.headerTitle')}</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{decodedHeader}</Text>
          </View>

          <Text style={styles.label}>{t('jwt.payloadTitle')}</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{decodedPayload}</Text>
          </View>

          <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyPayload}>
            <Text style={styles.copyBtnText}>{copied ? t('jwt.payloadCopied') : t('jwt.copyPayload')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  sectionTitle: { color: colors.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  helperText: { color: colors.textMuted, marginBottom: 15, fontSize: 14, lineHeight: 20 },
  input: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.borderStrong, color: colors.text, padding: 15, borderRadius: 8, fontSize: 14, height: 120, fontFamily: 'monospace', marginBottom: 15 },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 14, fontWeight: 'bold' },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  generateBtn: { flex: 1, backgroundColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center' },
  generateBtnText: { color: colors.onAccent, fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
  clearBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center' },
  clearBtnText: { color: colors.accent, fontWeight: 'bold', fontSize: 14 },
  successTitle: { color: '#4ade80', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  resultBox: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.borderStrong, padding: 15, borderRadius: 8, marginBottom: 20 },
  resultText: { color: '#4ade80', fontSize: 14, fontFamily: 'monospace' },
  copyBtn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
