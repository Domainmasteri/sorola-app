import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function ShortenerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const shortenUrl = async () => {
    if (!url.trim()) {
      setErrorMsg(t('shortener.emptyUrlError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setShortUrl('');

    try {
      // Käytetään suoraa fetch-kutsua, jotta ohitetaan api.js:n API-avain-vaatimus julkisessa reitissä
      const fetchUrl = `https://api.sorola.fi/api/shortener/create?url=${encodeURIComponent(url.trim())}&domain=soro.la`;
      const response = await fetch(fetchUrl);
      const data = await response.json();

      if (data && data.success && data.shortUrl) {
        setShortUrl(data.shortUrl);
        setUrl('');
      } else {
        setErrorMsg(data.error || t('shortener.createError'));
      }
    } catch (error) {
      setErrorMsg(t('shortener.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortUrl) return;
    await Clipboard.setStringAsync(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('shortener.create')}</Text>

        <Text style={styles.label}>{t('shortener.urlToShorten')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('shortener.placeholderUrl')}
          placeholderTextColor={colors.textMuted}
          value={url}
          onChangeText={setUrl}
          keyboardType="url"
          autoCapitalize="none"
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.generateBtn} onPress={shortenUrl} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.generateBtnText}>{t('shortener.shorten')}</Text>}
        </TouchableOpacity>
      </View>

      {shortUrl !== '' && (
        <View style={styles.section}>
          <Text style={styles.successTitle}>{t('shortener.ready')}</Text>

          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{shortUrl}</Text>
          </View>

          <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
            <Text style={styles.copyBtnText}>{copied ? t('shortener.copied') : t('shortener.copy')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: {
    backgroundColor: colors.surface, padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 15,
    borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10,
  },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 14, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.borderStrong, color: colors.text,
    padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 10,
  },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  generateBtn: { backgroundColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  generateBtnText: { color: colors.onAccent, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  successTitle: { color: '#4ade80', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  resultBox: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.accent, padding: 15,
    borderRadius: 8, marginBottom: 20,
  },
  resultText: { color: colors.accent, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  copyBtn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
