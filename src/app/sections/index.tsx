import { Link } from 'expo-router';
import { ChevronRight, Dot, Layers, Package } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { section } from './[sectionId]';

type Floor = {
  key: string;
  title: string;
  itemCount: number;
};

type Section = {
  key: string;
  title: string;
  itemCount: number;
  color: string;
  floors: Floor[];
};

const sections: Section[] = [
  {
    title: 'Orange rack',
    key: 'sec1',
    itemCount: 24,
    color: 'bg-orange-100',
    floors: [
      { key: 'sec1-floor1', title: 'Floor 1', itemCount: 10 },
      { key: 'sec1-floor2', title: 'Floor 2', itemCount: 8 },
      { key: 'sec1-floor3', title: 'Floor 3', itemCount: 6 },
    ],
  },
  {
    title: 'Yellow rack',
    key: 'sec2',
    itemCount: 58,
    color: 'bg-yellow-100',
    floors: [
      { key: 'sec2-floor1', title: 'Floor 1', itemCount: 20 },
      { key: 'sec2-floor2', title: 'Floor 2', itemCount: 20 },
      { key: 'sec2-floor3', title: 'Floor 3', itemCount: 18 },
    ],
  },
  {
    title: 'Yellow rack',
    key: 'sec3',
    itemCount: 58,
    color: 'bg-yellow-100',
    floors: [
      { key: 'sec3-floor1', title: 'Floor 1', itemCount: 20 },
      { key: 'sec3-floor2', title: 'Floor 2', itemCount: 20 },
      { key: 'sec3-floor3', title: 'Floor 3', itemCount: 18 },
    ],
  },
  {
    title: 'Yellow rack',
    key: 'sec4',
    itemCount: 58,
    color: 'bg-yellow-100',
    floors: [
      { key: 'sec4-floor1', title: 'Floor 1', itemCount: 20 },
      { key: 'sec4-floor2', title: 'Floor 2', itemCount: 20 },
      { key: 'sec4-floor3', title: 'Floor 3', itemCount: 18 },
    ],
  }


];
export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-indigo-50">
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        contentContainerClassName="p-4 gap-4"

        ListHeaderComponent={
          <View className="gap-4">


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

            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-lg">Sections</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/sections/${item.key}`} asChild>
            <Pressable
              className={`flex flex-row items-start rounded-xl justify-between px-4 py-5 ${item.color}`}
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
          </Link>

        )}
      />
    </SafeAreaView>
  );
}