import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function ToolHelpScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const basicTools = [
    {
      id: 'Shortener',
      title: t('home.tools.shortenerTitle'),
      description: t('help.tools.shortener.description'),
      steps: [
        t('help.tools.shortener.step1'),
        t('help.tools.shortener.step2'),
        t('help.tools.shortener.step3'),
      ],
    },
    {
      id: 'Pastebin',
      title: t('home.tools.pastebinTitle'),
      description: t('help.tools.pastebin.description'),
      steps: [
        t('help.tools.pastebin.step1'),
        t('help.tools.pastebin.step2'),
        t('help.tools.pastebin.step3'),
      ],
    },
    {
      id: 'QR',
      title: t('home.tools.qrTitle'),
      description: t('help.tools.qr.description'),
      steps: [
        t('help.tools.qr.step1'),
        t('help.tools.qr.step2'),
        t('help.tools.qr.step3'),
      ],
    },
    {
      id: 'Share',
      title: t('home.tools.shareTitle'),
      description: t('help.tools.share.description'),
      steps: [
        t('help.tools.share.step1'),
        t('help.tools.share.step2'),
        t('help.tools.share.step3'),
      ],
    },
    {
      id: 'Password',
      title: t('home.tools.passwordTitle'),
      description: t('help.tools.password.description'),
      steps: [
        t('help.tools.password.step1'),
        t('help.tools.password.step2'),
        t('help.tools.password.step3'),
      ],
    },
  ];

  const advancedTools = [
    {
      id: 'JsonFormatter',
      title: t('home.tools.jsonFormatterTitle'),
      description: t('help.tools.jsonFormatter.description'),
      steps: [
        t('help.tools.jsonFormatter.step1'),
        t('help.tools.jsonFormatter.step2'),
        t('help.tools.jsonFormatter.step3'),
      ],
    },
    {
      id: 'Base64',
      title: t('home.tools.base64Title'),
      description: t('help.tools.base64.description'),
      steps: [
        t('help.tools.base64.step1'),
        t('help.tools.base64.step2'),
        t('help.tools.base64.step3'),
      ],
    },
    {
      id: 'Uuid',
      title: t('home.tools.uuidTitle'),
      description: t('help.tools.uuid.description'),
      steps: [
        t('help.tools.uuid.step1'),
        t('help.tools.uuid.step2'),
        t('help.tools.uuid.step3'),
      ],
    },
    {
      id: 'Jwt',
      title: t('home.tools.jwtTitle'),
      description: t('help.tools.jwt.description'),
      steps: [
        t('help.tools.jwt.step1'),
        t('help.tools.jwt.step2'),
        t('help.tools.jwt.step3'),
      ],
    },
    {
      id: 'ExportView',
      title: t('home.tools.exportViewTitle'),
      description: t('help.tools.exportView.description'),
      steps: [
        t('help.tools.exportView.step1'),
        t('help.tools.exportView.step2'),
        t('help.tools.exportView.step3'),
      ],
    },
  ];

  const openTool = (tool) => {
    navigation.navigate(tool.id);
  };

  const renderSection = (title, description, tools) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>

      {tools.map((tool) => (
        <View key={tool.id} style={styles.card}>
          <Text style={styles.cardTitle}>{tool.title}</Text>
          <Text style={styles.cardDescription}>{tool.description}</Text>

          <View style={styles.steps}>
            {tool.steps.map((step, index) => (
              <Text key={`${tool.id}-${index}`} style={styles.stepText}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.openBtn} onPress={() => openTool(tool)}>
            <Text style={styles.openBtnText}>{t('help.openTool')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('help.title')}</Text>
        <Text style={styles.heroText}>{t('help.intro')}</Text>
      </View>

      {renderSection(t('home.basicToolsTitle'), t('home.basicToolsDesc'), basicTools)}
      {renderSection(t('home.advancedToolsTitle'), t('home.advancedToolsDesc'), advancedTools)}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDescription: {
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  steps: {
    gap: 8,
    marginBottom: 15,
  },
  stepText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  openBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  openBtnText: {
    color: colors.onAccent,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
