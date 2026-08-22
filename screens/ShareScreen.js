import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import forge from 'node-forge';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';
import { uploadFile as uploadFileRequest, ApiError } from '../src/services/api';

export default function ShareScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [file, setFile] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxDownloads, setMaxDownloads] = useState('0');
  const [useEncryption, setUseEncryption] = useState(false);

  const [shareUrl, setShareUrl] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const toBase64Url = (bytes) => forge.util.encode64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

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
    setEncryptionKey('');
    let encryptedFilePath = null;

    try {
      let fileToUpload = {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size
      };

      let encryptionKey = null;
      let encryptionKeyHash = null;

      if (useEncryption) {
        // Match the web downloader's AES-256-GCM format: IV + ciphertext + tag.
        const rawKey = forge.random.getBytesSync(32);
        const iv = forge.random.getBytesSync(12);
        encryptionKey = toBase64Url(rawKey);
        encryptionKeyHash = forge.md.sha256.create().update(encryptionKey, 'utf8').digest().toHex();

        // Luetaan alkuperäinen tiedosto Base64-muodossa
        const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileBytes = forge.util.decode64(fileBase64);
        const cipher = forge.cipher.createCipher('AES-GCM', rawKey);
        cipher.start({ iv, tagLength: 128 });
        cipher.update(forge.util.createBuffer(fileBytes, 'raw'));

        if (!cipher.finish()) {
          throw new Error('File encryption failed.');
        }

        const encryptedBytes = iv + cipher.output.getBytes() + cipher.mode.tag.getBytes();
        const encryptedBase64 = forge.util.encode64(encryptedBytes);

        // KORJAUS 1: Korvataan välilyönnit nimestä turvallisella merkillä, jottei pyyntö kaadu reitin muodostukseen.
        const safeName = file.name.replace(/\s+/g, '_');
        encryptedFilePath = `${FileSystem.cacheDirectory}encrypted_${safeName}.enc`;

        // FileSystem decodes this Base64 value so the uploaded file contains raw bytes.
        await FileSystem.writeAsStringAsync(encryptedFilePath, encryptedBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        fileToUpload = {
          uri: encryptedFilePath,
          name: `${safeName}.enc`,
          mimeType: 'application/octet-stream',
          size: encryptedBytes.length
        };
      }

      // KORJAUS 3: Lähetetään tiedosto API:lle ja välitetään isEncrypted arvo selkeästi
      const data = await uploadFileRequest(fileToUpload, {
        expiryDays,
        maxDownloads,
        ...(useEncryption && { isEncrypted: 'true', encryptionKeyHash })
      });

      // Siivotaan väliaikainen salattu tiedosto pois, ettei puhelimen muisti täyty
      if (encryptedFilePath) {
         await FileSystem.deleteAsync(encryptedFilePath, { idempotent: true });
      }

      // Kootaan jakolinkki
      if (data && typeof data === 'object') {
        const fileId = data.id || data.url?.split('/').pop();
        
        if (useEncryption && fileId) {
           setShareUrl(data.shortUrl || data.url || `https://sorola.fi/s/${fileId}`);
           setEncryptionKey(encryptionKey);
        } else if (data.url) {
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

  const copyKeyToClipboard = async () => {
    if (!encryptionKey) return;
    await Clipboard.setStringAsync(encryptionKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetUpload = () => {
    setFile(null);
    setShareUrl('');
    setEncryptionKey('');
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
            <Text style={styles.filePickerText}>{file ? file.name : t('share.pickFile')}</Text>
          </TouchableOpacity>

          {file && <Text style={styles.fileSizeText}>{t('share.size')} {(file.size / 1024 / 1024).toFixed(2)} MB</Text>}

          <View style={styles.encryptionContainer}>
            <TouchableOpacity 
               style={[styles.encryptionToggle, useEncryption && styles.encryptionToggleActive]}
               onPress={() => setUseEncryption(!useEncryption)}
            >
               <Text style={[styles.encryptionText, useEncryption && styles.encryptionTextActive]}>
                 {useEncryption ? t('share.encryptionOn') : t('share.encryptionOff')}
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
            {isLoading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.generateBtnText}>{t('share.upload')}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.successTitle}>{t('share.shared')}</Text>
          <Text style={styles.helperText}>{encryptionKey ? t('share.separateKeyHint') : t('share.shareLinkHint')}</Text>

          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{shareUrl}</Text>
          </View>

          {encryptionKey ? (
            <>
              <Text style={styles.keyLabel}>{t('share.encryptionKey')}</Text>
              <View style={styles.keyBox}>
                <Text style={styles.keyText}>{encryptionKey}</Text>
              </View>
              <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess, styles.keyCopyBtn]} onPress={copyKeyToClipboard}>
                <Text style={styles.copyBtnText}>{copied ? t('share.copied') : t('share.copyKey')}</Text>
              </TouchableOpacity>
            </>
          ) : null}

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

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: {
    backgroundColor: colors.surface, padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10,
  },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 14, fontWeight: 'bold' },
  daysContainer: { flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' },
  dayBtn: {
    flex: 1, backgroundColor: colors.input, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: colors.borderStrong, marginHorizontal: 4, alignItems: 'center',
  },
  dayBtnActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
  dayBtnText: { color: colors.text, fontWeight: 'bold' },
  dayBtnTextActive: { color: colors.accent },
  input: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.borderStrong, color: colors.text,
    padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20,
  },
  filePickerBtn: {
    borderWidth: 2, borderColor: colors.borderStrong, borderStyle: 'dashed', backgroundColor: colors.surfaceElevated,
    padding: 25, borderRadius: 12, alignItems: 'center', marginBottom: 5,
  },
  filePickerText: { color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  fileSizeText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 20 },
  encryptionContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  encryptionToggle: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 14
  },
  encryptionTextActive: {
    color: '#4ade80'
  },
  encryptionInfoText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  linkText: {
    color: colors.accent,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorText: { color: '#ef4444', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  generateBtn: { backgroundColor: colors.accent, padding: 15, borderRadius: 8, alignItems: 'center' },
  generateBtnDisabled: { backgroundColor: colors.textMuted },
  generateBtnText: { color: colors.onAccent, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  successTitle: { color: '#4ade80', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  helperText: { color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  resultBox: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.accent, padding: 15,
    borderRadius: 8, marginBottom: 20,
  },
  resultText: { color: colors.accent, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  keyLabel: { color: colors.textMuted, fontWeight: 'bold', marginBottom: 8 },
  keyBox: {
    backgroundColor: colors.input, borderWidth: 1, borderColor: '#4ade80', padding: 15,
    borderRadius: 8, marginBottom: 10,
  },
  keyText: { color: '#4ade80', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  copyBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  copyBtnSuccess: { backgroundColor: '#22c55e' },
  keyCopyBtn: { marginBottom: 10 },
  copyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  resetBtn: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent,
    padding: 15, borderRadius: 8, alignItems: 'center',
  },
  resetBtnText: { color: colors.accent, fontWeight: 'bold', fontSize: 14 },
});
