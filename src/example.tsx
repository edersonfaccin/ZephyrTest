import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Example() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>List of my vehicles v4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 100
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
