import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/context/CartContext';

export default function ScanTableScreen() {
  const router = useRouter();
  const { setTableInfo } = useCart();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [tableCode, setTableCode] = useState('');
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // If directScan param is present, immediately show the scanner
      if (params.directScan === 'true') {
        setShowScanner(true);
      }
    })();
  }, [params]);

  const handleContinue = () => {
    if (!tableCode.trim()) {
      Alert.alert('Missing Information', 'Please scan or enter a table code to continue.');
      return;
    }
    
    // Set the table info in the cart context
    setTableInfo({
      tableNumber: tableCode,
      scannedAt: new Date()
    });
    
    // Navigate to the order tab
    router.push('/(tabs)/order');
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setShowScanner(false);
    setTableCode(data);
    
    // Immediately set the table info and navigate to the order tab
    setTableInfo({
      tableNumber: data,
      scannedAt: new Date()
    });
    
    // Navigate to the order tab
    router.replace('/(tabs)/order');
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        setShowScanner(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to use the barcode scanner.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const requestCameraPermission = async () => {
    setScanned(false);
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        setShowScanner(true);
      } else {
        const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
        if (newStatus === 'granted') {
          setHasPermission(true);
          setShowScanner(true);
        } else {
          Alert.alert(
            'Camera Permission Required',
            'Please grant camera permission to use the barcode scanner.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  if (showScanner && hasPermission) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'none',
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }} 
        />
        <CameraView
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'code39', 'code93', 'code128', 'ean13', 'ean8', 'upc_a', 'upc_e', 'aztec'],
          }}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowScanner(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />
            </View>
            <ThemedText style={styles.scanText}>Scan table QR code</ThemedText>
          </View>
        </CameraView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Scan Table',
          headerStyle: {
            backgroundColor: '#F4EDE4',
          },
          headerTintColor: '#3C2A15',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <ThemedView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.illustrationBackground} />
            <View style={styles.illustration} />
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.title}>Start Your Order</ThemedText>
            <ThemedText style={styles.subtitle}>Scan or enter your table code to begin</ThemedText>

            <ThemedText style={styles.label}>Table Code</ThemedText>
            <View style={styles.codeContainer}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={tableCode}
                onChangeText={setTableCode}
                placeholder="Scan or enter table code"
                placeholderTextColor="#B5A99A"
              />
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={requestCameraPermission}
              >
                <Ionicons name="qr-code-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, !tableCode.trim() && styles.disabledButton]} 
              onPress={handleContinue}
              disabled={!tableCode.trim()}
            >
              <ThemedText style={styles.buttonText}>Continue to Order</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={18} color="#8E6E53" />
              <ThemedText style={styles.helpText}>Help with table codes</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 180,
    position: 'relative',
  },
  illustrationBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F4EDE4',
    position: 'absolute',
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8E6E53',
    position: 'absolute',
  },
  form: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3C2A15',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: '#59442B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6D9CC',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#3C2A15',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  codeInput: {
    flex: 1,
    marginRight: 10,
  },
  scanButton: {
    backgroundColor: '#8E6E53',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#8E6E53',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E6D9CC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  helpText: {
    color: '#8E6E53',
    marginLeft: 6,
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 20,
  },
  cornerBracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 