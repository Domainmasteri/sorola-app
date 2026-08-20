import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

const QR_API_URL = 'https://api.sorola.fi/api/qr-proxy';

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return global.btoa(binary);
};

export default function QRScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [type, setType] = useState('url');

  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');
  const [phone, setPhone] = useState('');

  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getDataString = () => {
    if (type === 'url') {
      return url || 'https://soro.la';
    }

    if (type === 'text') {
      return text || t('qr.defaultText');
    }

    if (type === 'wifi') {
      return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
    }

    return `tel:${phone}`;
  };

  const generateQR = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const query = `data=${encodeURIComponent(getDataString())}&color=${encodeURIComponent('000000')}`;
      const response = await fetch(`${QR_API_URL}?${query}`);

      if (!response.ok) {
        throw new Error(`QR request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().startsWith('image/')) {
        throw new Error('QR API returned a non-image response');
      }

      const imageBuffer = await response.arrayBuffer();
      if (!imageBuffer.byteLength) {
        throw new Error('QR API returned an empty image');
      }

      const mimeType = contentType.split(';')[0] || 'image/png';
      const nextImageUrl = `data:${mimeType};base64,${arrayBufferToBase64(imageBuffer)}`;

      // Vaihdetaan kuva vasta kun koko uusi vastaus on ladattu ja kelvollinen.
      setQrImageUrl(nextImageUrl);
    } catch (error) {
      setErrorMsg(t('qr.generateError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, []);

  const TypeButton = ({ id, label, onPress }) => (
    <TouchableOpacity style={[styles.typeBtn, type === id && styles.typeBtnActive]} onPress={onPress || (() => setType(id))}>
      <Text style={[styles.typeBtnText, type === id && styles.typeBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('qr.selectType')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
          <TypeButton id="url" label={t('qr.website')} />
          <TypeButton id="text" label={t('qr.text')} />
          <TypeButton id="wifi" label={t('qr.wifi')} />
          <TypeButton id="phone" label={t('qr.phone')} />
        </ScrollView>

        <View style={styles.inputContainer}>
          {type === 'url' && (
            <TextInput style={styles.input} placeholder={t('qr.placeholderUrl')} placeholderTextColor={colors.textMuted} value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" />
          )}

          {type === 'text' && (
            <TextInput style={[styles.input, { height: 80 }]} placeholder={t('qr.placeholderText')} placeholderTextColor={colors.textMuted} value={text} onChangeText={setText} multiline />
          )}

          {type === 'wifi' && (
            <View style={{ gap: 10 }}>
              <TextInput style={styles.input} placeholder={t('qr.placeholderSsid')} placeholderTextColor={colors.textMuted} value={wifiSsid} onChangeText={setWifiSsid} />
              <TextInput style={styles.input} placeholder={t('qr.placeholderPassword')} placeholderTextColor={colors.textMuted} value={wifiPass} onChangeText={setWifiPass} />
              <View style={styles.wifiTypeContainer}>
                <TypeButton id="WPA" label="WPA/WPA2" onPress={() => setWifiType('WPA')} />
                <TypeButton id="WEP" label="WEP" onPress={() => setWifiType('WEP')} />
                <TypeButton id="nopass" label={t('qr.noPassword')} onPress={() => setWifiType('nopass')} />
              </View>
            </View>
          )}

          {type === 'phone' && (
            <TextInput style={styles.input} placeholder={t('qr.placeholderPhone')} placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          )}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.generateBtn} onPress={generateQR} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.generateBtnText}>{t('qr.refresh')}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('qr.readyCode')}</Text>

        <View style={styles.qrContainer}>
          {qrImageUrl ? <Image source={{ uri: qrImageUrl }} style={styles.qrImage} /> : <ActivityIndicator color={colors.accent} />}
        </View>

        <Text style={styles.helperText}>{t('qr.screenshotHint')}</Text>
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
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeBtn: {
    backgroundColor: colors.input,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: 10,
  },
  typeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  typeBtnText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  typeBtnTextActive: {
    color: colors.accent,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  wifiTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  generateBtn: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateBtnText: {
    color: colors.onAccent,
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
    width: 250,
    height: 250,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  helperText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
});
