import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput, Button, FlatList, Keyboard, StyleSheet } from 'react-native';
import socketIOClient from 'socket.io-client';
import { CLOUD_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const serverKey = CLOUD_KEY;

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [localUserId, setLocalUserId] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const socketRef = useRef(null);

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(serverKey);
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
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setLocalUserId(userId);
        console.log('Local user id:', userId);
      } else {
        setLocalUserId(null);
        console.log('No local user id');
      }
    };
    fetchUserId();
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

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
      }
    };
  }, [localUserId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        senderId: localUserId,
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

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.senderId}>{item.senderId}</Text>
            <Text style={styles.message}>{item.message}</Text>
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
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
  },
  senderId: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});

export default ChatScreen;