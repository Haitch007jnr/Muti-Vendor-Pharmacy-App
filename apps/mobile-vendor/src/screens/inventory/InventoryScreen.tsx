import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockInventory = [
  { id: '1', name: 'Paracetamol 500mg', stock: 150, lowStock: false },
  { id: '2', name: 'Ibuprofen 200mg', stock: 5, lowStock: true },
  { id: '3', name: 'Vitamin C 1000mg', stock: 80, lowStock: false },
];

export default function InventoryScreen() {
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.stockInfo}>
        <Text style={[styles.stockText, item.lowStock && styles.lowStock]}>
          Stock: {item.stock}
        </Text>
        {item.lowStock && <Text style={styles.warningText}>⚠️ Low Stock</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockInventory}
        renderItem={renderItem}
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
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#059669',
  },
  lowStock: {
    color: '#DC2626',
  },
  warningText: {
    fontSize: 12,
    color: '#DC2626',
  },
});
