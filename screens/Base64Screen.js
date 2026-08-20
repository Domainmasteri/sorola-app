import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

const encodeBase64 = (value) => {
  try {
    return global.btoa(unescape(encodeURIComponent(value)));
  } catch {
    return null;
  }
};

const decodeBase64 = (value) => {
  try {
    return decodeURIComponent(escape(global.atob(value)));
  } catch {
    return null;
  }
};

export default function Base64Screen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);

  const setEmptyError = () => setStatus({ type: 'error', message: t('base64.emptyError') });

  const handleEncode = () => {
    if (!input.trim()) {
      setEmptyError();
      return;
    }

    const result = encodeBase64(input);
    if (result === null) {
      setStatus({ type: 'error', message: t('base64.invalidDecodeError') });
      return;
    }

    setOutput(result);
    setCopied(false);
    setStatus({ type: 'success', message: t('base64.encodeSuccess') });
  };

  const handleDecode = () => {
    if (!input.trim()) {
      setEmptyError();
      return;
    }

    const result = decodeBase64(input.trim());
    if (result === null) {
      setOutput('');
      setStatus({ type: 'error', message: t('base64.invalidDecodeError') });
      return;
    }

    setOutput(result);
    setCopied(false);
    setStatus({ type: 'success', message: t('base64.decodeSuccess') });
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStatus({ type: '', message: '' });
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!output) {
      setStatus({ type: 'error', message: t('base64.copyFirstError') });
      return;
    }

    await Clipboard.setStringAsync(output);
    setCopied(true);
    setStatus({ type: 'success', message: t('base64.copySuccess') });
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    if (!clipboardText) return;
    setInput(clipboardText);
    setStatus({ type: 'success', message: t('base64.paste') });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('base64.inputTitle')}</Text>
        <Text style={styles.helperText}>{t('base64.localHint')}</Text>

        <TextInput
          style={styles.textArea}
          placeholder={t('base64.placeholder')}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.pasteBtn} onPress={pasteFromClipboard}>
          <Text style={styles.pasteBtnText}>{t('base64.paste')}</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleEncode}>
            <Text style={styles.primaryBtnText}>{t('base64.encode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleDecode}>
            <Text style={styles.secondaryBtnText}>{t('base64.decode')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>{t('base64.clear')}</Text>
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
        <Text style={styles.sectionTitle}>{t('base64.outputTitle')}</Text>

        <TextInput
          style={[styles.textArea, styles.outputArea]}
          value={output}
          editable={false}
          multiline
          textAlignVertical="top"
          placeholder={t('base64.outputPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnSuccess]} onPress={copyToClipboard}>
          <Text style={styles.copyBtnText}>{copied ? t('base64.copied') : t('base64.copy')}</Text>
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
  pasteBtn: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  pasteBtnText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 14,
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
