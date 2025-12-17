import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenProps, Delivery } from '../../types';

type DeliveryStatus = Delivery['status'];

export default function DeliveryDetailScreen({ route }: ScreenProps) {
  const { deliveryId } = (route?.params || {}) as { deliveryId: string };
  const [status, setStatus] = useState<DeliveryStatus>('Assigned');

  const handleStatusUpdate = (newStatus: DeliveryStatus) => {
    setStatus(newStatus);
    Alert.alert('Success', `Delivery status updated to ${newStatus}`);
  };

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
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.card}>
          <Text style={styles.customerName}>John Doe</Text>
          <Text style={styles.customerPhone}>📞 +1 234 567 8900</Text>
          <Text style={styles.address}>📍 123 Main Street, New York, NY 10001</Text>
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

      <View style={styles.actions}>
        {status === 'Assigned' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStatusUpdate('In Transit')}
          >
            <Text style={styles.buttonText}>Start Delivery</Text>
          </TouchableOpacity>
        )}
        
        {status === 'In Transit' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleStatusUpdate('Delivered')}
          >
            <Text style={styles.buttonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.navigationButton}>
          <Text style={styles.buttonText}>🗺️ Navigate</Text>
        </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#EA580C',
  },
  actions: {
    padding: 16,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationButton: {
    backgroundColor: '#EA580C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
