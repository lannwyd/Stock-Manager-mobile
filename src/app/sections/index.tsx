import { useWarehouseContext } from '@/context/warehouseContext';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronLeft, Dot, Layers, Package, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLOR_OPTIONS = [
  { label: 'أبيض', value: 'bg-white-100' },
  { label: 'برتقالي', value: 'bg-orange-100' },
  { label: 'أصفر', value: 'bg-yellow-100' },
  { label: 'أزرق', value: 'bg-blue-100' },
  { label: 'أخضر', value: 'bg-green-100' },
  { label: 'وردي', value: 'bg-pink-100' },
  { label: 'بنفسجي', value: 'bg-purple-100' },
  { label: 'أحمر', value: 'bg-red-100' },
  { label: 'رمادي', value: 'bg-slate-200' },
  { label: 'سماوي', value: 'bg-cyan-100' },
  { label: 'ليموني', value: 'bg-lime-100' },
];

export default function Sections() {
  const { selectedWarehouse, loading, error, refresh } = useWarehouseContext();
  const router = useRouter();

  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(COLOR_OPTIONS[0].value);

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

  const sections = selectedWarehouse?.sections ?? [];

  const totalProducts = new Set(
    sections.flatMap((section) =>
      (section.floors ?? []).flatMap((floor) =>
        (floor.stock_batches ?? []).map((batch) => batch.products?.name)
      )
    )
  ).size;

  const openAddModal = () => {
    setNewName('');
    setNewColor(COLOR_OPTIONS[0].value);
    setAddVisible(true);
  };

  const handleAddSection = async () => {
    if (!newName.trim()) {
      Alert.alert('اسم مفقود', 'يرجى إدخال اسم القسم.');
      return;
    }
    if (!selectedWarehouse) return;

    setSubmitting(true);
    const { error: insertError } = await supabase.from('sections').insert({
      warehouse_id: selectedWarehouse.id,
      name: newName.trim(),
      color: newColor,
    });
    setSubmitting(false);

    if (insertError) {
      Alert.alert('خطأ', insertError.message);
      return;
    }

    setAddVisible(false);
    refresh();
  };

  const openEditModal = (item: (typeof sections)[number]) => {
    setEditingSectionId(item.id);
    setEditName(item.name);
    setEditColor(item.color ?? COLOR_OPTIONS[0].value);
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingSectionId) {
      Alert.alert('اسم مفقود', 'يرجى إدخال اسم القسم.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase
      .from('sections')
      .update({ name: editName.trim(), color: editColor })
      .eq('id', editingSectionId);
    setSubmitting(false);

    if (updateError) {
      Alert.alert('خطأ', updateError.message);
      return;
    }

    setEditVisible(false);
    refresh();
  };

  const handleDeleteSection = (item: (typeof sections)[number]) => {
    Alert.alert(
      'حذف هذا القسم؟',
      `سيتم حذف "${item.name}" وجميع الطوابق والمنتجات الموجودة بداخله نهائيًا.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await supabase.from('sections').delete().eq('id', item.id);
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
        data={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-4"
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View className="gap-4">
            <View className="flex-row items-center justify-between mt-2 px-1">
              <Text className="font-semibold text-2xl text-left">الأقسام</Text>
              <Pressable onPress={() => router.back()} className="p-2">
                <ChevronLeft size={28} color="#4338ca" />
              </Pressable>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white rounded-xl border border-slate-200 py-4 px-6">
                <Package size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{totalProducts}</Text>
                <Text className="text-slate-700 text-md text-left">إجمالي الأدوية</Text>
              </View>
              <View className="flex-1 bg-white rounded-xl border border-slate-200 py-4 px-6">
                <Layers size={20} color="#4338ca" />
                <Text className="text-2xl font-bold mt-2 text-left">{sections.length}</Text>
                <Text className="text-slate-700 text-md text-left">الأقسام</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const distinctProductCount = new Set(
            (item.floors ?? []).flatMap((floor) =>
              (floor.stock_batches ?? []).map((batch) => batch.products?.name)
            )
          ).size;

          return (
            <View className={`rounded-xl overflow-hidden ${item.color ?? 'bg-slate-100'}`}>
              <Link href={`/sections/${item.id}`} asChild>
                <Pressable className="flex flex-row items-start justify-between px-4 py-5">
                  <View className="w-[90%] flex flex-row justify-between items-center gap-2">
                    <View className="flex flex-col">
                      <Text className="text-lg font-medium text-left">{item.name}</Text>
                      <Text className="text-sm text-slate-700 text-right">اضغط لمزيد من المعلومات</Text>
                    </View>
                    <View className="flex h-full flex-row items-center">
                      <Dot size={34} color="#64748b" />
                      <Text className="text-slate-800">{distinctProductCount} دواء</Text>
                    </View>
                  </View>
                  <View className="w-[10%] h-full flex flex-row justify-end items-center">
                    <ChevronLeft size={26} color="#4338ca" />
                  </View>
                </Pressable>
              </Link>

              <View className="flex-row gap-2 px-4 pb-3 justify-end ">
                <Pressable
                  onPress={() => openEditModal(item)}
                  className="flex-row items-center gap-1 bg-white/60 rounded-lg px-4 py-3"
                >
                  <Pencil size={14} color="#4338ca" />
                  <Text className="text-indigo-700 text-sm font-semibold">تعديل</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteSection(item)}
                  className="flex-row items-center gap-1 bg-white/60 rounded-lg px-4 py-3"
                >
                  <Trash2 size={14} color="#dc2626" />
                  <Text className="text-red-600 text-sm font-semibold">حذف</Text>
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
              <Text className="text-xl font-bold">قسم جديد</Text>
              <Pressable onPress={() => setAddVisible(false)}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="text-slate-700 text-md text-left">اسم القسم</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={newName}
                onChangeText={setNewName}
                placeholder="الرف ..."
              />
            </View>

            <View className="gap-2">
              <Text className="text-slate-700 text-md text-left"> اللون ( اختياري ) </Text>
              <View className="flex-row flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => setNewColor(c.value)}
                    className={`w-14 h-14 items-center justify-center rounded-lg border-2 ${c.value} ${newColor === c.value ? 'border-indigo-600' : 'border-transparent'
                      }`}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleAddSection}
              disabled={submitting}
              className="bg-indigo-700 rounded-xl py-3 items-center mt-2"
            >
              <Text className="text-white font-semibold">{submitting ? 'جارٍ الإضافة...' : 'إضافة قسم'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">تعديل القسم</Text>
              <Pressable onPress={() => setEditVisible(false)}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="text-slate-700 text-md text-left">اسم القسم</Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-3 py-2 text-base text-right"
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View className="gap-2">
              <Text className="text-slate-700 text-md text-left">اللون ( اختياري ) </Text>
              
              <View className="flex-row flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => setEditColor(c.value)}
                    className={`w-14 h-14 items-center justify-center rounded-lg border-2 ${c.value} ${editColor === c.value ? 'border-indigo-600' : 'border-transparent'
                      }`}
                  />
                ))}
              </View>
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