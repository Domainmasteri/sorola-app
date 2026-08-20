import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function JsonFormatterScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);

  const setEmptyError = () => {
    setStatus({ type: 'error', message: t('jsonFormatter.emptyError') });
  };

  const formatJson = () => {
    const value = input.trim();

    if (!value) {
      setEmptyError();
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setOutput(JSON.stringify(parsed, null, 2));
      setStatus({ type: 'success', message: t('jsonFormatter.formatSuccess') });
      setCopied(false);
    } catch (error) {
      setOutput('');
      setStatus({ type: 'error', message: t('jsonFormatter.invalidError', { error: error.message }) });
    }
  };

  const minifyJson = () => {
    const value = input.trim();

    if (!value) {
      setEmptyError();
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setOutput(JSON.stringify(parsed));
      setStatus({ type: 'success', message: t('jsonFormatter.minifySuccess') });
      setCopied(false);
    } catch (error) {
      setOutput('');
      setStatus({ type: 'error', message: t('jsonFormatter.invalidError', { error: error.message }) });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStatus({ type: '', message: '' });
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!output) {
      setStatus({ type: 'error', message: t('jsonFormatter.copyFirstError') });
      return;
    }

    await Clipboard.setStringAsync(output);
    setCopied(true);
    setStatus({ type: 'success', message: t('jsonFormatter.copySuccess') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('jsonFormatter.inputTitle')}</Text>
        <Text style={styles.helperText}>{t('jsonFormatter.localHint')}</Text>

        <TextInput
          style={styles.textArea}
          placeholder={t('jsonFormatter.placeholder')}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={formatJson}>
            <Text style={styles.primaryBtnText}>{t('jsonFormatter.format')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={minifyJson}>
            <Text style={styles.secondaryBtnText}>{t('jsonFormatter.minify')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>{t('jsonFormatter.clear')}</Text>
        </TouchableOpacity>

        {status.message ? (
          <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
            <Text style={[styles.statusText, status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError]}>
              {status.message}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('jsonFormatter.outputTitle')}</Text>

        <TextInput
          style={[styles.textArea, styles.outputArea]}
          value={output}
          editable={false}
          multiline
          textAlignVertical="top"
          placeholder={t('jsonFormatter.outputPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
          <Text style={styles.copyBtnText}>{copied ? t('jsonFormatter.copied') : t('jsonFormatter.copy')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  helperText: {
    color: colors.textMuted,
    marginBottom: 15,
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    padding: 15,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 220,
    fontFamily: 'monospace',
  },
  outputArea: {
    color: '#4ade80',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.onAccent,
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  clearBtn: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  statusSuccess: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  statusError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  statusText: {
    fontWeight: 'bold',
  },
  statusTextSuccess: {
    color: '#4ade80',
  },
  statusTextError: {
    color: '#f87171',
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
    fontSize: 15,
    textTransform: 'uppercase',
  },
});
