import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';
import { useTranslation } from '../i18n';
import { uploadFile as uploadFileRequest, ApiError } from '../src/services/api';

export default function ShareScreen() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxDownloads, setMaxDownloads] = useState('0');
  const [useEncryption, setUseEncryption] = useState(false);

  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const generateRandomKey = (length = 32) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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

  const processAndUploadFile = async () => {
    if (!file) {
      setErrorMsg(t('share.pickFirstError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setShareUrl('');
    let encryptedFilePath = null;

    try {
      let fileToUpload = {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size
      };

      let encryptionKey = null;

      if (useEncryption) {
        // Generoidaan satunnainen purkuavain
        encryptionKey = generateRandomKey(32);

        // Luetaan alkuperäinen tiedosto Base64-muodossa
        const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Salataan sisältö AES:llä
        const encryptedData = CryptoJS.AES.encrypt(fileBase64, encryptionKey).toString();

        // Määritellään uusi tiedostopolku välimuistiin
        encryptedFilePath = `${FileSystem.cacheDirectory}encrypted_${file.name}.enc`;

        // Kirjoitetaan salattu data uuteen tiedostoon
        await FileSystem.writeAsStringAsync(encryptedFilePath, encryptedData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        fileToUpload = {
          uri: encryptedFilePath,
          name: `${file.name}.enc`, // Vihjaa, että kyseessä on salattu tiedosto
          mimeType: 'application/octet-stream',
          size: encryptedData.length
        };
      }

      // Lähetetään (salattu tai normaali) tiedosto API:lle
      const data = await uploadFileRequest(fileToUpload, { expiryDays, maxDownloads });

      // Siivotaan väliaikainen salattu tiedosto pois, ettei puhelimen muisti täyty
      if (encryptedFilePath) {
         await FileSystem.deleteAsync(encryptedFilePath, { idempotent: true });
      }

      // Kootaan jakolinkki
      if (data && typeof data === 'object') {
        const fileId = data.id || data.url?.split('/').pop();
        
        if (useEncryption && fileId) {
          // Salattu linkki sivuston formaatissa
           setShareUrl(`https://sorola.fi/s/${fileId}#${encryptionKey}`);
        } else if (data.url) {
           // Normaali API:n palauttama latauslinkki
           setShareUrl(data.url);
        } else if (fileId) {
           setShareUrl(`https://sorola.fi/d/${fileId}`);
        } else {
           setErrorMsg(t('share.uploadError'));
        }
      } else {
        setErrorMsg((data && typeof data === 'object' && data.error) || t('share.uploadError'));
      }

    } catch (error) {
      if (encryptedFilePath) {
          await FileSystem.deleteAsync(encryptedFilePath, { idempotent: true }).catch(() => {});
      }
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

          <View style={styles.encryptionContainer}>
            <TouchableOpacity 
               style={[styles.encryptionToggle, useEncryption && styles.encryptionToggleActive]}
               onPress={() => setUseEncryption(!useEncryption)}
            >
               <Text style={[styles.encryptionText, useEncryption && styles.encryptionTextActive]}>
                 {useEncryption ? '🔒 ' + t('share.encryptionOn') : '🔓 ' + t('share.encryptionOff')}
               </Text>
            </TouchableOpacity>
            <Text style={styles.encryptionInfoText}>
              {useEncryption ? t('share.encryptionWarning') : t('share.encryptionHint')}
            </Text>
          </View>

          <Text style={styles.infoText}>
            {t('share.encryptionHintStart')}{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://sorola.fi/jako')}>
              {t('share.sorolaSite')}
            </Text>{' '}
            {t('share.encryptionHintEnd')}
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity style={[styles.generateBtn, !file && styles.generateBtnDisabled]} onPress={processAndUploadFile} disabled={isLoading || !file}>
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
  encryptionContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  encryptionToggle: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#4a5568',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  encryptionToggleActive: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)'
  },
  encryptionText: {
    color: '#a0aec0',
    fontWeight: 'bold',
    fontSize: 14
  },
  encryptionTextActive: {
    color: '#4ade80'
  },
  encryptionInfoText: {
    color: '#a0aec0',
    fontSize: 12,
    textAlign: 'center',
  },
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
