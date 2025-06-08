import { GoogleGenerativeAI } from "@google/generative-ai";
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';

// Coffee shop business information for context
const businessInfo = `
General Business Information:
Business Name: BrewArt Coffee
Website: www.brewartcoffee.com

Return Policy:
We do not accept returns on food and beverage items.
Gift cards and merchandise can be returned within 14 days of purchase with receipt.

Support Email: support@brewartcoffee.com

Store Location:
Address: 123 Coffee Avenue, City Center
Phone: +1 555-123-4567
Email: hello@brewartcoffee.com
Opening Hours:
Monday to Friday: 6:00 AM to 8:00 PM
Saturday & Sunday: 7:00 AM to 9:00 PM

Menu Information:
We serve specialty coffee, tea, pastries, breakfast items, and lunch options.
Our signature drinks include Caramel Macchiato, Iced Mocha, and Matcha Latte.
We offer dairy alternatives including oat, almond, and soy milk.
All pastries are baked fresh daily.

FAQs:
Do you have Wi-Fi?
Yes, we offer free Wi-Fi to all customers.

Do you cater for events?
Yes, we offer catering services with 48 hours notice.

Are your coffee beans ethically sourced?
Yes, all our beans are ethically sourced and fair trade certified.

Do you have gluten-free options?
Yes, we have several gluten-free pastry options.

Tone Instructions:
Be warm, friendly and conversational.
Provide helpful information about our menu, location, and services.
If you don't know an answer, suggest contacting the store directly.
`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// To match the format from main.js
interface ChatHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [model, setModel] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Initialize Google Generative AI
  useEffect(() => {
    try {
      // Load API Key from environment variables
      const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
      if (!API_KEY) {
        // Handle the error appropriately - maybe show an alert and disable chat
        console.error("API key is missing. Please set EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY in your .env file.");
        Alert.alert("Configuration Error", "Chatbot API key is missing. Please contact support.");
        // Optionally return or disable functionality
        return; 
      }
      const generativeAI = new GoogleGenerativeAI(API_KEY);
      const genModel = generativeAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: businessInfo
      });
      
      setGenAI(generativeAI);
      setModel(genModel);
      
      // Welcome message
      setMessages([
        { 
          id: Date.now().toString(), 
          text: "Welcome to BrewArt! I'm your virtual barista. How can I help you today?", 
          sender: 'bot' 
        }
      ]);
    } catch (error) {
      console.error("Failed to initialize AI:", error);
      Alert.alert(
        "Connection Error", 
        "Could not connect to AI assistant. Please try again later."
      );
    }
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSend = async () => {
    const userMessage = inputText.trim();
    if (!userMessage || !model) return;

    // Add user message to the chat
    const newUserMessage: Message = { 
      id: Date.now().toString(), 
      text: userMessage, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Update chat history with user message
    const userChatEntry: ChatHistory = {
      role: 'user',
      parts: [{ text: userMessage }]
    };
    
    const updatedHistory = [...chatHistory, userChatEntry];
    setChatHistory(updatedHistory);

    try {
      // Start a new chat with history
      const chat = model.startChat({
        history: updatedHistory,
      });
      
      // Create a placeholder for the bot response
      const botResponseId = Date.now() + 1;
      setMessages(prev => [
        ...prev, 
        { id: botResponseId.toString(), text: 'Thinking...', sender: 'bot' }
      ]);
      
      // Use non-streaming approach instead of streaming to avoid pipeThrough errors
      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();
      
      // Update the message with the complete response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botResponseId.toString() 
            ? { ...msg, text: responseText } 
            : msg
        )
      );
      
      // Add the bot response to chat history
      const botChatEntry: ChatHistory = {
        role: 'model',
        parts: [{ text: responseText }]
      };
      
      setChatHistory([...updatedHistory, botChatEntry]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.", 
        sender: 'bot' 
      };
      setMessages(prev => prev.map(msg => 
        msg.text === 'Thinking...' && msg.sender === 'bot' 
          ? errorResponse 
          : msg
      ));
    } finally {
      setIsLoading(false);

      // Scroll to bottom after messages update
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'BrewArt AI Barista',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShown: true,
        }}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.chatContainer}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.messagesScrollContainer} 
            onPress={dismissKeyboard}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={[
                styles.messagesContentContainer,
                keyboardVisible && styles.messagesContentWithKeyboard
              ]}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {messages.map((msg: Message) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userMessage : styles.botMessage
                  ]}
                >
                  <ThemedText 
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userMessageText : styles.botMessageText
                    ]}
                  >
                    {msg.text}
                  </ThemedText>
                </View>
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#8E6E53" />
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>

          <View style={[
            styles.inputContainer, 
            keyboardVisible && styles.inputContainerWithKeyboard
          ]}>
            <TextInput
              style={[styles.input, { maxHeight: 100 }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask BrewArt AI..."
              placeholderTextColor="#B5A99A"
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]} 
              onPress={handleSend} 
              disabled={isLoading || !inputText.trim()}
            >
              <Image source={require('@/assets/images/send-icon.png')} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messagesScrollContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  messagesContentWithKeyboard: {
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#8E6E53', // User message color (app primary)
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#F4EDE4', // Bot message color (app secondary)
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF', // White text for user messages
  },
  botMessageText: {
    color: '#3C2A15', // Dark text for bot messages
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8DED0', // Subtle border color
    backgroundColor: '#F4EDE4', // Input area background
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  inputContainerWithKeyboard: {
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10, // Adjust for multiline
    fontSize: 16,
    marginRight: 10,
    color: '#3C2A15',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8E6E53', // Match user message bubble color
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B5A99A', // Lighter color when disabled
    opacity: 0.7,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF', // White icon
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    marginLeft: 15, // Align with bot messages
    marginTop: 5,
  },
});