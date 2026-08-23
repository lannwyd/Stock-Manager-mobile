import { useLocalSearchParams } from 'expo-router';
import { Pencil, Trash2, ArrowLeftRight, Calendar, Hash, Layers } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/hooks/useProduct';

export default function ProductDetail() {
    const { productId } = useLocalSearchParams();
    const { product: batch, loading, error } = useProduct(productId as string);

   
    if (loading) return <SafeAreaView className="flex-1 items-center justify-center"><Text>Loading...</Text></SafeAreaView>;
    if (error) return <SafeAreaView className="flex-1 items-center justify-center"><Text>Error loading data</Text></SafeAreaView>;

    if (!batch) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Product not found</Text>
            </SafeAreaView>
        );
    }

    const handleEdit = () => {
    };

    const handleDelete = () => {
    };

    const handleTransfer = () => {
    };

    return (
        <SafeAreaView className="flex-1 bg-indigo-50">
            <ScrollView contentContainerClassName="p-4 gap-4">
                <View className="bg-white rounded-xl border border-slate-200 p-5 gap-4">
                    <Text className="text-2xl font-bold">{batch.products?.name}</Text>

                    <View className="gap-3">
                        <View className="flex-row items-center gap-3">
                            <Layers size={18} color="#4338ca" />
                            <View>
                                <Text className="text-slate-400 text-xs">DCI</Text>
                                <Text className="text-base text-slate-800">{batch.products?.dci}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <Hash size={18} color="#4338ca" />
                            <View>
                                <Text className="text-slate-400 text-xs">LOT</Text>
                                <Text className="text-base text-slate-800">{batch.lot}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <Calendar size={18} color="#4338ca" />
                            <View>
                                <Text className="text-slate-400 text-xs">Expiry date</Text>
                                <Text className="text-base text-slate-800">{batch.expiry_date}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="border-t border-slate-100 pt-4">
                        <Text className="text-slate-400 text-xs">Quantity</Text>
                        <Text className="text-3xl font-bold text-indigo-700">{batch.quantity}</Text>
                    </View>
                </View>

                <View className="gap-3">
                    <Pressable
                        onPress={handleEdit}
                        className="flex-row items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-4"
                    >
                        <Pencil size={18} color="#4338ca" />
                        <Text className="text-indigo-700 font-medium text-base">Edit</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleTransfer}
                        className="flex-row items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-4"
                    >
                        <ArrowLeftRight size={18} color="#4338ca" />
                        <Text className="text-indigo-700 font-medium text-base">Transfer</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDelete}
                        className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl py-4"
                    >
                        <Trash2 size={18} color="#dc2626" />
                        <Text className="text-red-600 font-medium text-base">Delete</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}