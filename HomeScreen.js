// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Lista työkaluista (helpompi hallita ja lisätä uusia myöhemmin)
  const tools = [
    { id: 'Shortener', title: '🔗 Linkinlyhennin', desc: 'Tee pitkistä urleista lyhyitä' },
    { id: 'Pastebin', title: '📝 Pastebin', desc: 'Jaa tekstiä ja koodia turvallisesti' },
    { id: 'QR', title: '🔲 QR-Luoja', desc: 'Luo QR-koodeja ilmaiseksi' },
    { id: 'Share', title: '📁 Tiedostonjako', desc: 'Lataa ja jaa tiedostoja' },
    { id: 'Password', title: '🔑 Salasanakone', desc: 'Luo vahvoja salasanoja' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>TERVETULOA!</Text>
      <Text style={styles.subtext}>Valitse haluamasi IT-työkalu alta.</Text>

      <View style={styles.buttonContainer}>
        {tools.map((tool) => (
          <TouchableOpacity 
            key={tool.id} 
            style={styles.card}
            onPress={() => navigation.navigate(tool.id)}
          >
            <Text style={styles.cardTitle}>{tool.title}</Text>
            <Text style={styles.cardDesc}>{tool.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    color: '#ffaa00',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 10,
    letterSpacing: 2,
  },
  subtext: {
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
  },
  buttonContainer: {
    gap: 15, // Luo välin nappien väliin
  },
  card: {
    backgroundColor: '#191f2d', // Sorola "osion-tausta" väri
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
  }
});
