import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
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

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      return;
    }

    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      type: 'text',
    });

    setInputText('');

    setTimeout(() => {
      addMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Tôi đã nhận được câu hỏi của bạn: "${trimmed}". Đây là kết quả phân tích sơ bộ của tôi.`,
        type: 'text',
      });
    }, 400);
  };

  const handleMediaOption = (type: 'gallery' | 'camera') => {
    setShowMediaOptions(false);

    const sourceText = type === 'gallery' ? 'Thư viện' : 'Camera';
    addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `📷 Ảnh từ ${sourceText}`,
      type: 'image',
    });

    setTimeout(() => {
      addMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Đã nhận ảnh từ ${sourceText}. Tôi đang phân tích và sẽ trả kết quả ngay.`,
        type: 'text',
      });
    }, 400);

    Alert.alert('Tính năng ảnh', `Chức năng ${sourceText} đã được kích hoạt. Bạn có thể tích hợp thư viện ảnh hoặc camera tại đây.`);
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
              ]}
            >
              <Text style={[styles.messageText, item.sender === 'user' && styles.userText]}>
                {item.text}
              </Text>
            </View>
          )}
        />
      </ImageBackground>

      <View style={styles.inputBar}>
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
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1f2937',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
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
