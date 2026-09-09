import { useWarehouseContext } from '@/context/warehouseContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Layers, Package, Search, Plus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TextInput, View, TouchableHighlight } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function FloorDetail() {

  const router = useRouter();
  const { sectionId, floorId } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const { selectedWarehouse, loading, error, refresh } = useWarehouseContext();

  const section = selectedWarehouse?.sections.find((s) => s.id === sectionId);
  const floor = section?.floors.find((f) => f.id === floorId);

  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDci, setNewDci] = useState('');
  const [newLot, setNewLot] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredBatches = useMemo(() => {
    if (!floor) return [];
    const batches = floor.stock_batches ?? [];
    if (!search.trim()) return batches;

    const query = search.trim().toLowerCase();
    return batches.filter(
      (b) =>
        b.products?.name.toLowerCase().includes(query) ||
        b.products?.dci.toLowerCase().includes(query)
    );
  }, [floor, search]);

  if (loading) return <SafeAreaView className="flex-1 items-center justify-center"><Text>جار التحميل...</Text></SafeAreaView>;
  if (error) return <SafeAreaView className="flex-1 items-center justify-center"><Text>{error}</Text></SafeAreaView>;
  if (!floor) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>الطابق غير موجود</Text>
      </SafeAreaView>
    );
  }

  const totalItems = (floor.stock_batches ?? []).reduce((sum, b) => sum + (b.quantity ?? 0), 0);
  const totalProducts = floor.stock_batches?.length ?? 0;

  const resetForm = () => {
    setNewName('');
    setNewDci('');
    setNewLot('');
    setNewExpiry('');
    setNewQuantity('');
  };

  const openAddModal = () => {
    resetForm();
    setAddVisible(true);
  };

  const handleAddition = async () => {
    if (!newName.trim() || !newDci.trim() || !newLot.trim() || !newExpiry.trim()) {
      Alert.alert('معلومات ناقصة', 'يرجى إدخال الاسم، الـ DCI، رقم اللوت، وتاريخ الانتهاء.');
      return;
    }
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('كمية غير صالحة', 'أدخل كمية أكبر من 0.');
      return;
    }

    setSubmitting(true);

    let productId: string;
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('name', newName.trim())
      .eq('dci', newDci.trim())
      .maybeSingle();

    if (existingProduct) {
      productId = existingProduct.id;
    } else {
      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert({ name: newName.trim(), dci: newDci.trim() })
        .select('id')
        .single();

      if (productError || !createdProduct) {
        setSubmitting(false);
        Alert.alert('خطأ', productError?.message ?? 'تعذر إنشاء المنتج');
        return;
      }
      productId = createdProduct.id;
    }

    const { error: batchError } = await supabase.from('stock_batches').insert({
      product_id: productId,
      floor_id: floorId,
      lot: newLot.trim(),
      expiry_date: newExpiry.trim(),
      quantity: qty,
    });

    setSubmitting(false);

    if (batchError) {
      Alert.alert('خطأ', batchError.message);
      return;
    }

    setAddVisible(false);
    resetForm();
    refresh();
  };

  return (
    <SafeAreaView className="flex-1 bg-indigo-50 p-4">
      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-4"
        ListHeaderComponent={
          <View className="gap-4">
            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-2xl text-left">{floor.name}</Text>
              <Pressable onPress={() => router.back()} className="p-2">
                <ChevronLeft size={28} color="#4338ca" />
              </Pressable>
            </View>

            <View className="flex-row items-center bg-white w-full h-14 rounded-xl border border-slate-400 px-3">
              <Search size={20} color="#64748b" />
              <TextInput
                className="flex-1 mr-2 h-full text-base text-slate-800 text-right"
                placeholder="ابحث عن منتج أو DCI..."
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Package size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{totalItems}</Text>
                <Text className="text-slate-700 text-md text-left">إجمالي المنتجات</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{totalProducts}</Text>
                <Text className="text-slate-700 text-md text-left">الأدوية</Text>
              </View>
            </View>

            <Text className="font-semibold text-lg mt-2 px-1">الأدوية</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-slate-400">لا توجد منتجات مطابقة</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/sections/${sectionId}/${floorId}/${item.id}`} asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-4">
              <View>
                <Text className="text-base font-medium text-right">{item.products?.name}</Text>
                <Text className="text-sm text-slate-500 text-right">{item.products?.dci}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-slate-800">{item.quantity} علبة</Text>
                <ChevronLeft size={20} color="#4338ca" />
              </View>
            </Pressable>
          </Link>
        )}
      />

      <TouchableHighlight
        onPress={openAddModal}
        className="w-full flex flex-col justify-center items-center bg-indigo-500 h-20 rounded-md"
      >
        <Plus size={36} color="#FFFFFF" />
      </TouchableHighlight>

      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold">إضافة منتج إلى {floor.name}</Text>
              <Pressable onPress={() => setAddVisible(false)}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">اسم المنتج</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newName}
                onChangeText={setNewName}
                placeholder="Paralgan"
              />
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">DCI</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newDci}
                onChangeText={setNewDci}
                placeholder="Paracetamol"
              />
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">رقم اللوت</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newLot}
                onChangeText={setNewLot}
                placeholder="LOT-24A7X9"
              />
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">تاريخ الانتهاء (YYYY-MM-DD)</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newExpiry}
                onChangeText={setNewExpiry}
                placeholder="2027-01-01"
              />
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">الكمية</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                keyboardType="numeric"
                value={newQuantity}
                onChangeText={setNewQuantity}
                placeholder="50"
              />
            </View>

            <Pressable
              onPress={handleAddition}
              disabled={submitting}
              className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
            >
              <Text className="text-white font-semibold">{submitting ? 'جارٍ الإضافة...' : 'إضافة منتج'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}