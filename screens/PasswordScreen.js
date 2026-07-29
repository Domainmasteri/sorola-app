import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard'; // Vaatii 'expo-clipboard' -paketin asennuksen myöhemmin

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [lowers, setLowers] = useState(true);
  const [uppers, setUppers] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [specials, setSpecials] = useState(true);
  const [copied, setCopied] = useState(false);

  // Arvotaan salasana heti kun sivu aukeaa
  useEffect(() => {
    generatePassword();
  }, [length, lowers, uppers, numbers, specials]); // Päivittyy aina kun asetuksia muutetaan

  const generatePassword = () => {
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let allowed = "";
    if (lowers) allowed += lowerChars;
    if (uppers) allowed += upperChars;
    if (numbers) allowed += numberChars;
    if (specials) allowed += specialChars;

    // Pakotetaan vähintään pienet kirjaimet, jos kaikki ruksit otetaan pois
    if (allowed.length === 0) {
      allowed = lowerChars;
      setLowers(true);
    }

    let newPass = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allowed.length);
      newPass += allowed[randomIndex];
    }
    setPassword(newPass);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Palautetaan napin teksti 2s kuluttua
  };

  // Apukomponentti kytkimille (vähentää toistoa koodissa)
  const ToggleRow = ({ label, value, onValueChange }) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleText}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#4a5568', true: '#ffaa00' }}
        thumbColor={value ? '#11141d' : '#a0aec0'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* Asetukset-laatikko */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Muokkaa asetuksia</Text>
        
        <View style={styles.lengthContainer}>
          <Text style={styles.toggleText}>Pituus:</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setLength(Math.max(6, length - 1))} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.lengthText}>{length}</Text>
            <TouchableOpacity onPress={() => setLength(Math.min(32, length + 1))} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ToggleRow label="Pienet kirjaimet (a-z)" value={lowers} onValueChange={setLowers} />
        <ToggleRow label="Isot kirjaimet (A-Z)" value={uppers} onValueChange={setUppers} />
        <ToggleRow label="Numerot (0-9)" value={numbers} onValueChange={setNumbers} />
        <ToggleRow label="Erikoismerkit (!@#...)" value={specials} onValueChange={setSpecials} />
        
        <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
          <Text style={styles.generateBtnText}>🔄 Arvo uusi salasana</Text>
        </TouchableOpacity>
      </View>

      {/* Tulos-laatikko */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valmis salasana</Text>
        
        <View style={styles.passwordBox}>
          <Text style={styles.passwordText}>{password}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.copyBtn, copied && styles.copyBtnSuccess]} 
          onPress={copyToClipboard}
        >
          <Text style={styles.copyBtnText}>
            {copied ? '✅ Kopioitu!' : '📋 Kopioi leikepöydälle'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    paddingBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  lengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#ffaa00',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: '#ffaa00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  lengthText: {
    color: '#ffaa00',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  generateBtn: {
    backgroundColor: '#ffaa00',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#0b0d13',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  passwordBox: {
    backgroundColor: '#0b0d13',
    borderWidth: 1,
    borderColor: '#4a5568',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordText: {
    color: '#ffaa00',
    fontSize: 20,
    fontFamily: 'monospace', // Toimii myös monilla mobiililaitteilla koodimaisena fonttina
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: '#3b82f6', // Sininen alkuperäisen tyylin mukaan
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyBtnSuccess: {
    backgroundColor: '#22c55e', // Vihreä kun kopioitu
  },
  copyBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
