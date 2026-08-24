import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil, Trash2, ArrowLeftRight, Calendar, Hash, Layers, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/hooks/useProduct';
import { useWarehouseContext } from '@/context/warehouseContext';
import { supabase } from '@/lib/supabase';

export default function ProductDetail() {
    const { productId } = useLocalSearchParams();
    const { product: batch, loading, error, refetch } = useProduct(productId as string);
    const { warehouses, selectedWarehouse } = useWarehouseContext();
    const router = useRouter();

    const [editVisible, setEditVisible] = useState(false);
    const [transferVisible, setTransferVisible] = useState(false);

    const [editQuantity, setEditQuantity] = useState('');
    const [editLot, setEditLot] = useState('');
    const [editExpiry, setEditExpiry] = useState('');

    const [transferQuantity, setTransferQuantity] = useState('');
    const [transferTargetWarehouseId, setTransferTargetWarehouseId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (loading) return <SafeAreaView className="flex-1 items-center justify-center"><Text>Loading...</Text></SafeAreaView>;
    if (error) return <SafeAreaView className="flex-1 items-center justify-center"><Text>{error}</Text></SafeAreaView>;

    if (!batch) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Product not found</Text>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete this batch?',
            `This will permanently remove ${batch.products?.name} (LOT ${batch.lot}) from inventory.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.from('stock_batches').delete().eq('id', batch.id);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            router.back();
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = () => {
        setEditQuantity(String(batch.quantity));
        setEditLot(batch.lot);
        setEditExpiry(batch.expiry_date);
        setEditVisible(true);
    };

    const handleSaveEdit = async () => {
        setSubmitting(true);
        const { error } = await supabase
            .from('stock_batches')
            .update({
                quantity: parseInt(editQuantity, 10) || 0,
                lot: editLot,
                expiry_date: editExpiry,
            })
            .eq('id', batch.id);
        setSubmitting(false);

        if (error) {
            Alert.alert('Error', error.message);
            return;
        }
        setEditVisible(false);
        refetch();
    };

    const otherWarehouses = warehouses.filter((w) => w.id !== selectedWarehouse?.id);

    const openTransferModal = () => {
        setTransferQuantity(String(batch.quantity));
        setTransferTargetWarehouseId(otherWarehouses[0]?.id ?? null);
        setTransferVisible(true);
    };

    const handleConfirmTransfer = async () => {
        if (!transferTargetWarehouseId || !selectedWarehouse) return;

        const qty = parseInt(transferQuantity, 10) || 0;
        if (qty <= 0 || qty > batch.quantity) {
            Alert.alert('Invalid quantity', `Enter a number between 1 and ${batch.quantity}.`);
            return;
        }

        setSubmitting(true);

        const { error: movementError } = await supabase.from('stock_movements').insert({
            batch_id: batch.id,
            quantity: qty,
            movement_type: 'transfer',
            from_warehouse_id: selectedWarehouse.id,
            to_warehouse_id: transferTargetWarehouseId,
        });

        if (movementError) {
            setSubmitting(false);
            Alert.alert('Error', movementError.message);
            return;
        }

        const remaining = batch.quantity - qty;
        if (remaining <= 0) {
            await supabase.from('stock_batches').delete().eq('id', batch.id);
        } else {
            await supabase.from('stock_batches').update({ quantity: remaining }).eq('id', batch.id);
        }

        setSubmitting(false);
        setTransferVisible(false);
        router.back();
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
                        onPress={openEditModal}
                        className="flex-row items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-4"
                    >
                        <Pencil size={18} color="#4338ca" />
                        <Text className="text-indigo-700 font-medium text-base">Edit</Text>
                    </Pressable>

                    <Pressable
                        onPress={openTransferModal}
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

            <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-2xl p-5 gap-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold">Edit batch</Text>
                            <Pressable onPress={() => setEditVisible(false)}>
                                <X size={22} color="#64748b" />
                            </Pressable>
                        </View>

                        <View className="gap-1">
                            <Text className="text-slate-500 text-xs">Quantity</Text>
                            <TextInput
                                className="border border-slate-300 rounded-lg px-3 py-2 text-base"
                                keyboardType="numeric"
                                value={editQuantity}
                                onChangeText={setEditQuantity}
                            />
                        </View>

                        <View className="gap-1">
                            <Text className="text-slate-500 text-xs">LOT</Text>
                            <TextInput
                                className="border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={editLot}
                                onChangeText={setEditLot}
                            />
                        </View>

                        <View className="gap-1">
                            <Text className="text-slate-500 text-xs">Expiry date (YYYY-MM-DD)</Text>
                            <TextInput
                                className="border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={editExpiry}
                                onChangeText={setEditExpiry}
                                placeholder="2027-01-01"
                            />
                        </View>

                        <Pressable
                            onPress={handleSaveEdit}
                            disabled={submitting}
                            className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
                        >
                            <Text className="text-white font-semibold">{submitting ? 'Saving...' : 'Save changes'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={transferVisible} animationType="slide" transparent onRequestClose={() => setTransferVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-2xl p-5 gap-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold">Transfer batch</Text>
                            <Pressable onPress={() => setTransferVisible(false)}>
                                <X size={22} color="#64748b" />
                            </Pressable>
                        </View>

                        <Text className="text-slate-500 text-sm">
                            Available: {batch.quantity} units
                        </Text>

                        <View className="gap-1">
                            <Text className="text-slate-500 text-xs">Quantity to transfer</Text>
                            <TextInput
                                className="border border-slate-300 rounded-lg px-3 py-2 text-base"
                                keyboardType="numeric"
                                value={transferQuantity}
                                onChangeText={setTransferQuantity}
                            />
                        </View>

                        <View className="gap-2">
                            <Text className="text-slate-500 text-xs">Destination warehouse</Text>
                            {otherWarehouses.map((w) => (
                                <Pressable
                                    key={w.id}
                                    onPress={() => setTransferTargetWarehouseId(w.id)}
                                    className={`flex-row items-center justify-between border rounded-lg px-3 py-3 ${transferTargetWarehouseId === w.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
                                        }`}
                                >
                                    <Text className="text-base">{w.name}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text className="text-xs text-slate-400">
                            Note: this removes stock from the current warehouse but does not automatically add it
                            to the destination — it only logs the transfer in history.
                        </Text>

                        <Pressable
                            onPress={handleConfirmTransfer}
                            disabled={submitting || !transferTargetWarehouseId}
                            className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
                        >
                            <Text className="text-white font-semibold">{submitting ? 'Transferring...' : 'Confirm transfer'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}