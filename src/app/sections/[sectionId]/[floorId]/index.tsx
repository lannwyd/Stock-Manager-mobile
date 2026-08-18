import { useLocalSearchParams, Link } from 'expo-router';
import { ChevronRight, Package, Layers, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WareHouses } from '@/lib/data';

export default function FloorDetail() {
  const { sectionId, floorId } = useLocalSearchParams();
  const [search, setSearch] = useState('');

  const selectedWarehouse = WareHouses.find((w) => w.key === 'pharmacie')!;
  const section = selectedWarehouse.sections.find((s) => s.key === sectionId);
  const floor = section?.floors.find((f) => f.key === floorId);

  const filteredProducts = useMemo(() => {
    if (!floor) return [];
    if (!search.trim()) return floor.products;

    const query = search.trim().toLowerCase();
    return floor.products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.dci.toLowerCase().includes(query)
    );
  }, [floor, search]);

  if (!floor) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Floor not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.key}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="gap-4">
            <Text className="text-2xl font-bold">{floor.title}</Text>

            <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
              <Search size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-2 h-full text-base text-slate-800"
                placeholder="Search products or DCI..."
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Package size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2">{floor.totalItems}</Text>
                <Text className="text-slate-500 text-sm">Total items</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2">{floor.totalProducts}</Text>
                <Text className="text-slate-500 text-sm">Products</Text>
              </View>
            </View>

            <Text className="font-semibold text-lg mt-2 px-1">Products</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-slate-400">No products match your search</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/sections/${sectionId}/${floorId}/${item.key}`} asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-4">
              <View>
                <Text className="text-base font-medium">{item.name}</Text>
                <Text className="text-sm text-slate-500">{item.dci}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-slate-600">{item.quantity} units</Text>
                <ChevronRight size={20} color="#4338ca" />
              </View>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}