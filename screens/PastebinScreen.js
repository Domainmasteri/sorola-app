import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function PastebinScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [content, setContent] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const savePaste = async () => {
    if (!content.trim()) {
      setErrorMsg(t('pastebin.emptyError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setPasteUrl('');

    try {
      // Suora fetch-kutsu ohittaa api.js:n täysin, aivan kuten linkinlyhentimessä
      const response = await fetch('https://api.sorola.fi/api/paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() })
      });
      
      const data = await response.json();

      if (data && data.success && data.path) {
        setPasteUrl(`https://sorola.fi/p/${data.path}`);
      } else {
        setErrorMsg((data && data.error) || t('pastebin.saveError'));
      }
    } catch (error) {
      setErrorMsg(t('pastebin.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pasteUrl) return;
    await Clipboard.setStringAsync(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPaste = () => {
    setContent('');
    setPasteUrl('');
    setErrorMsg('');
    setCopied(false);
  };

  return (
    <ScrollView style={styles.container}>
      {pasteUrl === '' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pastebin.shareText')}</Text>

          <TextInput
            style={styles.textArea}
            placeholder={t('pastebin.placeholderText')}
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity style={styles.generateBtn} onPress={savePaste} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.generateBtnText}>{t('pastebin.save')}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.successTitle}>{t('pastebin.saved')}</Text>
          <Text style={styles.helperText}>{t('pastebin.shareLinkHint')}</Text>

          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{pasteUrl}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
              <Text style={styles.copyBtnText}>{copied ? t('pastebin.copied') : t('pastebin.copy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={resetPaste}>
              <Text style={styles.resetBtnText}>{t('pastebin.createNew')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: {
    backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10,
  },
  textArea: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.borderStrong, color: colors.text, padding: 15, borderRadius: 8, fontSize: 14, height: 250, fontFamily: 'monospace', marginBottom: 10,
  },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  generateBtn: { backgroundColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  generateBtnText: { color: colors.onAccent, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  successTitle: { color: '#4ade80', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  helperText: { color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  resultBox: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.accent, padding: 15, borderRadius: 8, marginBottom: 20 },
  resultText: { color: colors.accent, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  copyBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  resetBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center' },
  resetBtnText: { color: colors.accent, fontWeight: 'bold', fontSize: 14 },
});
