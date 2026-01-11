import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chatbot
const Chatbot_BACKEND_URL = __DEV__ 
  ? 'http://192.168.101.5:3000'  
  : 'https://your-production-url.com';

//save histroty chat
let conversationHistory = [];

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState('Chatbot'); 
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    //welcome message
    const welcomeMessage = {
      id: '1',
      text: 'Hello! I am an AI assistant for child malnutrition consultation.Please ask about stunting, wasting, severe malnutrition, MUAC, or child nutrition care.',
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  //Save messages to AsyncStorage
  const saveMessages = async (msgs) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  //Load messages from AsyncStorage
  const loadMessages = async () => {
    try {
      const saved = await AsyncStorage.getItem('chatMessages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  //Call Chatbot API
  const sendToChatbot = async (message) => {
    try {
      console.log('Calling Chatbot API...');
      
      const response = await fetch(`${Chatbot_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: conversationHistory.slice(-6) //Last 3 exchanges for context
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      //Update conversation history
      conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.message }
      );
      
      //Keep only last 10 exchanges
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
      
      return {
        text: data.message,
        isEmergency: data.isEmergency || false,
        success: true,
        source: 'Chatbot'
      };

    } catch (error) {
      console.error('Chatbot Error:', error.message);
      
      //If Chatbot fails, try local knowledge
      return sendToLocal(message);
    }
  };

  const sendToLocal = async (message) => {
    //Check if there's a local backend running
    try {
      const response = await fetch('http://192.168.101.5:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          user_id: 'user',
        }),
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.answer,
          success: true,
          source: 'Local Model'
        };
      }
    } catch (error) {
      console.log('Local backend not available, using offline responses');
    }
    
    //Fallback to offline responses
    return getOfflineResponse(message);
  };

  const getOfflineResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    //Check for emergency keywords
    const emergencyKeywords = ['pingsan', 'kejang', 'tidak sadar'];
    const isEmergency = emergencyKeywords.some(keyword => lowerMsg.includes(keyword));
    
    if (isEmergency) {
      return {
        text: '🚨 DARURAT MEDIS TERDETEKSI!\n\nSegera hubungi:\n• Ambulans: 119\n• IGD Rumah Sakit terdekat\n• Puskesmas 24 jam\n\nTanda bahaya pada anak:\n- Kejang\n- Tidak sadar\n- Sesak napas berat\n- Dehidrasi berat\n\nJangan tunda, nyawa anak prioritas utama!',
        isEmergency: true,
        success: true,
        source: 'Offline Emergency'
      };
    }
    
    // Offline responses database
    const offlineResponses = {
      'stunting': {
        text: 'Stunting adalah kondisi gagal tumbuh pada anak balita (bayi di bawah lima tahun) akibat dari kekurangan gizi kronis sehingga anak terlalu pendek untuk usianya.\n\nPenyebab:\n• Kekurangan gizi kronis\n• Infeksi berulang\n• Kurang stimulasi\n\nPencegahan:\n• ASI eksklusif 6 bulan\n• MPASI bergizi seimbang\n• Imunisasi lengkap\n• Sanitasi yang baik',
        keywords: ['stunting', 'pendek', 'gagal tumbuh']
      },
      'wasting': {
        text: 'Wasting adalah kondisi dimana anak terlalu kurus untuk tinggi badannya, menandakan malnutrisi akut.\n\nTanda-tanda:\n• BB/TB < -2 SD\n• Terlihat sangat kurus\n• Tulang rusuk terlihat\n• Kulit keriput\n\nPenanganan:\n• Pemberian makanan terapeutik\n• Suplementasi vitamin\n• Monitoring ketat\n• Rujuk ke Puskesmas/RS',
        keywords: ['wasting', 'kurus', 'gizi buruk akut']
      },
      'muac': {
        text: 'MUAC (Mid-Upper Arm Circumference) adalah pengukuran lingkar lengan atas untuk screening malnutrisi.\n\nInterpretasi:\n• Merah (<11.5 cm): Gizi buruk (SAM)\n• Kuning (11.5-12.5 cm): Gizi kurang (MAM)\n• Hijau (>12.5 cm): Normal\n\nCara mengukur:\n1. Ukur pertengahan lengan atas kiri\n2. Lingkarkan pita MUAC\n3. Baca hasil sesuai warna',
        keywords: ['muac', 'lila', 'lingkar lengan', 'lengan atas']
      },
      'sam': {
        text: 'SAM (Severe Acute Malnutrition) adalah gizi buruk akut yang mengancam jiwa.\n\nKriteria:\n• MUAC < 115 mm\n• BB/TB < -3 SD\n• Edema bilateral\n\nPenanganan:\n• SEGERA rujuk ke RS/Puskesmas\n• F-75 untuk stabilisasi\n• F-100 untuk rehabilitasi\n• RUTF jika rawat jalan\n• Antibiotik jika ada infeksi',
        keywords: ['sam', 'gizi buruk', 'severe', 'malnutrisi berat']
      },
      'mam': {
        text: 'MAM (Moderate Acute Malnutrition) adalah gizi kurang yang perlu intervensi segera.\n\nKriteria:\n• MUAC 115-125 mm\n• BB/TB -3 hingga -2 SD\n\nPenanganan:\n• Supplementary feeding\n• Konseling gizi ibu\n• Monitoring bulanan\n• Vitamin A dan zinc\n• Cegah menjadi SAM',
        keywords: ['mam', 'gizi kurang', 'moderate', 'malnutrisi sedang']
      },
      'rutf': {
        text: 'RUTF (Ready-to-Use Therapeutic Food) adalah makanan terapeutik siap pakai untuk gizi buruk.\n\nKomposisi:\n• Pasta kacang\n• Susu bubuk\n• Minyak\n• Vitamin & mineral\n\nDosis:\n• 150-220 kkal/kg BB/hari\n• Dibagi 3-4x pemberian\n• Diberikan 6-8 minggu\n• Monitoring mingguan',
        keywords: ['rutf', 'plumpy', 'makanan terapi', 'therapeutic food']
      },
      'f75': {
        text: 'F-75 adalah formula untuk fase stabilisasi gizi buruk (hari 1-7).\n\nKomposisi per 100ml:\n• Energi: 75 kkal\n• Protein: 0.9 g\n• Laktosa: 1.3 g\n• Kalium: tinggi\n• Natrium: rendah\n\nPemberian:\n• 130 ml/kg BB/hari\n• Setiap 2-3 jam\n• Gunakan NGT jika perlu',
        keywords: ['f-75', 'f75', 'formula 75', 'stabilisasi']
      },
      'f100': {
        text: 'F-100 adalah formula untuk fase rehabilitasi gizi buruk (setelah F-75).\n\nKomposisi per 100ml:\n• Energi: 100 kkal\n• Protein: 2.9 g\n• Laktosa: 4.2 g\n\nPemberian:\n• 150-220 ml/kg BB/hari\n• Setiap 3-4 jam\n• Transisi bertahap dari F-75\n• Monitor kenaikan BB',
        keywords: ['f-100', 'f100', 'formula 100', 'rehabilitasi']
      },
      'asi': {
        text: 'ASI Eksklusif adalah pemberian ASI saja tanpa tambahan apapun selama 6 bulan.\n\nManfaat:\n• Nutrisi optimal\n• Antibodi alami\n• Cegah infeksi\n• Bonding ibu-bayi\n• Cegah stunting\n\nTips sukses:\n• IMD saat lahir\n• Menyusui on demand\n• Posisi & pelekatan benar\n• Dukungan keluarga',
        keywords: ['asi', 'menyusui', 'air susu', 'eksklusif']
      },
      'mpasi': {
        text: 'MPASI (Makanan Pendamping ASI) dimulai usia 6 bulan dengan tetap memberikan ASI.\n\nPrinsip:\n• Tepat waktu (6 bulan)\n• Adekuat gizi\n• Aman & higienis\n• Responsive feeding\n\nTekstur:\n• 6-9 bulan: Bubur kental\n• 9-12 bulan: Cincang halus\n• 12+ bulan: Makanan keluarga\n\nFrekuensi:\n• 6-8 bulan: 2-3x/hari\n• 9-11 bulan: 3-4x/hari',
        keywords: ['mpasi', 'makanan pendamping', 'makanan bayi', '6 bulan']
      }
    };
    
    //Find matching response
    for (const [key, data] of Object.entries(offlineResponses)) {
      const hasKeyword = data.keywords.some(keyword => lowerMsg.includes(keyword));
      if (hasKeyword) {
        return {
          text: data.text + '\n\n📝 Catatan: Ini adalah respons offline. Untuk informasi lebih lengkap, pastikan terhubung ke internet.',
          success: true,
          source: 'Offline Database'
        };
      }
    }
    
    //Default response if no match found
    return {
      text: 'Maaf, saya tidak dapat menemukan informasi tentang pertanyaan Anda dalam database offline. Topik yang tersedia offline:\n\n• Stunting\n• Wasting\n• MUAC/LILA\n• SAM (Gizi Buruk)\n• MAM (Gizi Kurang)\n• RUTF\n• Formula F-75/F-100\n• ASI Eksklusif\n• MPASI\n\nSilakan coba tanyakan tentang topik di atas atau hubungkan ke internet untuk jawaban lebih lengkap.',
      success: true,
      source: 'Offline'
    };
  };


  //Main send message

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let response;
      
      //Try Chatbot first, then local, then offline
      if (chatMode === 'Chatbot') {
        response = await sendToChatbot(inputText);
      } else if (chatMode === 'LOCAL') {
        response = await sendToLocal(inputText);
      } else {
        response = getOfflineResponse(inputText);
      }

      //Check for emergency
      if (response.isEmergency) {
        Alert.alert(
          '🚨 KONDISI DARURAT TERDETEKSI',
          'Segera bawa anak ke fasilitas kesehatan terdekat!',
          [
            { 
              text: 'Hubungi 119', 
              onPress: () => {
                console.log('Calling emergency');
              },
              style: 'destructive'
            },
            { text: 'Tutup' }
          ]
        );
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        source: response.source,
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

      //Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Send message error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  //Quick response buttons
  const quickResponses = [
    'Apa itu stunting?',
    'Cara mengatasi gizi buruk?',
    'Tanda-tanda malnutrisi?',
    'Cara mencegah stunting?',
    'Makanan untuk anak gizi kurang?',
  ];

  //Toggle chat mode
  const toggleChatMode = () => {
    const modes = ['Chatbot', 'LOCAL', 'OFFLINE'];
    const currentIndex = modes.indexOf(chatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    setChatMode(nextMode);
    
    Alert.alert(
      'Mode Changed',
      `Switched to ${nextMode} mode\n${
        nextMode === 'Chatbot' ? 'Using Chatbot (Internet required)' :
        nextMode === 'LOCAL' ? 'Using local model' :
        'Using offline database'
      }`
    );
  };

  //Clear chat history
  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Hapus semua riwayat percakapan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            conversationHistory = [];
            await AsyncStorage.removeItem('chatMessages');
          }
        }
      ]
    );
  };

  //Render message item
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
    ]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Icon name="support-agent" size={20} color="#fff" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userMessage : styles.botMessage,
        item.isError && styles.errorMessage,
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {item.text}
        </Text>
        {item.source && (
          <Text style={styles.sourceText}>{item.source}</Text>
        )}
        <Text style={styles.timeText}>
          {new Date(item.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="chat" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={toggleChatMode} style={styles.modeButton}>
          <Text style={styles.modeText}>{chatMode}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearChat}>
          <Icon name="delete-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick responses */}
      {messages.length <= 1 && (
        <View style={styles.quickResponseContainer}>
          <Text style={styles.quickResponseTitle}>Pertanyaan Populer:</Text>
          <View style={styles.quickResponseButtons}>
            {quickResponses.map((text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickResponseButton}
                onPress={() => setInputText(text)}
              >
                <Text style={styles.quickResponseText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about child malnutrition…"
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
            onSubmitEditing={sendMessage}
          />
          {isLoading ? (
            <View style={styles.sendButton}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Icon name="send" size={24} color={inputText.trim() ? '#4CAF50' : '#ccc'} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  modeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  modeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickResponseContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickResponseTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickResponseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickResponseButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  quickResponseText: {
    color: '#4CAF50',
    fontSize: 13,
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  sourceText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

