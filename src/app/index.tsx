import DropdownComponent from '@/components/shared/dropdowncomp';
import { useWarehouseContext } from '@/context/warehouseContext';
import { useHistory } from '@/hooks/useHistory';
import { Link } from 'expo-router';
import { ChevronLeft, Dot, Layers, Package, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { warehouses, loading: warehousesLoading, error: warehousesError, selectedWarehouseId, setSelectedWarehouseId, selectedWarehouse } = useWarehouseContext();
  const { historyItems, loading: historyLoading, error: historyError } = useHistory();

  const [search, setsearch] = useState('');

  const allBatches = useMemo(() => {
    const sections = selectedWarehouse?.sections ?? [];
    return sections.flatMap((section) =>
      (section.floors ?? []).flatMap((floor) =>
        (floor.stock_batches ?? []).map((batch) => ({
          ...batch,
          sectionId: section.id,
          floorId: floor.id,
        }))
      )
    );
  }, [selectedWarehouse]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.trim().toLowerCase();
    return allBatches.filter(
      (b) =>
        b.products?.name?.toLowerCase().includes(query) ||
        b.products?.dci?.toLowerCase().includes(query)
    );
  }, [allBatches, search]);

  if (warehousesLoading || historyLoading) return <SafeAreaView className="flex-1 items-center justify-center"><Text>جار التحميل...</Text></SafeAreaView>;
  if (warehousesError || historyError) return <SafeAreaView className="flex-1 items-center justify-center"><Text>حدث خطأ أثناء تحميل البيانات</Text></SafeAreaView>;

  const dropdownOptions = warehouses.map((w) => ({ label: w.name, value: w.id }));
  const sections = selectedWarehouse?.sections ?? [];

  const totalProducts = sections.reduce((sum, section) => {
    return sum + (section.floors ?? []).reduce((fSum, floor) => {
      return fSum + (floor.stock_batches ?? []).reduce((bSum, batch) => bSum + (batch.quantity ?? 0), 0);
    }, 0);
  }, 0);

  const isSearching = search.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={isSearching ? searchResults : historyItems}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="gap-4">
            <DropdownComponent
              options={dropdownOptions}
              value={selectedWarehouse?.id}
              onChange={(value: any) => setSelectedWarehouseId(value)}
            />

            <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
              <Search size={20} color="#64748b" />
              <TextInput
                className="flex-1 mr-2 h-full text-base text-slate-800 text-right"
                placeholder="ابحث عن منتج..."
                placeholderTextColor="#888"
                value={search}
                onChangeText={setsearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            {!isSearching && (
              <>
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-white rounded-xl border border-slate-200 py-4 px-6">
                    <Package size={20} color="#4338ca" />
                    <Text className="text-2xl font-bold mt-2 text-left">{totalProducts}</Text>
                    <Text className="text-slate-700 text-md text-left">إجمالي المنتجات</Text>
                  </View>
                  <View className="flex-1 bg-white rounded-xl border border-slate-200 py-4 px-6">
                    <Layers size={20} color="#4338ca" />
                    <Text className="text-2xl font-bold mt-2 text-left">{sections.length}</Text>
                    <Text className="text-slate-700 text-md text-left">الأقسام</Text>
                  </View>
                </View>

                <View className="bg-white rounded-xl border border-slate-200 p-4 gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-lg">الأقسام</Text>
                    <Link href="/sections" asChild>
                      <Pressable className="flex-row items-center">
                        <Text className="text-indigo-700 font-medium ml-1">عرض الكل</Text>
                        <ChevronLeft size={16} color="#4338ca" />
                      </Pressable>
                    </Link>
                  </View>

                  <View className="gap-3">
                    {sections.slice(0, 2).map((item) => {
                      const sectionTotal = (item.floors ?? []).reduce((fSum, floor) => {
                        return fSum + (floor.stock_batches ?? []).reduce((bSum, batch) => bSum + (batch.quantity ?? 0), 0);
                      }, 0);

                      return (
                        <Link key={item.id} href={`/sections/${item.id}`} asChild>
                          <Pressable
                            className={`flex flex-row items-start rounded-xl justify-between px-4 py-5 ${item.color ?? 'bg-slate-100'}`}
                          >
                            <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                              <View className="flex gap-2 flex-col">
                                <Text className="text-lg font-medium text-left">{item.name}</Text>
                                <Text className="text-sm text-slate-700 text-right">اضغط لمزيد من المعلومات</Text>
                              </View>
                              <View className="flex h-full flex-row items-center">
                                <Dot size={34} color="#64748b" />
                                <Text className="text-slate-600">{sectionTotal} منتج</Text>
                              </View>
                            </View>
                            <View className="w-[10%] h-full flex flex-row justify-end items-center">
                              <ChevronLeft size={26} color="#4338ca" />
                            </View>
                          </Pressable>
                        </Link>
                      );
                    })}

                    {sections.length > 2 ? (
                      <View className="w-full flex flex-row items-center justify-center">
                        <Dot size={15} />
                        <Dot size={15} />
                        <Dot size={15} />
                      </View>
                    ) : null}
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2 px-1">
                  <Text className="font-semibold text-lg">السجل</Text>
                  <Pressable className="flex-row items-center">
                    <Link href={"/sections/history"} asChild>
                      <Text className="text-indigo-700 font-medium ml-1">عرض الكل</Text>
                    </Link>
                    <ChevronLeft size={16} color="#4338ca" />
                  </Pressable>
                </View>
              </>
            )}

            {isSearching && (
              <Text className="font-semibold text-lg px-1 text-right">
                {searchResults.length} نتائج البحث
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          isSearching ? (
            <View className="items-center py-8">
              <Text className="text-slate-400">لا توجد منتجات مطابقة</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          isSearching ? (
            <Link href={`/sections/${item.sectionId}/${item.floorId}/${item.id}`} asChild>
              <Pressable className="flex-row items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-4">
                <View>
                  <Text className="text-base font-medium text-left">{item.products?.name}</Text>
                  <Text className="text-sm text-slate-500 text-right">{item.products?.dci}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-slate-600">{item.quantity} منتج</Text>
                  <ChevronLeft size={20} color="#4338ca" />
                </View>
              </Pressable>
            </Link>
          ) : (
            <View className="flex flex-row justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
              <View >
                <Text className="flex flex-col items-center text-base font-medium text-right">
                  {item.quantity} علب
                </Text>
              </View>
              <View>
                <Text className="text-base font-medium text-right">
                  {item.stock_batches?.products?.name ?? 'منتج غير معروف'}
                </Text>
                <Text className=" text-sm text-right">
                  {item.from_warehouse?.name ?? 'N/A'} ← {item.to_warehouse?.name ?? 'N/A'} · {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>


            </View>
          )
        }
      />
    </SafeAreaView>
  );
}