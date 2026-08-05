import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { uploadFile as uploadFileRequest, buildShareUrl, ApiError } from '../src/services/api';

export default function ShareScreen() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxDownloads, setMaxDownloads] = useState('0');

  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setErrorMsg('');
      }
    } catch {
      setErrorMsg(t('share.pickError'));
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setErrorMsg(t('share.pickFirstError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setShareUrl('');

    try {
      const data = await uploadFileRequest(file, { expiryDays, maxDownloads });

      if (data.id) {
        setShareUrl(buildShareUrl(data.id));
      } else {
        setErrorMsg(data.error || t('share.uploadError'));
      }
    } catch (error) {
      setErrorMsg(error instanceof ApiError ? error.message : t('share.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetUpload = () => {
    setFile(null);
    setShareUrl('');
    setErrorMsg('');
    setCopied(false);
  };

  return (
    <ScrollView style={styles.container}>
      {shareUrl === '' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('share.secureShare')}</Text>

          <Text style={styles.label}>{t('share.retentionDays')} {expiryDays}</Text>
          <View style={styles.daysContainer}>
            {[1, 3, 7].map((days) => (
              <TouchableOpacity key={days} style={[styles.dayBtn, expiryDays === days && styles.dayBtnActive]} onPress={() => setExpiryDays(days)}>
                <Text style={[styles.dayBtnText, expiryDays === days && styles.dayBtnTextActive]}>{days} {t('share.daysSuffix')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('share.downloadLimit')}</Text>
          <TextInput style={styles.input} value={maxDownloads} onChangeText={setMaxDownloads} keyboardType="number-pad" maxLength={4} />

          <TouchableOpacity style={styles.filePickerBtn} onPress={pickDocument}>
            <Text style={styles.filePickerText}>{file ? `📁 ${file.name}` : t('share.pickFile')}</Text>
          </TouchableOpacity>

          {file && <Text style={styles.fileSizeText}>{t('share.size')} {(file.size / 1024 / 1024).toFixed(2)} MB</Text>}

          <Text style={styles.infoText}>
            {t('share.encryptionHintStart')}{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://sorola.fi/jako')}>
              {t('share.sorolaSite')}
            </Text>{' '}
            {t('share.encryptionHintEnd')}
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity style={[styles.generateBtn, !file && styles.generateBtnDisabled]} onPress={uploadFile} disabled={isLoading || !file}>
            {isLoading ? <ActivityIndicator color="#0b0d13" /> : <Text style={styles.generateBtnText}>{t('share.upload')}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.successTitle}>{t('share.shared')}</Text>
          <Text style={styles.helperText}>{t('share.shareLinkHint')}</Text>

          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{shareUrl}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
              <Text style={styles.copyBtnText}>{copied ? t('share.copied') : t('share.copy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={resetUpload}>
              <Text style={styles.resetBtnText}>{t('share.shareNew')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    color: '#ffaa00', fontSize: 18, fontWeight: 'bold', marginBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#2d3748', paddingBottom: 10,
  },
  label: { color: '#a0aec0', marginBottom: 8, fontSize: 14, fontWeight: 'bold' },
  daysContainer: { flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' },
  dayBtn: {
    flex: 1, backgroundColor: '#0b0d13', paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#4a5568', marginHorizontal: 4, alignItems: 'center',
  },
  dayBtnActive: { borderColor: '#ffaa00', backgroundColor: 'rgba(255, 170, 0, 0.1)' },
  dayBtnText: { color: '#e2e8f0', fontWeight: 'bold' },
  dayBtnTextActive: { color: '#ffaa00' },
  input: {
    backgroundColor: '#0b0d13', borderWidth: 1, borderColor: '#4a5568', color: '#fff',
    padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20,
  },
  filePickerBtn: {
    borderWidth: 2, borderColor: '#4a5568', borderStyle: 'dashed', backgroundColor: '#11141d',
    padding: 25, borderRadius: 12, alignItems: 'center', marginBottom: 5,
  },
  filePickerText: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  fileSizeText: { color: '#a0aec0', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  infoText: {
    color: '#a0aec0',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  linkText: {
    color: '#ffaa00',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  generateBtn: { backgroundColor: '#ffaa00', padding: 15, borderRadius: 8, alignItems: 'center' },
  generateBtnDisabled: { backgroundColor: '#a0aec0' },
  generateBtnText: { color: '#0b0d13', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  successTitle: { color: '#4ade80', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  helperText: { color: '#a0aec0', textAlign: 'center', marginBottom: 20 },
  resultBox: {
    backgroundColor: '#0b0d13', borderWidth: 1, borderColor: '#ffaa00', padding: 15,
    borderRadius: 8, marginBottom: 20,
  },
  resultText: { color: '#ffaa00', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  copyBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  resetBtn: {
    flex: 1, backgroundColor: '#191f2d', borderWidth: 1, borderColor: '#ffaa00',
    padding: 15, borderRadius: 8, alignItems: 'center',
  },
  resetBtnText: { color: '#ffaa00', fontWeight: 'bold', fontSize: 14 },
});
