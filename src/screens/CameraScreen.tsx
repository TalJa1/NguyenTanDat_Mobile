import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ScanStackParamList } from '../navigation/ScanStack';

const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

type Props = {
  navigation: NativeStackNavigationProp<ScanStackParamList, 'CameraMain'>;
};

type FlashMode = 'off' | 'on' | 'auto';

const FLASH_CYCLE: FlashMode[] = ['off', 'on', 'auto'];
const FLASH_ICONS: Record<FlashMode, string> = { off: '⚡', on: '🔆', auto: '✨' };
const FLASH_LABELS: Record<FlashMode, string> = { off: 'Tắt', on: 'Bật', auto: 'Tự động' };

export default function CameraScreen({ navigation }: Props) {
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturing, setCapturing] = useState(false);

  const isFocused = useIsFocused();
  const device = useCameraDevice(position);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const zoom = useSharedValue(1);
  const startZoom = useSharedValue(1);
  const minZoomSV = useSharedValue(1);
  const maxZoomSV = useSharedValue(5);

  useEffect(() => {
    if (device) {
      minZoomSV.value = device.minZoom;
      maxZoomSV.value = Math.min(device.maxZoom, 8);
      zoom.value = device.neutralZoom;
    }
  }, [device]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startZoom.value = zoom.value;
    })
    .onUpdate((e) => {
      const next = startZoom.value * e.scale;
      zoom.value = Math.min(Math.max(next, minZoomSV.value), maxZoomSV.value);
    });

  const cameraAnimatedProps = useAnimatedProps<any>(() => ({
    zoom: zoom.value,
  }));

  const cycleFlash = useCallback(() => {
    setFlash(f => {
      const idx = FLASH_CYCLE.indexOf(f);
      return FLASH_CYCLE[(idx + 1) % FLASH_CYCLE.length];
    });
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing) { return; }
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({ flash });
      const uri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
      navigation.navigate('OCRResult', { imageUri: uri });
    } catch {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    } finally {
      setCapturing(false);
    }
  }, [capturing, flash, navigation]);

  const handleGallery = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (res) => {
      if (res.assets?.[0]?.uri) {
        navigation.navigate('OCRResult', { imageUri: res.assets[0].uri! });
      }
    });
  }, [navigation]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Cần quyền truy cập camera</Text>
        <Text style={styles.permDesc}>
          Để quét và nhận diện văn bản, hãy cho phép ứng dụng sử dụng camera.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadText}>Đang khởi động camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Camera preview with pinch-to-zoom */}
      <GestureDetector gesture={pinchGesture}>
        <ReanimatedCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          photo={true}
          animatedProps={cameraAnimatedProps}
        />
      </GestureDetector>

      {/* Dim overlay top */}
      <View style={styles.topOverlay} pointerEvents="none" />

      {/* Top controls */}
      <SafeAreaView edges={['top']} style={styles.topControls}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.roundBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {position === 'back' && (
          <TouchableOpacity style={styles.flashBtn} onPress={cycleFlash}>
            <Text style={styles.flashIcon}>{FLASH_ICONS[flash]}</Text>
            <Text style={styles.flashLabel}>{FLASH_LABELS[flash]}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Focus frame hint */}
      <View style={styles.frameCentre} pointerEvents="none">
        <View style={styles.frameCornerTL} />
        <View style={styles.frameCornerTR} />
        <View style={styles.frameCornerBL} />
        <View style={styles.frameCornerBR} />
        <Text style={styles.frameHint}>Kéo để thu phóng</Text>
      </View>

      {/* Dim overlay bottom */}
      <View style={styles.bottomOverlay} pointerEvents="none" />

      {/* Bottom controls */}
      <SafeAreaView edges={['bottom']} style={styles.bottomControls}>
        <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
          <View style={styles.sideBtnCircle}>
            <Text style={{ fontSize: 24 }}>🖼️</Text>
          </View>
          <Text style={styles.sideBtnLabel}>Thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureBtn, capturing && styles.captureBtnActive]}
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.85}
        >
          {capturing
            ? <ActivityIndicator color="#1d4ed8" size="large" />
            : <View style={styles.captureInner} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => setPosition(p => p === 'back' ? 'front' : 'back')}
        >
          <View style={styles.sideBtnCircle}>
            <Text style={{ fontSize: 24 }}>🔄</Text>
          </View>
          <Text style={styles.sideBtnLabel}>Lật camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  center: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permIcon: { fontSize: 56, marginBottom: 16 },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  permDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  grantBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  grantBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadText: { color: '#6b7280', marginTop: 16, fontSize: 15 },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  flashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  flashIcon: { fontSize: 16 },
  flashLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },

  frameCentre: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameCornerTL: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 3,
  },
  frameCornerTR: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 3,
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 3,
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 3,
  },
  frameHint: {
    position: 'absolute',
    bottom: '27%',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    letterSpacing: 0.4,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 190,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 18,
  },
  sideBtn: { alignItems: 'center', gap: 6 },
  sideBtnCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sideBtnLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500' },
  captureBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnActive: { borderColor: 'rgba(255,255,255,0.5)' },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
});
