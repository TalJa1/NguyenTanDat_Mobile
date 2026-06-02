/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppHeader from '../components/AppHeader';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {getStorageValue} from '../storage/storage';
import axios from 'axios';
import { SERVER_URL } from '@env';
import RNFS from 'react-native-fs';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  imageUri?: string;
  type?: 'text' | 'image';
};

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((dots.length - i - 1) * 150),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={typingStyles.bubble}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[typingStyles.dot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderRadius: 22,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
    marginHorizontal: 3,
  },
});

function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadUserName = async () => {
      const userName = (await getStorageValue('@user_name')) || 'bạn';
      console.log('AssistantScreen: Loaded userName from storage:', userName);
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Xin chào ${userName} ! Tôi là trợ lý quan trắc nước. Nhập câu hỏi hoặc gửi ảnh để tôi hỗ trợ bạn.`,
        },
      ]);
    };
    loadUserName();
  }, []);
  const [inputText, setInputText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const animationValue = React.useRef(new Animated.Value(0)).current;

  const openMediaOptions = () => {
    animationValue.setValue(0);
    setIsModalVisible(true);
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeMediaOptions = () => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !attachedImageUri) {
      return;
    }

    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed || undefined,
      imageUri: attachedImageUri || undefined,
      type: attachedImageUri ? 'image' : 'text',
    });

    const currentImage = attachedImageUri;
    setInputText('');
    setAttachedImageUri(null);
    setIsBotTyping(true);

    try {
      // Convert image to base64 if present
      let imageBase64: string | undefined;
      if (currentImage) {
        const cleanPath = currentImage.replace('file://', '');
        imageBase64 = await RNFS.readFile(cleanPath, 'base64');
      }

      const body: { message: string; image_url?: string } = {
        message: trimmed || '',
      };
      if (imageBase64) {
        body.image_url = `data:image/jpeg;base64,${imageBase64}`;
      }

      const { data } = await axios.post<{ reply: string }>(
        SERVER_URL,
        body,
        { headers: { 'Content-Type': 'application/json' } },
      );

      const replyText = data.reply ?? 'Tôi không hiểu yêu cầu của bạn.';

      addMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        type: 'text',
      });
    } catch (error) {
      console.log('Error communicating with server:', error);
      addMessage({
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Xin lỗi, không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        type: 'text',
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const requestAndroidPermission = async (type: 'gallery' | 'camera'): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (type === 'camera') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền truy cập Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh mẫu nước.',
          buttonPositive: 'Đồng ý',
          buttonNegative: 'Từ chối',
        },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const permission =
        parseInt(String(Platform.Version), 10) >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const result = await PermissionsAndroid.request(permission, {
        title: 'Quyền truy cập Thư viện',
        message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh mẫu nước.',
        buttonPositive: 'Đồng ý',
        buttonNegative: 'Từ chối',
      });
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const handleMediaOption = async (type: 'gallery' | 'camera') => {
    closeMediaOptions();

    const granted = await requestAndroidPermission(type);
    if (!granted) {
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      includeBase64: false,
      saveToPhotos: false,
    };

    const response =
      type === 'gallery'
        ? await launchImageLibrary(options)
        : await launchCamera({ ...options, cameraType: 'back' });

    if (response.didCancel || response.errorCode) {
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    setAttachedImageUri(asset.uri);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppHeader title="Trợ lý AI" subtitle="Hỏi đáp về chất lượng nước" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ImageBackground
        source={require('../assets/ai_background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isBotTyping ? <TypingIndicator /> : null}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.botBubble,
                item.imageUri && !item.text ? styles.imageBubble : undefined,
              ]}
            >
              {item.imageUri && (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              {item.text && (
                <Text
                  style={[
                    styles.messageText,
                    item.sender === 'user' && styles.userText,
                    item.imageUri ? styles.textBelowImage : undefined,
                  ]}
                >
                  {item.text}
                </Text>
              )}
            </View>
          )}
        />
      </ImageBackground>

      <View style={styles.inputBar}>
        {attachedImageUri && (
          <View style={styles.attachmentPreview}>
            <Image
              source={{ uri: attachedImageUri }}
              style={styles.attachmentThumb}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.attachmentRemove}
              onPress={() => setAttachedImageUri(null)}
            >
              <Icon name="close" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={openMediaOptions}
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn của bạn"
            placeholderTextColor="#9ca3af"
            style={styles.textInput}
            multiline
          />

          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={22} color="#2563eb" />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeMediaOptions}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMediaOptions}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: animationValue,
                transform: [
                  {
                    translateY: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [280, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Chọn nguồn ảnh</Text>
            <Pressable
              style={styles.modalOption}
              onPress={() => handleMediaOption('gallery')}
            >
              <Text style={styles.modalOptionText}>Chọn từ thư viện</Text>
            </Pressable>
            <Pressable
              style={styles.modalOption}
              onPress={() => handleMediaOption('camera')}
            >
              <Text style={styles.modalOptionText}>Chụp ảnh</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 250, 255, 0.42)',
  },
  flatList: {
    flex: 1,
  },
  chatContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 24,
  },
  messageBubble: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#1d4ed8',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111827',
  },
  userText: {
    color: '#ffffff',
  },
  imageBubble: {
    padding: 4,
  },
  textBelowImage: {
    marginTop: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
  },
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'column',
    shadowColor: '#1f2937',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  attachmentThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  attachmentRemove: {
    position: 'absolute',
    top: -6,
    left: 52,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  plusSign: {
    fontSize: 28,
    color: '#1d4ed8',
    lineHeight: 30,
  },
  textInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    marginLeft: 10,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1f2937',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalOption: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalOptionText: {
    color: '#111827',
    fontSize: 15,
  },
});

export default AssistantScreen;
