import DropdownComponent from '@/components/shared/dropdowncomp';
import { Package, Layers, ChevronRight, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Text, View, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type warehouse = {
  label: string;
  value: string;
};

const WareHouses: warehouse[] = [
  { label: 'Pharmacie', value: 'pharmacie' },
  { label: 'Maison', value: 'maison' },
];

const sections = [
  { title: 'pharmacie', key: 'sec1', itemCount: 24 },
  { title: 'maison', key: 'sec2', itemCount: 58 },
];

const recentItems = [
  { title: 'Paracetamol 500mg', key: 'rec1', subtitle: 'Added 2h ago' },
  { title: 'Cardboard Boxes M', key: 'rec2', subtitle: 'Moved 4h ago' },
  { title: 'Surgical Masks', key: 'rec3', subtitle: 'Updated yesterday' },
];

const PREVIEW_LIMIT = 3;

export default function Index() {
  const [search, setsearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <ScrollView contentContainerClassName="w-full p-4 gap-4">
        <DropdownComponent options={WareHouses} />
        <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
          <Search size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-2 h-full text-base text-slate-800"
            placeholder="Search languages..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setsearch}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
            <Package size={20} color="#4338ca" />
            <Text className="text-2xl font-bold mt-2">146</Text>
            <Text className="text-slate-500 text-sm">Total items</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
            <Layers size={20} color="#4338ca" />
            <Text className="text-2xl font-bold mt-2">{sections.length}</Text>
            <Text className="text-slate-500 text-sm">Sections</Text>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-slate-200 h-64">
          <View className="p-4">
            <Text className="font-semibold text-lg">Sections</Text>
          </View>
          <FlatList
            className="flex-1"
            data={sections}
            keyExtractor={(item) => item.key}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
            renderItem={({ item }) => (
              <Pressable className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-base">{item.title}</Text>
                <Text className="text-slate-400 text-sm">{item.itemCount} items</Text>
              </Pressable>
            )}
          />
        </View>

        <View className="bg-white rounded-xl border border-slate-200">
          <View className="flex-row items-center justify-between p-4">
            <Text className="font-semibold text-lg">Recent</Text>
            <Pressable className="flex-row items-center">
              <Text className="text-indigo-700 font-medium mr-1">View all</Text>
              <ChevronRight size={16} color="#4338ca" />
            </Pressable>
          </View>
          <FlatList
            data={recentItems.slice(0, PREVIEW_LIMIT)}
            keyExtractor={(item) => item.key}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
            renderItem={({ item }) => (
              <View className="px-4 py-3">
                <Text className="text-base">{item.title}</Text>
                <Text className="text-slate-400 text-sm">{item.subtitle}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}