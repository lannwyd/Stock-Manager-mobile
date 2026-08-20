import { Stack } from "expo-router";
import { WarehouseProvider } from "../context/warehouseContext";
import "../../global.css"

export default function RootLayout() {
  return (
    <WarehouseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WarehouseProvider>
  );
}
