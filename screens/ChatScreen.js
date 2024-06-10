import { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput, FlatList, Keyboard, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import socketIOClient from 'socket.io-client';
import { CLOUD_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const serverKey = CLOUD_KEY;

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [localUserId, setLocalUserId] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [userName, setUserName] = useState(''); 
  const socketRef = useRef(null);

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(serverKey, {
        transports: ['websocket'],
      });
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('newMessage', (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
    return socketRef.current;
  };

  useEffect(() => {
    const fetchUserIdAndUserName = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('username'); 
      if (userId && userName) {
        setLocalUserId(userId);
        setUserName(userName);
        console.log('Local user id:', userId, 'Username:', userName);
      } else {
        setLocalUserId(null);
        console.log('No local user id or username');
      }
    };
    fetchUserIdAndUserName();
  }, []);

  useEffect(() => {
    const fetchAccessKey = async () => {
      const storedAccessKey = await AsyncStorage.getItem('accessKey');
      if (storedAccessKey) {
        setAccessKey(storedAccessKey);
        const socket = getSocket();
        if (localUserId) {
          socket.emit('joinGroup', { accessKey: storedAccessKey, userId: localUserId });
        }
      }
    };
    fetchAccessKey();

    const socket = getSocket();
    socket.on('groupJoined', ({ groupName }) => {
      console.log('Group Joined:', groupName);
    });

    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('groupJoined');
      }
    };
  }, [localUserId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        senderId: localUserId,
        senderName: userName,
        message,
        accessKey,
        timestamp: new Date(),
      };
      const socket = getSocket();
      socket.emit('sendMessage', newMessage);
      setMessage('');
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      Keyboard.dismiss();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
            <View style={styles.messageContainer}>
            <Text style={styles.senderId}>{item.senderName}</Text>
              <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type your message..."
      />
      <TouchableOpacity style={styles.btn} onPress={handleSendMessage}>
      <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'aliceblue',
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: 'deepskyblue',
    borderRadius: 5,
  },
  senderId: {
    fontWeight: 'bold',
    color: 'snow',
    fontFamily: 'monospace', 
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: 'deepskyblue', 
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 12,
    color: 'gold',
  },
  message: {
    fontSize: 16,
  },
  input: {
    backgroundColor: 'honeydew',
    fontSize: 22,
    padding: 11,
    margin: 11,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 3,
    elevation: 8,
    width: 300,
    alignSelf: 'center',
  },
  btn: {
    backgroundColor: 'rgba(124,252,0,1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 9,
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export default ChatScreen;