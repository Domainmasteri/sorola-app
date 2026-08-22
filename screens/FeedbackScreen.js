import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';
import { createFeedback } from '../src/services/api';
import { getInstalledVersion } from '../src/services/appVersion';

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();

    if (trimmedMessage.length < 3) {
      setStatus({ type: 'error', text: t('feedback.messageError') });
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus({ type: 'error', text: t('feedback.emailError') });
      return;
    }

    setIsSending(true);
    setStatus(null);
    try {
      await createFeedback({ name: name.trim(), email: trimmedEmail, message: trimmedMessage, appVersion: getInstalledVersion() });
      setMessage('');
      setStatus({ type: 'success', text: t('feedback.success') });
    } catch {
      setStatus({ type: 'error', text: t('feedback.sendError') });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('feedback.title')}</Text>
        <Text style={styles.description}>{t('feedback.description')}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t('feedback.name')}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('feedback.namePlaceholder')} placeholderTextColor={colors.textMuted} maxLength={100} autoCapitalize="words" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('feedback.email')}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={t('feedback.emailPlaceholder')} placeholderTextColor={colors.textMuted} maxLength={254} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('feedback.message')}</Text>
          <TextInput style={[styles.input, styles.messageInput]} value={message} onChangeText={setMessage} placeholder={t('feedback.messagePlaceholder')} placeholderTextColor={colors.textMuted} maxLength={5000} multiline textAlignVertical="top" />
          <Text style={styles.counter}>{message.length}/5000</Text>
        </View>

        {status && <Text accessibilityLiveRegion="polite" style={[styles.status, status.type === 'success' ? styles.success : styles.error]}>{status.text}</Text>}

        <TouchableOpacity style={[styles.button, isSending && styles.buttonDisabled]} onPress={send} disabled={isSending} accessibilityRole="button">
          {isSending ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.buttonText}>{t('feedback.send')}</Text>}
        </TouchableOpacity>
        <Text style={styles.privacy}>{t('feedback.privacy')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 48 },
  title: { color: colors.accent, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  description: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { minHeight: 50, color: colors.text, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 15 },
  messageInput: { minHeight: 180, paddingTop: 14, paddingBottom: 14 },
  counter: { color: colors.textMuted, fontSize: 12, textAlign: 'right', marginTop: 5 },
  status: { borderRadius: 10, padding: 12, marginBottom: 16, fontWeight: '700' },
  success: { color: '#166534', backgroundColor: '#dcfce7' },
  error: { color: '#991b1b', backgroundColor: '#fee2e2' },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
  privacy: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 14 },
});
