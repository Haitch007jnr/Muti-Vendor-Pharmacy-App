import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Order, ScreenProps } from '../../types';

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-12-15',
    status: 'Delivered',
    total: 29.97,
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-12-16',
    status: 'In Transit',
    total: 45.50,
    items: 5,
  },
];

export default function OrdersScreen({ navigation }: ScreenProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return '#059669';
      case 'In Transit':
        return '#3B82F6';
      case 'Processing':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>📅 {item.date}</Text>
        <Text style={styles.orderItems}>📦 {item.items} items</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  viewDetails: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
