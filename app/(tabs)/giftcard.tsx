import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { GiftCard, useGiftCards } from '@/context/GiftCardContext';

export default function GiftCardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    addGiftCard, 
    markGiftCardAsUsed, 
    getActiveGiftCards, 
    sendGiftCard, 
    getSentGiftCards,
    getReceivedGiftCards
  } = useGiftCards();
  
  const [selectedCardType, setSelectedCardType] = useState('standard');
  const [amount, setAmount] = useState('25');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', or 'new'
  
  // Get different types of gift cards
  const activeGiftCards = getActiveGiftCards();
  const sentGiftCards = getSentGiftCards();
  const receivedGiftCards = getReceivedGiftCards();
  
  // Format expiry date string to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Get icon and color based on gift card type
  const getCardDetails = (card: GiftCard): { icon: any; color: string; label: string } => {
    switch(card.type) {
      case 'birthday':
        return {
          icon: 'gift-outline' as const,
          color: '#D6A87B',
          label: 'Birthday Gift'
        };
      case 'points':
        return {
          icon: 'star-outline' as const,
          color: '#9EBBBC',
          label: 'Points Reward'
        };
      default:
        return {
          icon: 'cafe-outline' as const,
          color: '#8E6E53',
          label: 'Gift Card'
        };
    }
  };
  
  const handleSendGiftCard = async () => {
    if (!recipientName || !recipientEmail) {
      Alert.alert('Missing Information', 'Please enter recipient name and email.');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    
    // Create expiry date (3 months from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);
    
    try {
      // Use the new sendGiftCard function
      const success = await sendGiftCard(
        recipientEmail,
        recipientName, 
        {
          type: 'regular',
          amount: Number(amount),
          message,
          expiryDate: expiryDate.toISOString(),
          used: false
        }
      );
      
      if (success) {
        Alert.alert(
          'Gift Card Sent!',
          `Your gift card of $${amount} has been sent to ${recipientName}.`,
          [{ text: 'OK', onPress: () => {
            // Reset form
            setRecipientName('');
            setRecipientEmail('');
            setMessage('');
            setAmount('25');
            // Switch to sent tab to show the card
            setActiveTab('sent');
          }}]
        );
      } else {
        Alert.alert('Error', 'There was a problem sending the gift card. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was a problem sending the gift card. Please try again.');
    }
  };
  
  const handleUseGiftCard = async (card: GiftCard) => {
    // Confirm the user wants to use this gift card
    Alert.alert(
      'Use Gift Card',
      `Apply your $${card.amount} gift card to your next purchase?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Now', 
          onPress: async () => {
            await markGiftCardAsUsed(card.id);
            // Navigate to menu or cart to apply the discount
            router.push('/cart');
          }
        }
      ]
    );
  };
  
  // Render the tab buttons at the top
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'received' && styles.activeTabButton]} 
        onPress={() => setActiveTab('received')}
      >
        <ThemedText style={[styles.tabButtonText, activeTab === 'received' && styles.activeTabButtonText]}>
          Received
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'sent' && styles.activeTabButton]} 
        onPress={() => setActiveTab('sent')}
      >
        <ThemedText style={[styles.tabButtonText, activeTab === 'sent' && styles.activeTabButtonText]}>
          Sent
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'new' && styles.activeTabButton]} 
        onPress={() => setActiveTab('new')}
      >
        <ThemedText style={[styles.tabButtonText, activeTab === 'new' && styles.activeTabButtonText]}>
          Send New
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
  
  // Render gift cards for a given list
  const renderGiftCardsList = (cards: GiftCard[], canUse: boolean = false) => {
    if (cards.length === 0) {
      return (
        <ThemedText style={styles.noCardsText}>
          {activeTab === 'received' 
            ? "You don't have any gift cards. Complete orders to earn points or check back on your birthday for special rewards!"
            : "You haven't sent any gift cards yet."}
        </ThemedText>
      );
    }
    
    return cards.map(card => {
      const cardDetails = getCardDetails(card);
      return (
        <View key={card.id} style={styles.giftCard}>
          <View style={styles.giftCardHeader}>
            <View>
              <ThemedText style={styles.giftCardType}>{cardDetails.label}</ThemedText>
              <ThemedText style={styles.giftCardValue}>${card.amount}</ThemedText>
            </View>
            <Ionicons name={cardDetails.icon} size={24} color={cardDetails.color} />
          </View>
          <View style={styles.giftCardDivider} />
          <View style={styles.giftCardInfo}>
            {card.from && (
              <ThemedText style={styles.giftCardFrom}>From: {card.from}</ThemedText>
            )}
            {card.to && activeTab === 'sent' && (
              <ThemedText style={styles.giftCardFrom}>To: {card.to}</ThemedText>
            )}
            <ThemedText style={styles.giftCardDate}>
              Valid until: {formatDate(card.expiryDate || card.expiresAt || '')}
            </ThemedText>
            {card.message && (
              <ThemedText style={styles.giftCardMessage}>"{card.message}"</ThemedText>
            )}
          </View>
          {canUse && !card.used && (
            <TouchableOpacity 
              style={styles.useButton}
              onPress={() => handleUseGiftCard(card)}
            >
              <ThemedText style={styles.useButtonText}>Use Card</ThemedText>
            </TouchableOpacity>
          )}
          {card.used && (
            <View style={styles.usedBadge}>
              <ThemedText style={styles.usedBadgeText}>Used</ThemedText>
            </View>
          )}
        </View>
      );
    });
  };
  
  // Render the form for sending a new gift card
  const renderSendForm = () => (
    <>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Send a Gift Card</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Share the joy of coffee with friends and family
        </ThemedText>
      </View>
      
      <View style={styles.cardSelectionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.cardOption, selectedCardType === 'standard' && styles.cardOptionSelected]} 
            onPress={() => {
              setSelectedCardType('standard');
              setAmount('25');
            }}
          >
            <View style={styles.cardPreview}>
              <Ionicons name="cafe" size={24} color="white" />
              <ThemedText style={styles.cardLabel}>Standard</ThemedText>
            </View>
            <ThemedText style={styles.cardPrice}>$25</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.cardOption, selectedCardType === 'birthday' && styles.cardOptionSelected]} 
            onPress={() => {
              setSelectedCardType('birthday');
              setAmount('50');
            }}
          >
            <View style={[styles.cardPreview, { backgroundColor: '#D6A87B' }]}>
              <Ionicons name="gift" size={24} color="white" />
              <ThemedText style={styles.cardLabel}>Birthday</ThemedText>
            </View>
            <ThemedText style={styles.cardPrice}>$50</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.cardOption, selectedCardType === 'thankyou' && styles.cardOptionSelected]} 
            onPress={() => {
              setSelectedCardType('thankyou');
              setAmount('75');
            }}
          >
            <View style={[styles.cardPreview, { backgroundColor: '#9EBBBC' }]}>
              <Ionicons name="star" size={24} color="white" />
              <ThemedText style={styles.cardLabel}>Thank You</ThemedText>
            </View>
            <ThemedText style={styles.cardPrice}>$75</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.cardOption, selectedCardType === 'custom' && styles.cardOptionSelected]} 
            onPress={() => {
              setSelectedCardType('custom');
              setAmount('');
            }}
          >
            <View style={[styles.cardPreview, { backgroundColor: '#B49A81' }]}>
              <Ionicons name="heart" size={24} color="white" />
              <ThemedText style={styles.cardLabel}>Custom</ThemedText>
            </View>
            <View style={styles.customAmountContainer}>
              <ThemedText style={styles.dollarSign}>$</ThemedText>
              <TextInput
                style={styles.customAmountInput}
                placeholder="Amount"
                placeholderTextColor="#B5A99A"
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Recipient's Name</ThemedText>
          <TextInput 
            style={styles.input}
            placeholder="Enter their name"
            placeholderTextColor="#B5A99A"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email Address</ThemedText>
          <TextInput 
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#B5A99A"
            keyboardType="email-address"
            value={recipientEmail}
            onChangeText={setRecipientEmail}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Personal Message</ThemedText>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Add a personal message"
            placeholderTextColor="#B5A99A"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendGiftCard}
        >
          <ThemedText style={styles.sendButtonText}>Send Gift Card</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Gift Cards</ThemedText>
      </View>
      
      {renderTabButtons()}
      
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'received' && (
          <View style={styles.myCardsContainer}>
            <ThemedText style={styles.sectionTitle}>Your Gift Cards</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Gift cards that have been sent to you
            </ThemedText>
            {renderGiftCardsList(receivedGiftCards, true)}
          </View>
        )}
        
        {activeTab === 'sent' && (
          <View style={styles.myCardsContainer}>
            <ThemedText style={styles.sectionTitle}>Sent Gift Cards</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Gift cards you've sent to others
            </ThemedText>
            {renderGiftCardsList(sentGiftCards)}
          </View>
        )}
        
        {activeTab === 'new' && renderSendForm()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F4EDE4',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4EDE4',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#8E6E53',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#B5A99A',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#8E6E53',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 10,
  },
  cardSelectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardOption: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  cardOptionSelected: {
    transform: [{ scale: 1.05 }],
  },
  cardPreview: {
    width: 120,
    height: 80,
    backgroundColor: '#8E6E53',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: 'white',
    marginTop: 4,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6D9CC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#3C2A15',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  myCardsContainer: {
    padding: 20,
  },
  giftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  giftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  giftCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  giftCardDivider: {
    height: 1,
    backgroundColor: '#E6D9CC',
    marginBottom: 12,
  },
  giftCardInfo: {
    marginBottom: 16,
  },
  giftCardFrom: {
    fontSize: 16,
    color: '#3C2A15',
  },
  giftCardDate: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 4,
  },
  useButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customAmountInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    padding: 4,
    minWidth: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E6D9CC',
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginRight: 4,
  },
  giftCardType: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 4,
  },
  giftCardMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#8E6E53',
    marginTop: 8,
  },
  noCardsText: {
    fontSize: 16,
    color: '#8E6E53',
    textAlign: 'center',
    lineHeight: 22,
    padding: 20,
  },
  usedBadge: {
    backgroundColor: '#E6D9CC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  usedBadgeText: {
    color: '#8E6E53',
    fontSize: 14,
    fontWeight: '600',
  },
});
