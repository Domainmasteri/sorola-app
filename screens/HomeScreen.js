import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useTranslation } from '../i18n';

export default function HomeScreen({ navigation }) {
  const { t, language, setLanguage } = useTranslation();

  const basicTools = [
    { id: 'Shortener', title: t('home.tools.shortenerTitle'), desc: t('home.tools.shortenerDesc') },
    { id: 'Pastebin', title: t('home.tools.pastebinTitle'), desc: t('home.tools.pastebinDesc') },
    { id: 'QR', title: t('home.tools.qrTitle'), desc: t('home.tools.qrDesc') },
    { id: 'Share', title: t('home.tools.shareTitle'), desc: t('home.tools.shareDesc') },
    { id: 'Password', title: t('home.tools.passwordTitle'), desc: t('home.tools.passwordDesc') },
    { id: 'Download', title: t('home.tools.downloadAppTitle'), desc: t('home.tools.downloadAppDesc'), url: 'https://soro.la/sovellus' },
  ];
  
  const advancedTools = [
    { id: 'JsonFormatter', title: t('home.tools.jsonFormatterTitle'), desc: t('home.tools.jsonFormatterDesc') },
    { id: 'Base64', title: t('home.tools.base64Title'), desc: t('home.tools.base64Desc') },
    { id: 'Uuid', title: t('home.tools.uuidTitle'), desc: t('home.tools.uuidDesc') },
    { id: 'Jwt', title: t('home.tools.jwtTitle'), desc: t('home.tools.jwtDesc') },
  ];

  const renderTools = (tools) => (
    <View style={styles.buttonContainer}>
     {tools.map((tool) => (
       <TouchableOpacity
         key={tool.id}
         style={styles.card}
         onPress={() => {
           if (tool.url) {
             Linking.openURL(tool.url);
           } else {
             navigation.navigate(tool.id);
           }
         }}
       >
         <Text style={styles.cardTitle}>{tool.title}</Text>
         <Text style={styles.cardDesc}>{tool.desc}</Text>
       </TouchableOpacity>
     ))}
    </View>
  );

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
     <View style={styles.languageRow}>
       <Text style={styles.languageLabel}>{t('language.label')}:</Text>
       <TouchableOpacity
          style={[styles.languageBtn, language === 'fi' && styles.languageBtnActive]}
          onPress={() => setLanguage('fi')}
        >
          <Text style={styles.languageBtnText}>🇫🇮 {t('language.finnish')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.languageBtn, language === 'en' && styles.languageBtnActive]}
          onPress={() => setLanguage('en')}
        >
          <Text style={styles.languageBtnText}>🇬🇧 {t('language.english')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>{t('home.welcome')}</Text>
      <Text style={styles.subtext}>{t('home.subtitle')}</Text>

      <TouchableOpacity style={styles.helpCard} onPress={() => navigation.navigate('ToolHelp')}>
        <Text style={styles.helpCardTitle}>{t('home.helpButtonTitle')}</Text>
        <Text style={styles.helpCardDesc}>{t('home.helpButtonDesc')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpCard} onPress={() => navigation.navigate('Privacy')}>
        <Text style={styles.helpCardTitle}>{t('home.privacyButtonTitle')}</Text>
        <Text style={styles.helpCardDesc}>{t('home.privacyButtonDesc')}</Text>
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  languageLabel: {
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  languageBtn: {
    backgroundColor: '#191f2d',
    borderWidth: 1,
    borderColor: '#2d3748',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  languageBtnActive: {
    borderColor: '#ffaa00',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
  },
  languageBtnText: {
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    color: '#ffaa00',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 2,
  },
  subtext: {
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  helpCard: {
    backgroundColor: '#11141d',
    borderWidth: 1,
    borderColor: '#ffaa00',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
  },
  helpCardTitle: {
    color: '#ffaa00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  helpCardDesc: {
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffaa00',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDesc: {
    color: '#a0aec0',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#191f2d',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  cardTitle: {
    color: '#ffaa00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    color: '#e2e8f0',
    fontSize: 14,
  },
});
