import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockOrders = [
  { id: '1', orderNumber: 'ORD-001', status: 'Pending', total: 29.97 },
  { id: '2', orderNumber: 'ORD-002', status: 'Completed', total: 45.50 },
];

export default function OrdersScreen() {
  const renderOrder = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.orderNumber}>{item.orderNumber}</Text>
      <View style={styles.row}>
        <Text style={styles.status}>{item.status}</Text>
        <Text style={styles.total}>${item.total}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 16,
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
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
