import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  ciphertext: string;
  nonce: string;
  key_id: string;
  message_type: 'text' | 'product' | 'image' | 'system';
  metadata?: any;
  created_at: string;
  delivered_to: string[];
  read_by: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  title?: string;
  channel_type: 'direct' | 'group' | 'creator' | 'vendor';
  encryption: {
    type: string;
    key_id: string;
  };
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = 'current-user'; // TODO: Get from auth context

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [id]);

  const loadConversation = async () => {
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/dm/conversations/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      } else {
        console.error('Failed to load conversation');
        Alert.alert('Error', 'Failed to load conversation');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/dm/conversations/${id}/messages`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const wsUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';
      const socket = new WebSocket(`${wsUrl}/api/dm/ws/${id}?token=${currentUserId}`);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        wsRef.current = socket;
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (id) setupWebSocket();
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'message.new':
        const newMessage = data.data.message;
        setMessages(prev => [...prev, newMessage]);
        break;
      
      case 'typing':
        const { user_id, state } = data.data;
        if (user_id !== currentUserId) {
          if (state === 'start') {
            setTypingUsers(prev => [...prev.filter(id => id !== user_id), user_id]);
          } else {
            setTypingUsers(prev => prev.filter(id => id !== user_id));
          }
        }
        break;
      
      case 'receipt.read':
        // Update message read status
        const { message_id, user_id: readUser } = data.data;
        setMessages(prev => prev.map(msg => 
          msg.id === message_id 
            ? { ...msg, read_by: [...msg.read_by, readUser] }
            : msg
        ));
        break;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !conversation) return;

    setSending(true);
    
    try {
      // For demo purposes, we'll send plain text (in production, encrypt on client)
      const messageData = {
        type: 'message.send',
        conversation_id: id,
        ciphertext: btoa(newMessage), // Base64 encode as demo encryption
        nonce: btoa(Math.random().toString(36)), // Random nonce for demo
        key_id: conversation.encryption.key_id,
        message_type: 'text'
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send via WebSocket
        wsRef.current.send(JSON.stringify(messageData));
      } else {
        // Fallback to HTTP
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/dm/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: id,
            ciphertext: messageData.ciphertext,
            nonce: messageData.nonce,
            key_id: messageData.key_id,
            message_type: 'text'
          })
        });

        if (response.ok) {
          const message = await response.json();
          setMessages(prev => [...prev, message]);
        }
      }

      setNewMessage('');
      stopTyping();
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startTyping = () => {
    if (!typing && wsRef.current?.readyState === WebSocket.OPEN) {
      setTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: id,
        state: 'start'
      }));
    }

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (typing && wsRef.current?.readyState === WebSocket.OPEN) {
      setTyping(false);
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: id,
        state: 'stop'
      }));
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_id === currentUserId;
    const showTimestamp = index === 0 || 
      new Date(item.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 5 * 60 * 1000;

    // Decrypt message for display (demo - in production, decrypt properly)
    const decryptedText = item.ciphertext ? atob(item.ciphertext) : 'Encrypted message';

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        {showTimestamp && (
          <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
        )}
        
        <View style={[styles.messageBubble, isOwn ? styles.ownMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {decryptedText}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
              {formatTime(item.created_at)}
            </Text>
            
            {isOwn && (
              <View style={styles.messageStatus}>
                <Ionicons 
                  name={item.read_by.length > 1 ? "checkmark-done" : "checkmark"} 
                  size={12} 
                  color={item.read_by.length > 1 ? "#D4AF37" : "#666"} 
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {conversation?.title || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {conversation?.participants.length} participant{conversation && conversation.participants.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              if (text.length > 0) {
                startTyping();
              } else {
                stopTyping();
              }
            }}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          
          <TouchableOpacity
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Ionicons name="send" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 16,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  otherMessageTime: {
    color: '#666',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});