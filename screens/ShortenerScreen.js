import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { shortenUrl as shortenUrlRequest, ApiError } from '../src/services/api';

export default function ShortenerScreen() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('srla.fi');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const domains = ['soro.la', 'srla.fi', 'srl.la'];

  const shortenUrl = async () => {
    if (!url.trim()) {
      setErrorMsg(t('shortener.emptyUrlError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setShortUrl('');

    try {
      const data = await shortenUrlRequest(url, domain);

      if (data.success && data.shortUrl) {
        setShortUrl(data.shortUrl);
        setUrl('');
      } else {
        setErrorMsg(data.error || t('shortener.createError'));
      }
    } catch (error) {
      setErrorMsg(error instanceof ApiError ? error.message : t('shortener.serverError'));
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

        <Text style={styles.label}>{t('shortener.chooseDomain')}</Text>
        <View style={styles.domainContainer}>
          {domains.map((d) => (
            <TouchableOpacity key={d} style={[styles.domainBtn, domain === d && styles.domainBtnActive]} onPress={() => setDomain(d)}>
              <Text style={[styles.domainBtnText, domain === d && styles.domainBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('shortener.urlToShorten')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('shortener.placeholderUrl')}
          placeholderTextColor="#a0aec0"
          value={url}
          onChangeText={setUrl}
          keyboardType="url"
          autoCapitalize="none"
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.generateBtn} onPress={shortenUrl} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#0b0d13" /> : <Text style={styles.generateBtnText}>{t('shortener.shorten')}</Text>}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#191f2d',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d3748',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffaa00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    paddingBottom: 10,
  },
  label: {
    color: '#a0aec0',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  domainContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  domainBtn: {
    flex: 1,
    backgroundColor: '#0b0d13',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a5568',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  domainBtnActive: {
    borderColor: '#ffaa00',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
  },
  domainBtnText: {
    color: '#e2e8f0',
    fontWeight: 'bold',
  },
  domainBtnTextActive: {
    color: '#ffaa00',
  },
  input: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#4a5568',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  generateBtn: {
    backgroundColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateBtnText: {
    color: '#0b0d13',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  successTitle: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  resultBox: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    color: '#ffaa00',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
