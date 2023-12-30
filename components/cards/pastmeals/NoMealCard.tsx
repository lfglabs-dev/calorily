import React from 'react';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

const EmptyMealCard = () => {
  const scheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 20,
      height: "100%",
      borderRadius: 8,
      backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginBottom: 10,
      color: scheme === 'dark' ? '#A9A9A9' : '#606060',
    },
    text: {
      color: scheme === 'dark' ? '#FFF' : '#000',
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons name="restaurant" size={48} style={styles.icon} />
      <Text style={styles.text}>No logged meals today</Text>
    </View>
  );
};

export default EmptyMealCard;
