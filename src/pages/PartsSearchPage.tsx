import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { getParts } from '../services/partsService';
import { Search } from 'lucide-react-native';

const PartsSearchPage = ({ vehicleInfo }: { vehicleInfo: { year: string, make: string, model: string } }) => {
  const [query, setQuery] = useState('');
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await getParts(vehicleInfo.year, vehicleInfo.make, vehicleInfo.model, query);
      setParts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador de Repuestos</Text>
      <Text style={styles.subtitle}>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</Text>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Ej: Pastillas de freno, filtro..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004a99" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.partCard}>
              <View style={styles.partInfo}>
                <Text style={styles.partDescription}>{item.description}</Text>
                <Text style={styles.partBrand}>{item.brand} - {item.partNumber}</Text>
                <Text style={[styles.partAvailability, { color: item.availability === 'In Stock' ? 'green' : 'orange' }]}>
                  {item.availability}
                </Text>
              </View>
              <Text style={styles.partPrice}>${item.price.toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={
            query && !loading ? <Text style={styles.emptyText}>No se encontraron repuestos.</Text> : null
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004a99',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#004a99',
    padding: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
  },
  partCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  partInfo: {
    flex: 1,
  },
  partDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  partBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  partAvailability: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  partPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004a99',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});

export default PartsSearchPage;
