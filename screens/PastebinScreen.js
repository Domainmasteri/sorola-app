import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function PastebinScreen() {
  const [content, setContent] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const savePaste = async () => {
    if (!content.trim()) {
      setErrorMsg('Tekstikenttä on tyhjä!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setPasteUrl('');

    try {
      // Lähetetään teksti POST-pyynnöllä Sorolan Pastebin-rajapintaan
      const response = await fetch('https://sorola.fi/api/paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        // Rakennetaan palautetusta path-tiedosta valmis osoite
        setPasteUrl(`https://sorola.fi/p/${data.path}`);
      } else {
        setErrorMsg(data.error || 'Virhe tallennuksessa.');
      }
    } catch (err) {
      setErrorMsg('Palvelinvirhe. Tarkista verkkoyhteys.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pasteUrl) return;
    await Clipboard.setStringAsync(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPaste = () => {
    setContent('');
    setPasteUrl('');
    setErrorMsg('');
    setCopied(false);
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Näytetään syöttö- tai tuloslaatikko tilanteen mukaan */}
      {pasteUrl === '' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jaa tekstiä tai koodia</Text>
          
          <TextInput
            style={styles.textArea}
            placeholder="Liitä koodi tai teksti tähän..."
            placeholderTextColor="#a0aec0"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top" // Pitää tekstin ylhäällä Androidilla
            autoCapitalize="none"
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity 
            style={styles.generateBtn} 
            onPress={savePaste}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0b0d13" />
            ) : (
              <Text style={styles.generateBtnText}>Tallenna ja luo linkki</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.successTitle}>Teksti tallennettu!</Text>
          <Text style={styles.helperText}>Jaa alla oleva linkki vastaanottajalle.</Text>
          
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{pasteUrl}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.copyBtn, copied && styles.copyBtnSuccess]} 
              onPress={copyToClipboard}
            >
              <Text style={styles.copyBtnText}>
                {copied ? '✅ Kopioitu!' : '📋 Kopioi linkki'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={resetPaste}
            >
              <Text style={styles.resetBtnText}>Luo uusi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  textArea: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#4a5568',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 14,
    height: 250, // Reilusti tilaa koodille
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  generateBtn: {
    backgroundColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateBtnText: {
    color: '#0b0d13',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  successTitle: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  helperText: {
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultBox: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    color: '#ffaa00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  copyBtn: {
    flex: 1,
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
    fontSize: 14,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#191f2d',
    borderWidth: 1,
    borderColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#ffaa00',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
