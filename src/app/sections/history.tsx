import { useHistory } from '@/hooks/useHistory';
import LottieView from 'lottie-react-native';
import { Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
    const { historyItems, loading, error, refetch } = useHistory();
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const filteredHistory = useMemo(() => {
        if (!search.trim()) return historyItems;
        const query = search.trim().toLowerCase();
        return historyItems.filter((item) =>
            item.stock_batches?.products?.name?.toLowerCase().includes(query)
        );
    }, [historyItems, search]);

    if (loading) return <SafeAreaView className="flex-1 items-center justify-center">
        <LottieView
            source={require('@/assets/animations/chatbot.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
        />
        <Text className={"font-bold text-xl"}>يتم التحميل ...</Text>

    </SafeAreaView>;
    if (error) return <SafeAreaView className="flex-1 items-center justify-center">
        <LottieView
            source={require('@/assets/animations/Error.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
        />
    </SafeAreaView>;

    return (
        <SafeAreaView className="flex-1 bg-indigo-50 p-4">
            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.id}
                contentContainerClassName="gap-4"
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={
                    <View className="gap-4">
                        <Text className="text-2xl font-bold text-right">السجل</Text>

                        <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
                            <Search size={20} color="#64748b" />
                            <TextInput
                                className="flex-1 mr-2 h-full text-base text-slate-800 text-right"
                                placeholder=". . ."
                                placeholderTextColor="#888"
                                value={search}
                                onChangeText={setSearch}
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                            />
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View className="items-center py-8">
                        <Text className="text-slate-400">لا توجد سجلات مطابقة</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="bg-white px-4 py-3 rounded-xl border border-slate-200">
                        <Text className="text-lg  font-medium text-right">
                            {item.stock_batches?.products?.name ?? 'دواء غير معروف'}
                        </Text>
                        <Text className="text-slate-700 text-md text-right">
                            {item.from_warehouse?.name ?? 'N/A'} ← {item.to_warehouse?.name ?? 'N/A'} · {item.quantity} دواء · {new Date(item.created_at).toLocaleDateString('ar')}
                        </Text>
                        {item.note && (
                            <Text className="text-slate-700 text-sm text-right mt-1">{item.note}</Text>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}