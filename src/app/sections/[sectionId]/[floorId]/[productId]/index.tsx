import { useWarehouseContext } from '@/context/warehouseContext';
import { useProduct } from '@/hooks/useProduct';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ArrowLeftRight, Calendar, ChevronLeft, Hash, Layers, MapPin, Pencil, Trash2, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetail() {
    const { productId } = useLocalSearchParams();
    const { product: batch, loading, error, refetch } = useProduct(productId as string);
    const { warehouses, selectedWarehouse, refresh } = useWarehouseContext();
    const router = useRouter();

    const [editVisible, setEditVisible] = useState(false);
    const [transferVisible, setTransferVisible] = useState(false);

    const [editName, setEditName] = useState('');
    const [editDci, setEditDci] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editLot, setEditLot] = useState('');
    const [editExpiryMonth, setEditExpiryMonth] = useState('');
    const [editExpiryYear, setEditExpiryYear] = useState('');
    const [transferQuantity, setTransferQuantity] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferTargetWarehouseId, setTransferTargetWarehouseId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetch(), refresh()]);
        setRefreshing(false);
    }, [refetch, refresh]);

    if (loading)
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <LottieView
                    source={require('@/assets/animations/chatbot.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
                <Text className={'font-bold text-xl'}>يتم التحميل ...</Text>
            </SafeAreaView>
        );

    if (error)
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <LottieView
                    source={require('@/assets/animations/Error.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
            </SafeAreaView>
        );

    if (!batch) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>الدواء غير موجود</Text>
            </SafeAreaView>
        );
    }

    function formatMonthYear(isoDate: string) {
        const [year, month] = isoDate.split('-');
        return `${month}/${year}`;
    }

    let location: { warehouseName: string; sectionName: string; floorName: string } | null = null;
    for (const warehouse of warehouses) {
        for (const section of warehouse.sections ?? []) {
            for (const floor of section.floors ?? []) {
                if ((floor.stock_batches ?? []).some((b) => b.id === batch.id)) {
                    location = { warehouseName: warehouse.name, sectionName: section.name, floorName: floor.name };
                }
            }
        }
    }

    const handleDelete = () => {
        Alert.alert('حذف هذه الدفعة؟', `سيتم حذف ${batch.products?.name} (${batch.lot}) نهائيًا من المخزون.`, [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'حذف',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.from('stock_batches').delete().eq('id', batch.id);
                    if (error) {
                        Alert.alert('خطأ', error.message);
                    } else {
                        router.back();
                    }
                },
            },
        ]);
    };

    const openEditModal = () => {
        setEditName(batch.products?.name ?? '');
        setEditDci(batch.products?.dci ?? '');
        setEditQuantity(String(batch.quantity));
        setEditLot(batch.lot);
        const [year, month] = batch.expiry_date.split('-');
        setEditExpiryMonth(month);
        setEditExpiryYear(year);
        setEditVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim() || !editDci.trim()) {
            Alert.alert('معلومات ناقصة', 'يرجى إدخال اسم الدواء والـ DCI.');
            return;
        }

        const month = editExpiryMonth.padStart(2, '0');
        const year = editExpiryYear;
        if (!/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) {            Alert.alert('تاريخ غير صالح', 'يرجى إدخال شهر وسنة صحيحين.');
            return;
        }
        const reconstructedExpiry = `${year}-${month}-01`;

        setSubmitting(true);

        if (batch.products?.id) {
            const { error: productError } = await supabase
                .from('products')
                .update({ name: editName.trim(), dci: editDci.trim() })
                .eq('id', batch.products.id);

            if (productError) {
                setSubmitting(false);
                Alert.alert('خطأ', productError.message);
                return;
            }
        }

        const { error } = await supabase
            .from('stock_batches')
            .update({
                quantity: parseInt(editQuantity, 10) || 0,
                lot: editLot,
                expiry_date: reconstructedExpiry,
            })
            .eq('id', batch.id);
        setSubmitting(false);

        if (error) {
            Alert.alert('خطأ', error.message);
            return;
        }
        setEditVisible(false);
        refetch();
        refresh();
    };

    const otherWarehouses = warehouses.filter((w) => w.id !== selectedWarehouse?.id);

    const openTransferModal = () => {
        setTransferQuantity(String(batch.quantity));
        setTransferNote('');
        setTransferTargetWarehouseId(otherWarehouses[0]?.id ?? null);
        setTransferVisible(true);
    };

    const handleConfirmTransfer = async () => {
        if (!transferTargetWarehouseId || !selectedWarehouse) return;

        const qty = parseInt(transferQuantity, 10) || 0;
        if (qty <= 0 || qty > batch.quantity) {
            Alert.alert('كمية غير صالحة', `أدخل رقمًا بين 1 و ${batch.quantity}.`);
            return;
        }

        setSubmitting(true);

        const { error: movementError } = await supabase.from('stock_movements').insert({
            batch_id: batch.id,
            quantity: qty,
            movement_type: 'transfer',
            from_warehouse_id: selectedWarehouse.id,
            to_warehouse_id: transferTargetWarehouseId,
            note: transferNote.trim() || null,
        });

        if (movementError) {
            setSubmitting(false);
            Alert.alert('خطأ', movementError.message);
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
            <ScrollView
                contentContainerClassName="p-4 gap-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="bg-white rounded-xl border border-slate-200 p-5 gap-4">
                    <View className="flex-row items-center justify-between mt-2 px-1">
                        <Text className="font-semibold text-2xl text-left">{batch.products?.name}</Text>
                        <Pressable onPress={() => router.back()} className="p-2">
                            <ChevronLeft size={28} color="#4338ca" />
                        </Pressable>
                    </View>

                    {location && (
                        <View className="flex-row items-center justify-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                            <MapPin size={20} color="#4338ca" />
                            <Text className="flex-1 text-sm text-indigo-800 text-right">
                                {location.warehouseName} · {location.sectionName} · {location.floorName}
                            </Text>
                        </View>
                    )}

                    <View className={'flex-row'}>
                        <View className="flex-1 gap-3">
                            <View className="flex-row items-center gap-3">
                                <Layers size={18} color="#4338ca" />
                                <View>
                                    <Text className="text-slate-800 text-xs text-left">DCI</Text>
                                    <Text className="text-base text-slate-800 text-left">{batch.products?.dci}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-3">
                                <Hash size={18} color="#4338ca" />
                                <View>
                                    <Text className="text-slate-800 text-xs text-left">LOT</Text>
                                    <Text className="text-base text-slate-800 text-left">{batch.lot}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-3">
                                <Calendar size={18} color="#4338ca" />
                                <View>
                                    <Text className="text-slate-800 text-sm text-left">تاريخ نهاية الصلاحية </Text>
                                    <Text className="text-base text-slate-800 text-left">{formatMonthYear(batch.expiry_date)}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-col justify-center items-center flex-1 border-l border-slate-300">
                            <Text className="w-[30%] text-slate-600 text-xl text-center">الكمية</Text>
                            <Text className="text-5xl font-bold text-indigo-700 text-left">{batch.quantity}</Text>
                        </View>
                    </View>
                </View>

                <View className="gap-3">
                    <Pressable
                        onPress={openEditModal}
                        className="flex-row items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-4"
                    >
                        <Pencil size={18} color="#4338ca" />
                        <Text className="text-indigo-700 font-medium text-base">تعديل</Text>
                    </Pressable>

                    <Pressable
                        onPress={openTransferModal}
                        className="flex-row items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-4"
                    >
                        <ArrowLeftRight size={18} color="#4338ca" />
                        <Text className="text-indigo-700 font-medium text-base">نقل</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDelete}
                        className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl py-4"
                    >
                        <Trash2 size={18} color="#dc2626" />
                        <Text className="text-red-600 font-medium text-base">حذف</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1 justify-end bg-black/40"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-2xl p-5 max-h-[90%]">
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-6">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-lg font-bold">تعديل الدواء</Text>
                                    <Pressable onPress={() => setEditVisible(false)}>
                                        <X size={22} color="#64748b" />
                                    </Pressable>
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">اسم الدواء</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            value={editName}
                                            onChangeText={setEditName}
                                        />
                                        {editName.length > 0 && (
                                            <Pressable onPress={() => setEditName('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">DCI</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            value={editDci}
                                            onChangeText={setEditDci}
                                        />
                                        {editDci.length > 0 && (
                                            <Pressable onPress={() => setEditDci('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">الكمية</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            keyboardType="numeric"
                                            value={editQuantity}
                                            onChangeText={setEditQuantity}
                                        />
                                        {editQuantity.length > 0 && (
                                            <Pressable onPress={() => setEditQuantity('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">LOT</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            value={editLot}
                                            onChangeText={setEditLot}
                                        />
                                        {editLot.length > 0 && (
                                            <Pressable onPress={() => setEditLot('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">تاريخ نهاية الصلاحية (شهر/سنة)</Text>
                                    <View className="flex-row gap-2">
                                        <View className="flex-1 flex-row items-center border border-slate-300 rounded-lg px-3">
                                            <TextInput
                                                className="flex-1 py-2 text-base text-center"
                                                keyboardType="numeric"
                                                maxLength={2}
                                                placeholder="شهر"
                                                value={editExpiryMonth}
                                                onChangeText={setEditExpiryMonth}
                                            />
                                            {editExpiryMonth.length > 0 && (
                                                <Pressable onPress={() => setEditExpiryMonth('')} hitSlop={10} className="p-1">
                                                    <X size={18} color="#64748b" />
                                                </Pressable>
                                            )}
                                        </View>
                                        <View className="flex-1 flex-row items-center border border-slate-300 rounded-lg px-3">
                                            <TextInput
                                                className="flex-1 py-2 text-base text-center"
                                                keyboardType="numeric"
                                                maxLength={4}
                                                placeholder="سنة"
                                                value={editExpiryYear}
                                                onChangeText={setEditExpiryYear}
                                            />
                                            {editExpiryYear.length > 0 && (
                                                <Pressable onPress={() => setEditExpiryYear('')} hitSlop={10} className="p-1">
                                                    <X size={18} color="#64748b" />
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={handleSaveEdit}
                                    disabled={submitting}
                                    className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
                                >
                                    <Text className="text-white font-semibold">
                                        {submitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                                    </Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            <Modal visible={transferVisible} animationType="slide" transparent onRequestClose={() => setTransferVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1 justify-end bg-black/40"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="bg-white rounded-t-2xl p-5 max-h-[90%]">
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-6">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-lg font-bold">نقل الدفعة</Text>
                                    <Pressable onPress={() => setTransferVisible(false)}>
                                        <X size={22} color="#64748b" />
                                    </Pressable>
                                </View>

                                <Text className="text-slate-700 text-md text-left">
                                    المتاح: {batch.quantity} وحدة
                                </Text>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">الكمية المراد نقلها</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            keyboardType="numeric"
                                            value={transferQuantity}
                                            onChangeText={setTransferQuantity}
                                        />
                                        {transferQuantity.length > 0 && (
                                            <Pressable onPress={() => setTransferQuantity('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-slate-700 text-md text-left">المستودع الوجهة</Text>
                                    {otherWarehouses.map((w) => (
                                        <Pressable
                                            key={w.id}
                                            onPress={() => setTransferTargetWarehouseId(w.id)}
                                            className={`flex-row items-center justify-between border rounded-lg px-3 py-3 ${transferTargetWarehouseId === w.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
                                                }`}
                                        >
                                            <Text className="text-base text-right">{w.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <View className="gap-1">
                                    <Text className="text-slate-700 text-md text-left">ملاحظة (اختياري)</Text>
                                    <View className="flex-row items-center border border-slate-300 rounded-lg px-3">
                                        <TextInput
                                            className="flex-1 py-2 text-base text-right"
                                            value={transferNote}
                                            onChangeText={setTransferNote}
                                            placeholder=""
                                            multiline
                                        />
                                        {transferNote.length > 0 && (
                                            <Pressable onPress={() => setTransferNote('')} hitSlop={10} className="p-1">
                                                <X size={18} color="#64748b" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>

                                <Pressable
                                    onPress={handleConfirmTransfer}
                                    disabled={submitting || !transferTargetWarehouseId}
                                    className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
                                >
                                    <Text className="text-white font-semibold">
                                        {submitting ? 'جارٍ النقل...' : 'تأكيد النقل'}
                                    </Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}