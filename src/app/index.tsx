import DropdownComponent from '@/components/shared/dropdowncomp';
import { ChevronRight, Dot, Layers, Package, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type warehouse = {
  label: string;
  value: string;
};

const WareHouses: warehouse[] = [
  { label: 'pharmacie', value: 'pharmacie' },
  { label: 'maison', value: 'yellow' },
];

const sections = [
  { title: 'Orange rack', key: 'sec1', itemCount: 24, color: 'bg-orange-100' },
  { title: 'Yellow rack', key: 'sec2', itemCount: 58, color: 'bg-yellow-100' },
  { title: 'Yellow rack', key: 'sec3', itemCount: 58, color: 'bg-yellow-100' },
  { title: 'Yellow rack', key: 'sec4', itemCount: 58, color: 'bg-yellow-100' },
];

const historyItems = [
  { title: 'Paracetamol 500mg', key: 'rec1', subtitle: 'Added 2h ago' },
  { title: 'Cardboard Boxes M', key: 'rec2', subtitle: 'Moved 4h ago' },
  { title: 'Surgical Masks', key: 'rec3', subtitle: 'Updated yesterday' },
];

export default function Index() {
  const [search, setsearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.key}
        contentContainerClassName="p-4 gap-4"

        ListHeaderComponent={
          <View className="gap-4">
            <DropdownComponent options={WareHouses} />

            <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
              <Search size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-2 h-full text-base text-slate-800"
                placeholder="Search products..."
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

            <View className="bg-white rounded-xl border border-slate-200 p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-lg">Sections</Text>
                <Pressable className="flex-row items-center">
                  <Text className="text-indigo-700 font-medium mr-1">View all</Text>
                  <ChevronRight size={16} color="#4338ca" />
                </Pressable>
              </View>

              <View className="gap-3">
                {sections.slice(0, 2).map((item) => (
                  <Pressable
                    key={item.key}
                    className={`flex flex-row items-start rounded-xl justify-between px-4 py-3 ${item.color}`}
                  >
                    <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                      <View className="flex flex-col ">
                        <Text className="text-lg font-medium">{item.title}</Text>
                        <Text className="text-sm text-slate-500">Click for more info</Text>
                      </View>

                      <View className="flex h-full flex-row items-center">
                        <Dot size={34} color="#64748b" />
                        <Text className=" text-slate-600">{item.itemCount} items</Text>
                      </View>
                    </View>
                    <View className="w-[10%] h-full flex flex-row justify-end items-center">
                      <ChevronRight size={26} color="#4338ca" />
                    </View>
                  </Pressable>
                ))}
                {sections.length > 2 ?
                 <View className="w-full flex flex-row items-center justify-center">
                  <Dot size={15} />
                  <Dot size={15} />
                  <Dot size={15} />
                </View> : ""}
                
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-lg">History</Text>
              <Pressable className="flex-row items-center">
                <Text className="text-indigo-700 font-medium mr-1">View all</Text>
                <ChevronRight size={16} color="#4338ca" />
              </Pressable>
            </View>
          </View>
        }

        renderItem={({ item }) => (
          <View className="bg-white px-4 py-3 rounded-xl border border-slate-200">
            <Text className="text-base font-medium">{item.title}</Text>
            <Text className="text-slate-400 text-sm">{item.subtitle}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}