import {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  FlatList,
  Keyboard,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import socketIOClient from 'socket.io-client';
import {CLOUD_KEY} from '@env';

const serverKey = CLOUD_KEY;

const ChatScreen = ({localUserId, accessKey, username}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(CLOUD_KEY, {
        transports: ['websocket'],
      });
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        if (accessKey && localUserId && username) {
          console.log('Joining Group', {
            accessKey,
            userId: localUserId,
            username,
          });
          socketRef.current.emit('joinGroup', {
            accessKey,
            userId: localUserId,
            username,
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('newMessage', msg => {
        if (msg.senderId !== localUserId) {
          setMessages(prevMessages => [...prevMessages, msg]);
        }
      });
    }
    return socketRef.current;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (accessKey) {
          const response = await fetch(
            `${CLOUD_KEY}/communication/byAccessKey/${accessKey}`,
          );
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    const socket = getSocket();

    socket.on('groupJoined', ({groupName}) => {
      console.log('Group Joined:', groupName);
    });

    socket.on('error', ({message}) => {
      Alert.alert('Error', message);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessKey, localUserId, username]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        senderId: localUserId,
        senderName: username,
        message,
        accessKey,
        timestamp: new Date(),
      };
      const socket = getSocket();
      socket.emit('sendMessage', newMessage);
      setMessage('');
      setMessages(prevMessages => [...prevMessages, newMessage]);
      Keyboard.dismiss();
    }
  };

  const formatTimestamp = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({item}) => (
          <View style={styles.messageContainer}>
            <Text style={styles.senderId}>{item.senderName}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
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
  message: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'gold',
  },
  input: {
    backgroundColor: 'honeydew',
    fontSize: 22,
    padding: 11,
    margin: 11,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {width: 3, height: 3},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 9,
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'snow',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    textAlign: 'center',
  },
});

export default ChatScreen;
