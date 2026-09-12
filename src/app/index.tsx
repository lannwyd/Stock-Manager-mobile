import DropdownComponent from '@/components/shared/dropdowncomp';
import { useWarehouseContext } from '@/context/warehouseContext';
import { useHistory } from '@/hooks/useHistory';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronLeft, Dot, Layers, Package, Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { warehouses, loading: warehousesLoading, error: warehousesError, selectedWarehouseId, setSelectedWarehouseId, selectedWarehouse, refresh } = useWarehouseContext();
  const { historyItems, loading: historyLoading, error: historyError, refetch: refetchHistory } = useHistory();

  const [search, setsearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refetchHistory()]);
    setRefreshing(false);
  }, [refresh, refetchHistory]);

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

  if (warehousesLoading || historyLoading) return <SafeAreaView className="flex-1 items-center justify-center">
    <LottieView
      source={require('@/assets/animations/chatbot.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
    <Text className={"font-bold text-xl"}>يتم التحميل ...</Text>
  </SafeAreaView>;
  if (warehousesError || historyError) return <SafeAreaView className="flex-1 items-center justify-center">
    <LottieView
      source={require('@/assets/animations/Error.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  </SafeAreaView>;

  const dropdownOptions = warehouses.map((w) => ({ label: w.name, value: w.id }));
  const sections = selectedWarehouse?.sections ?? [];

  const totalProducts = new Set(
    sections.flatMap((section) =>
      (section.floors ?? []).flatMap((floor) =>
        (floor.stock_batches ?? []).map((batch) => batch.products?.name)
      )
    )
  ).size;

  const isSearching = search.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={isSearching ? searchResults : historyItems}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        refreshing={refreshing}
        onRefresh={onRefresh}
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
                value={search}
                placeholder=". . ."
                placeholderTextColor="#888"
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
                    <Text className="text-slate-700 text-md text-left">إجمالي الادوية</Text>
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
                      const distinctProductCount = new Set(
                        (item.floors ?? []).flatMap((floor) =>
                          (floor.stock_batches ?? []).map((batch) => batch.products?.name)
                        )
                      ).size;

                      return (
                        <Link key={item.id} href={`/sections/${item.id}`} asChild>
                          <Pressable
                            className={`flex flex-row items-start rounded-xl justify-between px-4 py-5 ${item.color ?? 'bg-slate-100'}`}
                          >
                            <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                              <View className="flex w-[50%] gap-2 flex-col">
                                <Text className="text-lg font-medium text-left">{item.name}</Text>
                                <Text className="text-sm text-slate-700 text-left">اضغط لمزيد من المعلومات</Text>
                              </View>
                              <View className=" flex flex-row w-[50%] items-center ">
                                <Text className="flex-1 text-slate-600 text-right">{distinctProductCount} أدوية</Text>
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
              <Text className="text-slate-400">لا توجد ادوية مطابقة</Text>
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
                  <Text className="text-slate-600">{item.quantity} دواء</Text>
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
                  {item.stock_batches?.products?.name ?? 'دواء غير معروف'}
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