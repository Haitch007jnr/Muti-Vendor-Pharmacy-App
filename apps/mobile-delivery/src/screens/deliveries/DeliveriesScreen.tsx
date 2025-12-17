import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Delivery, ScreenProps } from '../../types';

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Doe',
    address: '123 Main St, NY',
    status: 'Assigned',
    distance: '2.5 km',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Jane Smith',
    address: '456 Park Ave, NY',
    status: 'In Transit',
    distance: '1.2 km',
  },
];

export default function DeliveriesScreen({ navigation }: ScreenProps) {
  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'Assigned':
        return '#3B82F6';
      case 'In Transit':
        return '#F59E0B';
      case 'Delivered':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  const renderDelivery = ({ item }: { item: Delivery }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: item.id })}
    >
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>👤 {item.customerName}</Text>
      <Text style={styles.address}>📍 {item.address}</Text>
      <View style={styles.footer}>
        <Text style={styles.distance}>🚗 {item.distance}</Text>
        <Text style={styles.link}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <FlatList
        data={mockDeliveries}
        renderItem={renderDelivery}
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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EA580C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  list: {
    padding: 16,
  },
  deliveryCard: {
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
  header: {
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
  customerName: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  link: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: '500',
  },
});
