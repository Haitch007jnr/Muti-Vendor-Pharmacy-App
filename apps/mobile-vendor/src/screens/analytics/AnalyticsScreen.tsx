import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Total Sales (This Month)</Text>
          <Text style={styles.value}>$45,250</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Total Orders</Text>
          <Text style={styles.value}>156</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <View style={styles.card}>
          <Text style={styles.productName}>Paracetamol 500mg</Text>
          <Text style={styles.productSales}>$2,450 in sales</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productSales: {
    fontSize: 14,
    color: '#6B7280',
  },
});
