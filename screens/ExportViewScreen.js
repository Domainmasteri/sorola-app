import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from '../i18n';
import {
  createExportCsv,
  ExportViewError,
  parseExportFile,
  bytesFromBase64,
} from '../src/services/exportViewParser';

const PROVIDERS = [
  { id: 'bitwarden', label: 'Bitwarden' },
  { id: 'proton', label: 'Proton Pass' },
];

const ERROR_KEYS = {
  INVALID_JSON: 'invalidJson',
  INVALID_ZIP: 'invalidZip',
  MISSING_PROTON_DATA: 'missingProtonData',
};

export default function ExportViewScreen({ navigation }) {
  const { t, language } = useTranslation();
  const [provider, setProvider] = useState('bitwarden');
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [fileName, setFileName] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [revealed, setRevealed] = useState({});

  const selectedProvider = PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const visibleRecords = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const searchableFields = ['service', 'url', 'username', 'password', 'totp'];
    return records.map((record, index) => ({ record, index })).filter(({ record }) => !needle || searchableFields
      .some((field) => String(record[field] || '').toLocaleLowerCase().includes(needle)));
  }, [records, query]);

  const clearResults = () => {
    setRecords([]);
    setQuery('');
    setFileName('');
    setRevealed({});
    setErrorKey('');
  };

  const showError = (error) => {
    const key = error instanceof ExportViewError ? ERROR_KEYS[error.code] : null;
    setErrorKey(key || 'generic');
  };

  const openWebsite = async () => {
    const websiteUrl = language === 'fi' ? 'https://sorola.fi/salapurku' : 'https://sorola.me/exportview';
    try {
      await Linking.openURL(websiteUrl);
    } catch {
      setErrorKey('websiteUnavailable');
    }
  };

  const showEncryptedFileNotice = () => {
    Alert.alert(
      t('exportView.encryptedTitle'),
      t('exportView.encryptedMessage'),
      [
        { text: t('exportView.cancel'), style: 'cancel' },
        { text: t('exportView.openWebsite'), onPress: openWebsite },
      ],
    );
  };

  const parseBytes = async (bytes) => {
    try {
      const parsed = parseExportFile({ provider, bytes });
      setRecords(parsed);
      setRevealed({});
      setErrorKey('');
    } catch (error) {
      if (error instanceof ExportViewError && error.code === 'ENCRYPTED_FILE') {
        setRecords([]);
        setQuery('');
        setRevealed({});
        setErrorKey('');
        showEncryptedFileNotice();
        return;
      }
      showError(error);
    }
  };

  const pickExportFile = async () => {
    setIsLoading(true);
    setErrorKey('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/zip', 'application/pgp-encrypted', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      clearResults();
      setFileName(file.name || t('exportView.unknownFile'));
      await parseBytes(bytesFromBase64(base64));
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyValue = async (value) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    Alert.alert(t('exportView.copiedTitle'), t('exportView.copiedMessage'));
  };

  const toggleValue = (index, field) => {
    const key = `${index}-${field}`;
    setRevealed((current) => ({ ...current, [key]: !current[key] }));
  };

  const shareCsv = async () => {
    if (!records.length) return;
    setIsLoading(true);
    try {
      const fileUri = `${FileSystem.cacheDirectory}${language === 'en' ? 'exportview.csv' : 'salapurku.csv'}`;
      await FileSystem.writeAsStringAsync(fileUri, createExportCsv(records, language), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (!(await Sharing.isAvailableAsync())) {
        setErrorKey('sharingUnavailable');
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t('exportView.csvShareTitle'),
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const errorText = errorKey ? t(`exportView.errors.${errorKey}`) : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.title}>{t('exportView.title')}</Text>
        <Text style={styles.description}>{t('exportView.description')}</Text>
        <View style={styles.securityBox}>
          <Text style={styles.securityTitle}>{t('exportView.localTitle')}</Text>
          <Text style={styles.securityText}>{t('exportView.localDescription')}</Text>
        </View>
      </View>

      <Text style={styles.label}>{t('exportView.providerLabel')}</Text>
      <TouchableOpacity style={styles.select} onPress={() => setProviderModalVisible(true)}>
        <Text style={styles.selectText}>{selectedProvider.label}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={pickExportFile} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#0b0d13" /> : <Text style={styles.primaryButtonText}>{t('exportView.chooseFile')}</Text>}
      </TouchableOpacity>
      {!!fileName && <Text style={styles.fileName}>{t('exportView.selectedFile', { file: fileName })}</Text>}

      {!!errorText && <Text style={styles.error}>{errorText}</Text>}

      {records.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultCount}>{t('exportView.resultCount', { count: records.length })}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={shareCsv}>
              <Text style={styles.secondaryButtonText}>{t('exportView.downloadCsv')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
              <Text style={styles.clearButtonText}>{t('exportView.clear')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {records.length > 0 && (
        <>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('exportView.searchPlaceholder')}
            placeholderTextColor="#718096"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {visibleRecords.map(({ record, index }) => (
            <View style={styles.card} key={`${record.service}-${index}`}>
              <RecordField label={t('exportView.fields.service')} value={record.service} />
              <RecordField label={t('exportView.fields.url')} value={record.url} compact />
              <RecordField label={t('exportView.fields.username')} value={record.username} />
              <SecretField
                label={t('exportView.fields.password')}
                value={record.password}
                visible={Boolean(revealed[`${index}-password`])}
                onToggle={() => toggleValue(index, 'password')}
                onCopy={() => copyValue(record.password)}
                showLabel={t('exportView.show')}
                hideLabel={t('exportView.hide')}
                copyLabel={t('exportView.copy')}
              />
              <SecretField
                label={t('exportView.fields.totp')}
                value={record.totp}
                visible={Boolean(revealed[`${index}-totp`])}
                onToggle={() => toggleValue(index, 'totp')}
                onCopy={() => copyValue(record.totp)}
                showLabel={t('exportView.show')}
                hideLabel={t('exportView.hide')}
                copyLabel={t('exportView.copy')}
              />
            </View>
          ))}
          {!visibleRecords.length && <Text style={styles.empty}>{t('exportView.noMatches')}</Text>}
        </>
      )}

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('ToolHelp')}>
          <Text style={styles.link}>{t('exportView.openGuide')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.link}>{t('exportView.openPrivacy')}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={providerModalVisible} animationType="fade" onRequestClose={() => setProviderModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setProviderModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('exportView.providerLabel')}</Text>
            {PROVIDERS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.option, item.id === provider && styles.optionActive]}
                onPress={() => {
                  setProvider(item.id);
                  clearResults();
                  setProviderModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

function RecordField({ label, value, compact }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, compact && styles.compactValue]} numberOfLines={compact ? 4 : undefined}>{value || '—'}</Text>
    </View>
  );
}

function SecretField({ label, value, visible, onToggle, onCopy, showLabel, hideLabel, copyLabel }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.secretRow}>
        <Text style={styles.secretValue} numberOfLines={3}>{value ? (visible ? value : '••••••••') : '—'}</Text>
        {!!value && <>
          <TouchableOpacity style={styles.tinyButton} onPress={onToggle}>
            <Text style={styles.tinyButtonText}>{visible ? hideLabel : showLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tinyButton} onPress={onCopy}>
            <Text style={styles.tinyButtonText}>{copyLabel}</Text>
          </TouchableOpacity>
        </>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  hero: { backgroundColor: '#191f2d', borderColor: '#2d3748', borderWidth: 1, borderRadius: 12, padding: 18, marginBottom: 18 },
  title: { color: '#ffaa00', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  description: { color: '#e2e8f0', lineHeight: 21, textAlign: 'center' },
  securityBox: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80', borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 16 },
  securityTitle: { color: '#4ade80', fontWeight: 'bold', marginBottom: 4 },
  securityText: { color: '#cbd5e1', lineHeight: 19 },
  label: { color: '#a0aec0', fontWeight: 'bold', marginBottom: 6 },
  select: { backgroundColor: '#191f2d', borderColor: '#2d3748', borderWidth: 1, borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectText: { color: '#e2e8f0', fontWeight: 'bold' },
  chevron: { color: '#ffaa00', fontSize: 20 },
  primaryButton: { backgroundColor: '#ffaa00', borderRadius: 8, padding: 14, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  primaryButtonText: { color: '#0b0d13', fontWeight: 'bold' },
  fileName: { color: '#a0aec0', marginTop: 8, fontSize: 13 },
  error: { color: '#fca5a5', backgroundColor: 'rgba(248, 113, 113, 0.12)', borderColor: '#f87171', borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12, lineHeight: 19 },
  resultsHeader: { marginTop: 20, marginBottom: 10 },
  resultCount: { color: '#ffaa00', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  secondaryButton: { backgroundColor: '#2d3748', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 14 },
  secondaryButtonText: { color: '#e2e8f0', fontWeight: 'bold' },
  clearButton: { borderColor: '#718096', borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  clearButtonText: { color: '#cbd5e1', fontWeight: 'bold' },
  input: { backgroundColor: '#11141d', color: '#e2e8f0', borderColor: '#2d3748', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  card: { backgroundColor: '#191f2d', borderColor: '#2d3748', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  field: { borderBottomColor: '#2d3748', borderBottomWidth: 1, paddingVertical: 9 },
  fieldLabel: { color: '#ffaa00', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  fieldValue: { color: '#e2e8f0', lineHeight: 19 },
  compactValue: { color: '#cbd5e1' },
  secretRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  secretValue: { color: '#e2e8f0', flex: 1, minWidth: 100 },
  tinyButton: { borderColor: '#718096', borderWidth: 1, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 7 },
  tinyButtonText: { color: '#e2e8f0', fontSize: 11, fontWeight: 'bold' },
  empty: { color: '#a0aec0', textAlign: 'center', padding: 20 },
  links: { alignItems: 'center', gap: 12, marginTop: 18 },
  link: { color: '#ffaa00', textDecorationLine: 'underline' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#191f2d', borderColor: '#2d3748', borderWidth: 1, borderRadius: 12, padding: 18 },
  modalTitle: { color: '#ffaa00', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  option: { borderColor: '#2d3748', borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 8 },
  optionActive: { borderColor: '#ffaa00', backgroundColor: 'rgba(255,170,0,0.1)' },
  optionText: { color: '#e2e8f0', fontWeight: 'bold' },
});
