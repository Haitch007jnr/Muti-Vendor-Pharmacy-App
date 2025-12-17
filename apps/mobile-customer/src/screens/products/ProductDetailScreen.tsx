import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ProductDetailScreen({ route }: any) {
  const { productId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Text style={styles.productImage}>💊</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.productName}>Paracetamol 500mg</Text>
        <Text style={styles.productPrice}>$5.99</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Paracetamol is a pain reliever and fever reducer. It's used to treat many conditions
            including headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosage</Text>
          <Text style={styles.description}>
            Adults: 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 40,
    alignItems: 'center',
  },
  productImage: {
    fontSize: 120,
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
