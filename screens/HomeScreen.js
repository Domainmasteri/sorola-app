import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

const TOOL_GLYPHS = {
  link: '↗',
  paste: '▤',
  qr: '▦',
  share: '□',
  password: '◆',
  json: '{}',
  code: '</>',
  uuid: '◇',
  jwt: '▰',
  exportView: '▣',
};

export default function HomeScreen({ navigation }) {
  const { t, language, setLanguage } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  const basicTools = [
    { id: 'Shortener', icon: 'link', title: t('home.tools.shortenerTitle'), desc: t('home.tools.shortenerDesc') },
    { id: 'Pastebin', icon: 'paste', title: t('home.tools.pastebinTitle'), desc: t('home.tools.pastebinDesc') },
    { id: 'QR', icon: 'qr', title: t('home.tools.qrTitle'), desc: t('home.tools.qrDesc') },
    { id: 'Share', icon: 'share', title: t('home.tools.shareTitle'), desc: t('home.tools.shareDesc') },
    { id: 'Password', icon: 'password', title: t('home.tools.passwordTitle'), desc: t('home.tools.passwordDesc') },
  ];

  const advancedTools = [
    { id: 'JsonFormatter', icon: 'json', title: t('home.tools.jsonFormatterTitle'), desc: t('home.tools.jsonFormatterDesc') },
    { id: 'Base64', icon: 'code', title: t('home.tools.base64Title'), desc: t('home.tools.base64Desc') },
    { id: 'Uuid', icon: 'uuid', title: t('home.tools.uuidTitle'), desc: t('home.tools.uuidDesc') },
    { id: 'Jwt', icon: 'jwt', title: t('home.tools.jwtTitle'), desc: t('home.tools.jwtDesc') },
    { id: 'ExportView', icon: 'exportView', title: t('home.tools.exportViewTitle'), desc: t('home.tools.exportViewDesc') },
  ];

  const renderTools = (tools) => (
    <View style={styles.buttonContainer}>
      {tools.map((tool) => (
        <TouchableOpacity key={tool.id} style={styles.card} onPress={() => navigation.navigate(tool.id)}>
          <View style={styles.cardHeading}>
            <View style={styles.cardIcon}><Text style={styles.cardIconText}>{TOOL_GLYPHS[tool.icon]}</Text></View>
            <Text style={styles.cardTitle}>{tool.title}</Text>
          </View>
          <Text style={styles.cardDesc}>{tool.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>{t('language.label')}:</Text>
        <TouchableOpacity style={[styles.languageBtn, language === 'fi' && styles.languageBtnActive]} onPress={() => setLanguage('fi')}>
          <Text style={styles.languageBtnText}>{t('language.finnish')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.languageBtn, language === 'en' && styles.languageBtnActive]} onPress={() => setLanguage('en')}>
          <Text style={styles.languageBtnText}>{t('language.english')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} accessibilityRole="button">
          <Text style={styles.themeIcon}>{mode === 'dark' ? '☼' : '◐'}</Text>
          <Text style={styles.themeBtnText}>{mode === 'dark' ? t('theme.light') : t('theme.dark')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>{t('home.welcome')}</Text>
      <Text style={styles.subtext}>{t('home.subtitle')}</Text>

      <TouchableOpacity style={styles.helpCard} onPress={() => navigation.navigate('ToolHelp')}>
        <View style={styles.helpCardHeading}><Text style={styles.helpIcon}>▤</Text><Text style={styles.helpCardTitle}>{t('home.helpButtonTitle')}</Text></View>
        <Text style={styles.helpCardDesc}>{t('home.helpButtonDesc')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpCard} onPress={() => navigation.navigate('Privacy')}>
        <View style={styles.helpCardHeading}><Text style={styles.helpIcon}>◇</Text><Text style={styles.helpCardTitle}>{t('home.privacyButtonTitle')}</Text></View>
        <Text style={styles.helpCardDesc}>{t('home.privacyButtonDesc')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpCard} onPress={() => navigation.navigate('Feedback')}>
        <View style={styles.helpCardHeading}><Text style={styles.helpIcon}>✎</Text><Text style={styles.helpCardTitle}>{t('home.feedbackButtonTitle')}</Text></View>
        <Text style={styles.helpCardDesc}>{t('home.feedbackButtonDesc')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.basicToolsTitle')}</Text>
        <Text style={styles.sectionDesc}>{t('home.basicToolsDesc')}</Text>
      </View>
      {renderTools(basicTools)}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.advancedToolsTitle')}</Text>
        <Text style={styles.sectionDesc}>{t('home.advancedToolsDesc')}</Text>
      </View>
      {renderTools(advancedTools)}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 60 },
  languageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 24 },
  languageLabel: { color: colors.textMuted, fontSize: 14, fontWeight: 'bold' },
  languageBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8 },
  languageBtnActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
  languageBtnText: { color: colors.text, fontWeight: 'bold', fontSize: 12 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8 },
  themeIcon: { color: colors.accent, fontSize: 18, lineHeight: 18 },
  themeBtnText: { color: colors.text, fontSize: 12, fontWeight: 'bold' },
  header: { color: colors.accent, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 5, letterSpacing: 2 },
  subtext: { color: colors.textMuted, textAlign: 'center', marginBottom: 22, fontSize: 14 },
  helpCard: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.accent, padding: 18, borderRadius: 12, marginBottom: 14 },
  helpCardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 },
  helpIcon: { color: colors.accent, fontSize: 22, fontWeight: '700' },
  helpCardTitle: { color: colors.accent, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  helpCardDesc: { color: colors.text, textAlign: 'center', lineHeight: 20 },
  sectionHeader: { marginTop: 12, marginBottom: 12, paddingHorizontal: 2 },
  sectionTitle: { color: colors.accent, fontSize: 21, fontWeight: '800', marginBottom: 4 },
  sectionDesc: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  buttonContainer: { gap: 12, marginBottom: 20 },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: colors.name === 'light' ? 0.06 : 0, shadowRadius: 6, elevation: colors.name === 'light' ? 1 : 0 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  cardIconText: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  cardTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '700' },
  cardDesc: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginLeft: 46 },
});
