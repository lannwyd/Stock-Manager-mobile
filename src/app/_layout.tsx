import { Stack } from "expo-router";
import { WarehouseProvider } from "../context/warehouseContext";
import { I18nManager } from 'react-native';
import "../../global.css";

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function RootLayout() {
  return (
    <WarehouseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WarehouseProvider>
  );
}