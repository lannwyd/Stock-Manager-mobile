import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Dot, Layers, Package } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WareHouses } from '@/lib/data';

export default function SectionDetail() {
  const { sectionId } = useLocalSearchParams();

  const selectedWarehouse = WareHouses.find((w) => w.key === 'pharmacie')!;
  const section = selectedWarehouse.sections.find((s) => s.key === sectionId);

  if (!section) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Section not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={section.floors}
        keyExtractor={(item) => item.key}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Package size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2">{section.totalItems}</Text>
                <Text className="text-slate-500 text-sm">Total items</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2">{section.floors.length}</Text>
                <Text className="text-slate-500 text-sm">Floors</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-lg">Floors</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/sections/${sectionId}/floors/${item.key}`} asChild>
            <Pressable className="flex flex-row items-start rounded-xl justify-between px-4 py-5 bg-white">
              <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                <View className="flex flex-col">
                  <Text className="text-lg font-medium">{item.title}</Text>
                  <Text className="text-sm text-slate-500">Click for more info</Text>
                </View>
                <View className="flex h-full flex-row items-center">
                  <Dot size={34} color="#64748b" />
                  <Text className="text-slate-600">{item.totalItems} items</Text>
                </View>
              </View>
              <View className="w-[10%] h-full flex flex-row justify-end items-center">
                <ChevronRight size={26} color="#4338ca" />
              </View>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}