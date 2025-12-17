import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenProps } from '../../types';

export default function OrderDetailScreen({ route }: ScreenProps) {
  const { orderId } = (route?.params || {}) as { orderId: string };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>ORD-2024-001</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>December 15, 2024</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Delivered</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.itemName}>Paracetamol 500mg (x2)</Text>
            <Text style={styles.itemPrice}>$11.98</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemName}>Vitamin C 1000mg (x1)</Text>
            <Text style={styles.itemPrice}>$12.99</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.card}>
          <Text style={styles.addressText}>123 Main Street</Text>
          <Text style={styles.addressText}>New York, NY 10001</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$24.97</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>$5.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$29.97</Text>
          </View>
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
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemName: {
    fontSize: 14,
    color: '#1F2937',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
});
