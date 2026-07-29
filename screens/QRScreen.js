import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from '../i18n';

export default function QRScreen() {
  const { t } = useTranslation();
  const [type, setType] = useState('url');

  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');
  const [phone, setPhone] = useState('');

  const [qrImageUrl, setQrImageUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://soro.la');

  const generateQR = () => {
    let dataString = '';

    if (type === 'url') {
      dataString = url || 'https://soro.la';
    } else if (type === 'text') {
      dataString = text || t('qr.defaultText');
    } else if (type === 'wifi') {
      dataString = `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
    } else if (type === 'phone') {
      dataString = `tel:${phone}`;
    }

    const encodedData = encodeURIComponent(dataString);
    setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&color=000000`);
  };

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
            <TextInput style={styles.input} placeholder={t('qr.placeholderUrl')} placeholderTextColor="#a0aec0" value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" />
          )}

          {type === 'text' && (
            <TextInput style={[styles.input, { height: 80 }]} placeholder={t('qr.placeholderText')} placeholderTextColor="#a0aec0" value={text} onChangeText={setText} multiline />
          )}

          {type === 'wifi' && (
            <View style={{ gap: 10 }}>
              <TextInput style={styles.input} placeholder={t('qr.placeholderSsid')} placeholderTextColor="#a0aec0" value={wifiSsid} onChangeText={setWifiSsid} />
              <TextInput style={styles.input} placeholder={t('qr.placeholderPassword')} placeholderTextColor="#a0aec0" value={wifiPass} onChangeText={setWifiPass} />
              <View style={styles.wifiTypeContainer}>
                <TypeButton id="WPA" label="WPA/WPA2" onPress={() => setWifiType('WPA')} />
                <TypeButton id="WEP" label="WEP" onPress={() => setWifiType('WEP')} />
                <TypeButton id="nopass" label={t('qr.noPassword')} onPress={() => setWifiType('nopass')} />
              </View>
            </View>
          )}

          {type === 'phone' && (
            <TextInput style={styles.input} placeholder={t('qr.placeholderPhone')} placeholderTextColor="#a0aec0" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          )}
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={generateQR}>
          <Text style={styles.generateBtnText}>{t('qr.refresh')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('qr.readyCode')}</Text>

        <View style={styles.qrContainer}>
          <Image source={{ uri: qrImageUrl }} style={styles.qrImage} />
        </View>

        <Text style={styles.helperText}>{t('qr.screenshotHint')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#191f2d',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d3748',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffaa00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    paddingBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeBtn: {
    backgroundColor: '#0b0d13',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a5568',
    marginRight: 10,
  },
  typeBtnActive: {
    borderColor: '#ffaa00',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
  },
  typeBtnText: {
    color: '#e2e8f0',
    fontWeight: 'bold',
  },
  typeBtnTextActive: {
    color: '#ffaa00',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#4a5568',
    color: '#fff',
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
    backgroundColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#0b0d13',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
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
    color: '#a0aec0',
    textAlign: 'center',
    fontSize: 14,
  },
});
