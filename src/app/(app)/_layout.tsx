/**
 * App Group Layout (Main Navigation)
 */

import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="vaults"
        options={{
          title: 'My Vaults',
          headerRight: () => null,
        }}
      />
      <Stack.Screen
        name="vault/[id]"
        options={{
          title: 'Vault Items',
        }}
      />
      <Stack.Screen
        name="vault/create"
        options={{
          title: 'Create Vault',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="item/create"
        options={{
          title: 'Add Item',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="item/[id]"
        options={{
          title: 'Item Details',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
}
