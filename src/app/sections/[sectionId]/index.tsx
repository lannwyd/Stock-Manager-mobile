import { useWarehouseContext } from '@/context/warehouseContext';
import { supabase } from '@/lib/supabase';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronLeft, Dot, Layers, Package, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SectionDetail() {
  const router = useRouter();

  const { sectionId } = useLocalSearchParams();
  const { selectedWarehouse, loading, error, refresh } = useWarehouseContext();

  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading) return <SafeAreaView className="flex-1 items-center justify-center">
    <LottieView
      source={require('@/assets/animations/chatbot.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  </SafeAreaView>;
  if (error) return <SafeAreaView className="flex-1 items-center justify-center">
    <LottieView
      source={require('@/assets/animations/Error.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  </SafeAreaView>;

  const section = selectedWarehouse?.sections.find((s) => s.id === sectionId);

  if (!section) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>القسم غير موجود</Text>
      </SafeAreaView>
    );
  }

  const totalItems = (section.floors ?? []).reduce((fSum, floor) => {
    return fSum + (floor.stock_batches ?? []).reduce((bSum, batch) => bSum + (batch.quantity ?? 0), 0);
  }, 0);

  const openAddModal = () => {
    setNewName('');
    setAddVisible(true);
  };

  const handleAddFloor = async () => {
    if (!newName.trim()) {
      Alert.alert('اسم مفقود', 'يرجى إدخال اسم الطابق.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('floors').insert({
      section_id: sectionId,
      name: newName.trim(),
    });
    setSubmitting(false);

    if (insertError) {
      Alert.alert('خطأ', insertError.message);
      return;
    }

    setAddVisible(false);
    refresh();
  };

  const openEditModal = (floor: (typeof section.floors)[number]) => {
    setEditingFloorId(floor.id);
    setEditName(floor.name);
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingFloorId) {
      Alert.alert('اسم مفقود', 'يرجى إدخال اسم الطابق.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase
      .from('floors')
      .update({ name: editName.trim() })
      .eq('id', editingFloorId);
    setSubmitting(false);

    if (updateError) {
      Alert.alert('خطأ', updateError.message);
      return;
    }

    setEditVisible(false);
    refresh();
  };

  const handleDeleteFloor = (floor: (typeof section.floors)[number]) => {
    Alert.alert(
      'حذف هذا الطابق؟',
      `سيتم حذف "${floor.name}" وجميع المنتجات الموجودة فيه نهائيًا.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await supabase.from('floors').delete().eq('id', floor.id);
            if (deleteError) {
              Alert.alert('خطأ', deleteError.message);
            } else {
              refresh();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-indigo-50 p-4">
      <FlatList
        data={section.floors}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-4"
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View className="gap-4">
            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-2xl text-left">الطوابق</Text>
              <Pressable onPress={() => router.back()} className="p-2">
                <ChevronLeft size={28} color="#4338ca" />
              </Pressable>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Package size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{totalItems}</Text>
                <Text className="text-slate-700 text-md text-left">إجمالي المنتجات</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{section.floors.length}</Text>
                <Text className="text-slate-700 text-md text-left">الطوابق</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const distinctProductCount = new Set(
            (item.stock_batches ?? []).map((batch) => batch.products?.name)
          ).size;

          return (
            <View className="rounded-xl overflow-hidden bg-white">
              <Link href={`/sections/${sectionId}/${item.id}`} asChild>
                <Pressable className="flex flex-row items-start justify-between px-4 py-5">
                  <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                    <View className="flex flex-col">
                      <Text className="text-lg font-medium text-left ">{item.name}</Text>
                      <Text className="text-sm text-slate-700 text-right">اضغط لمزيد من المعلومات</Text>
                    </View>
                    <View className="flex h-full flex-row items-center">
                      <Dot size={34} color="#64748b" />
                      <Text className="text-slate-700">{distinctProductCount} أدوية</Text>
                    </View>
                  </View>
                  <View className="w-[10%] h-full flex flex-row justify-end items-center">
                    <ChevronLeft size={26} color="#4338ca" />
                  </View>
                </Pressable>
              </Link>

              <View className="flex-row gap-2 px-4 pb-3">
                <Pressable
                  onPress={() => openEditModal(item)}
                  className="flex-row items-center gap-1 bg-slate-100 rounded-lg px-4 py-3"
                >
                  <Pencil size={14} color="#4338ca" />
                  <Text className="text-indigo-700 text-sm font-medium">تعديل</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteFloor(item)}
                  className="flex-row items-center gap-1 bg-slate-100 rounded-lg px-4 py-3"
                >
                  <Trash2 size={14} color="#dc2626" />
                  <Text className="text-red-600 text-sm font-medium">حذف</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
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
              <Text className="text-lg font-bold">طابق جديد</Text>
              <Pressable onPress={() => setAddVisible(false)}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">اسم الطابق</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newName}
                onChangeText={setNewName}
                placeholder="الطابق 4"
              />
            </View>

            <Pressable
              onPress={handleAddFloor}
              disabled={submitting}
              className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
            >
              <Text className="text-white font-semibold">{submitting ? 'جارٍ الإضافة...' : 'إضافة طابق'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold">تعديل الطابق</Text>
              <Pressable onPress={() => setEditVisible(false)}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="text-slate-500 text-xs text-right">اسم الطابق</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <Pressable
              onPress={handleSaveEdit}
              disabled={submitting}
              className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
            >
              <Text className="text-white font-semibold">{submitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}