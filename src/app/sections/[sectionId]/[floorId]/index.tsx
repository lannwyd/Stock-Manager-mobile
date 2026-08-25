import { useWarehouseContext } from '@/context/warehouseContext';
import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Layers, Package, Search, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, TouchableHighlight } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FloorDetail() {
  const { sectionId, floorId } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const { selectedWarehouse, loading, error } = useWarehouseContext();

  const section = selectedWarehouse?.sections.find((s) => s.id === sectionId);
  const floor = section?.floors.find((f) => f.id === floorId);

  const filteredBatches = useMemo(() => {
    if (!floor) return [];
    const batches = floor.stock_batches ?? [];
    if (!search.trim()) return batches;

    const query = search.trim().toLowerCase();
    return batches.filter(
      (b) =>
        b.products?.name.toLowerCase().includes(query) ||
        b.products?.dci.toLowerCase().includes(query)
    );
  }, [floor, search]);

  if (loading) return <SafeAreaView className="flex-1 items-center justify-center"><Text>Loading...</Text></SafeAreaView>;
  if (error) return <SafeAreaView className="flex-1 items-center justify-center"></SafeAreaView>;
  if (!floor) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Floor not found</Text>
      </SafeAreaView>
    );
  }

  const totalItems = (floor.stock_batches ?? []).reduce((sum, b) => sum + (b.quantity ?? 0), 0);
  const totalProducts = floor.stock_batches?.length ?? 0;

  const handleaddition = () => {
    const new_med = {}
  }

  return (
    <SafeAreaView className="flex-1 bg-indigo-50 p-4">
      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item.id}
        contentContainerClassName=" gap-4"
        ListHeaderComponent={
          <View className="gap-4">
            <Text className="text-2xl font-bold">{floor.name}</Text>

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
                <Text className="text-2xl font-bold mt-2">{totalItems}</Text>
                <Text className="text-slate-500 text-sm">Total items</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2">{totalProducts}</Text>
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
          <Link href={`/sections/${sectionId}/${floorId}/${item.id}`} asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-4">
              <View>
                <Text className="text-base font-medium">{item.products?.name}</Text>
                <Text className="text-sm text-slate-500">{item.products?.dci}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-slate-600">{item.quantity} units</Text>
                <ChevronRight size={20} color="#4338ca" />
              </View>
            </Pressable>
          </Link>
        )}
      />
      <TouchableHighlight onPress={handleaddition} className={"w-full flex flex-col justify-center items-center bg-indigo-500 h-20 rounded-md "}>
        <Plus size={36} color="#FFFFFF" />
      </TouchableHighlight>
    </SafeAreaView>
  );
}