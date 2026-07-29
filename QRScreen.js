import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

export default function QRScreen() {
  const [type, setType] = useState('url');
  
  // Tilamuuttujat eri kentille (vastaavat web-versiosi kenttiä)
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');
  const [phone, setPhone] = useState('');
  
  // Oletuskuva laaditaan Sorola-linkillä
  const [qrImageUrl, setQrImageUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://soro.la');

  const generateQR = () => {
    let dataString = '';

    if (type === 'url') {
      dataString = url || 'https://soro.la';
    } else if (type === 'text') {
      dataString = text || 'Moi!';
    } else if (type === 'wifi') {
      dataString = `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
    } else if (type === 'phone') {
      dataString = `tel:${phone}`;
    }

    const encodedData = encodeURIComponent(dataString);
    // Käytetään suoraan tuttua rajapintaa
    setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&color=000000`);
  };

  // Apukomponentti tyypin valintaan (esim. URL, WiFi, jne.)
  const TypeButton = ({ id, label }) => (
    <TouchableOpacity 
      style={[styles.typeBtn, type === id && styles.typeBtnActive]}
      onPress={() => setType(id)}
    >
      <Text style={[styles.typeBtnText, type === id && styles.typeBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* 1. Asetukset-laatikko */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Valitse tyyppi</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
          <TypeButton id="url" label="Nettisivu" />
          <TypeButton id="text" label="Teksti" />
          <TypeButton id="wifi" label="Wi-Fi" />
          <TypeButton id="phone" label="Puhelin" />
        </ScrollView>

        {/* Kentät valinnan mukaan */}
        <View style={styles.inputContainer}>
          {type === 'url' && (
            <TextInput style={styles.input} placeholder="https://soro.la" placeholderTextColor="#a0aec0" value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" />
          )}

          {type === 'text' && (
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Kirjoita viestisi tähän..." placeholderTextColor="#a0aec0" value={text} onChangeText={setText} multiline />
          )}

          {type === 'wifi' && (
            <View style={{gap: 10}}>
              <TextInput style={styles.input} placeholder="Verkon nimi (SSID)" placeholderTextColor="#a0aec0" value={wifiSsid} onChangeText={setWifiSsid} />
              <TextInput style={styles.input} placeholder="Salasana" placeholderTextColor="#a0aec0" value={wifiPass} onChangeText={setWifiPass} />
              <View style={styles.wifiTypeContainer}>
                <TypeButton id="WPA" label="WPA/WPA2" onPress={() => setWifiType('WPA')} />
                <TypeButton id="WEP" label="WEP" onPress={() => setWifiType('WEP')} />
                <TypeButton id="nopass" label="Ei salasanaa" onPress={() => setWifiType('nopass')} />
              </View>
            </View>
          )}

          {type === 'phone' && (
            <TextInput style={styles.input} placeholder="+358401234567" placeholderTextColor="#a0aec0" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          )}
        </View>
        
        <TouchableOpacity style={styles.generateBtn} onPress={generateQR}>
          <Text style={styles.generateBtnText}>Päivitä QR-koodi</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Tulos-laatikko */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valmis koodi</Text>
        
        <View style={styles.qrContainer}>
          {/* Näytetään kuva suoraan rajapinnasta */}
          <Image source={{ uri: qrImageUrl }} style={styles.qrImage} />
        </View>

        <Text style={styles.helperText}>
          Voit ottaa koodista näyttökuvan (Screenshot) ja jakaa sen!
        </Text>
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
  }
});
