import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

const PastMeals = () => {
  const scheme = useColorScheme();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#FFF',
      borderRadius: 8,
      padding: 20,
      width: '100%',
      marginBottom: 15,
      elevation: 3,
    },
    cardText: {
      color: scheme === 'dark' ? '#FFF' : '#000',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>Past meals</Text>
    </View>
  );
};

export default PastMeals;
