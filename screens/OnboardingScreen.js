import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

const STEPS = [
  { icon: '✦', title: 'onboarding.steps.tools.title', body: 'onboarding.steps.tools.body' },
  { icon: '⌁', title: 'onboarding.steps.private.title', body: 'onboarding.steps.private.body' },
  { icon: '→', title: 'onboarding.steps.ready.title', body: 'onboarding.steps.ready.body' },
];

export default function OnboardingScreen({ onComplete }) {
  const { t, language, setLanguage } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [step, setStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const finish = async () => {
    setIsFinishing(true);
    await onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandText}>SOROLA</Text>
        <View style={styles.languageSelector} accessibilityRole="radiogroup" accessibilityLabel={t('language.label')}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'fi' && styles.languageButtonActive]}
            onPress={() => setLanguage('fi')}
            accessibilityRole="radio"
            accessibilityState={{ checked: language === 'fi' }}
          >
            <Text style={[styles.languageButtonText, language === 'fi' && styles.languageButtonTextActive]}>FI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
            onPress={() => setLanguage('en')}
            accessibilityRole="radio"
            accessibilityState={{ checked: language === 'en' }}
          >
            <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.iconCircle}><Text style={styles.icon}>{current.icon}</Text></View>
        <Text style={styles.title}>{t(current.title)}</Text>
        <Text style={styles.body}>{t(current.body)}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={t('onboarding.progress', { current: step + 1, total: STEPS.length })}>
          {STEPS.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.dotActive]} />)}
        </View>
        <TouchableOpacity
          style={styles.skip}
          onPress={finish}
          disabled={isFinishing}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={isLastStep ? finish : () => setStep((value) => value + 1)}
          disabled={isFinishing}
          accessibilityRole="button"
        >
          {isFinishing ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.primaryButtonText}>{t(isLastStep ? 'onboarding.start' : 'onboarding.next')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', backgroundColor: colors.background, padding: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 36 },
  brandText: { color: colors.accent, fontSize: 20, fontWeight: '900', letterSpacing: 5 },
  languageSelector: { flexDirection: 'row', padding: 3, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  languageButton: { minWidth: 42, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  languageButtonActive: { backgroundColor: colors.accent },
  languageButtonText: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
  languageButtonTextActive: { color: colors.onAccent },
  content: { alignItems: 'center', paddingHorizontal: 8 },
  iconCircle: { width: 116, height: 116, alignItems: 'center', justifyContent: 'center', borderRadius: 58, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.accent, marginBottom: 32 },
  icon: { color: colors.accent, fontSize: 52, fontWeight: '800' },
  title: { color: colors.text, fontSize: 27, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  footer: { gap: 14, paddingBottom: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { width: 24, backgroundColor: colors.accent },
  skip: { alignSelf: 'center', padding: 8 },
  skipText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.accent },
  primaryButtonText: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
});
