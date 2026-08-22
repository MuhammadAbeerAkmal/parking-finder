import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { config } from './src/config';

type RootStackParamList = {
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MapScreen() {
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);

  const requestLocation = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result.status);
  };

  useEffect(() => {
    void requestLocation();
  }, []);

  if (permission === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.eyebrow}>PARKING FINDER</Text>
        <Text style={styles.title}>Finding your starting point...</Text>
      </View>
    );
  }

  if (permission !== Location.PermissionStatus.GRANTED) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.permissionPanel}>
          <Text style={styles.eyebrow}>LOCATION NEEDED</Text>
          <Text style={styles.title}>See parking around you</Text>
          <Text style={styles.body}>
            Allow location access to center the map near your current position.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => void requestLocation()}>
            <Text style={styles.primaryButtonLabel}>Allow location</Text>
          </Pressable>
          <Text style={styles.apiLabel}>API: {config.apiUrl}</Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid} />
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText}>MAP PLACEHOLDER</Text>
          <Text style={styles.mapBadgeSubtext}>Your location is ready</Text>
        </View>
        <View style={styles.locationDot} />
      </View>
      <View style={styles.bottomBar}>
        <Text style={styles.bottomTitle}>Parking Finder</Text>
        <Text style={styles.bottomBody}>Street-level parking data will appear here.</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Parking Finder' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f5ef',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f5ef',
    padding: 24,
  },
  permissionPanel: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  eyebrow: {
    color: '#d05a3b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  title: {
    color: '#1d2925',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 12,
  },
  body: {
    color: '#58635d',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1d2925',
    borderRadius: 8,
    padding: 16,
  },
  primaryButtonLabel: {
    color: '#fffdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  apiLabel: {
    color: '#8b938d',
    fontSize: 12,
    marginTop: 16,
  },
  mapPlaceholder: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#dce4dc',
    opacity: 0.8,
  },
  mapBadge: {
    alignSelf: 'center',
    backgroundColor: '#fffdf8',
    borderRadius: 8,
    elevation: 2,
    marginTop: '45%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#1d2925',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  mapBadgeText: {
    color: '#1d2925',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mapBadgeSubtext: {
    color: '#58635d',
    fontSize: 14,
    marginTop: 5,
  },
  locationDot: {
    backgroundColor: '#d05a3b',
    borderColor: '#fffdf8',
    borderRadius: 12,
    borderWidth: 4,
    height: 24,
    left: '50%',
    position: 'absolute',
    top: '50%',
    width: 24,
  },
  bottomBar: {
    backgroundColor: '#fffdf8',
    padding: 20,
  },
  bottomTitle: {
    color: '#1d2925',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomBody: {
    color: '#58635d',
    fontSize: 14,
    marginTop: 4,
  },
});
