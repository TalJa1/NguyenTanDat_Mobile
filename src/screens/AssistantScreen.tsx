import React, { useState } from 'react';
import {
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  imageUri?: string;
  type?: 'text' | 'image';
};

const initialMessages: Message[] = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Xin chào! Tôi là trợ lý quan trắc nước. Nhập câu hỏi hoặc gửi ảnh để tôi hỗ trợ bạn.',
  },
];

function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
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

    setInputText('');
    setAttachedImageUri(null);

    const replyText = attachedImageUri && trimmed
      ? `Đã nhận ảnh và câu hỏi của bạn: "${trimmed}". Tôi đang phân tích và sẽ trả kết quả ngay.`
      : attachedImageUri
      ? 'Đã nhận ảnh của bạn. Tôi đang phân tích và sẽ trả kết quả ngay.'
      : `Tôi đã nhận được câu hỏi của bạn: "${trimmed}". Đây là kết quả phân tích sơ bộ của tôi.`;

    setTimeout(() => {
      addMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        type: 'text',
      });
    }, 400);
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
    setShowMediaOptions(false);

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
    <KeyboardAvoidingView
      style={styles.container}
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
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            onPress={() => setShowMediaOptions(true)}
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
        visible={showMediaOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMediaOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMediaOptions(false)}>
          <View style={styles.modalContent}>
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
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
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
