
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import socketIOClient from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLOUD_KEY } from '@env';

const serverKey = CLOUD_KEY;

let socket;

const getSocket = () => {
  if (!socket) {
    socket = socketIOClient(serverKey);
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }
  return socket;
}
const HomeScreen = ({ navigation }) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    const socket = getSocket();

    socket.on('groupCreated', (accessKey) => {
      setGeneratedKey(accessKey);
      Alert.alert('Group Created', `Access key: ${accessKey}`);
    });

    socket.on('groupJoined', ({ groupId }) => {
      AsyncStorage.setItem('groupId', groupId);
      navigation.navigate('Map', { groupId });
    });

    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
    });
  }, []);

  const createGroup = async () => {
    try {
      const socket = getSocket();
      await socket.emit('createGroup');
      const accessKey = await new Promise((resolve) => {
        socket.once('groupCreated', (key) => resolve(key));
      });
      setGeneratedKey(accessKey);
      console.log('Group created:', accessKey);
      Alert.alert('Group Created', `Access key: ${accessKey}`);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = () => {
    const socket = getSocket();
    const userId = AsyncStorage.getItem('userId');
    socket.emit('joinGroup', { userId, accessKey });
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Create Group" onPress={() => setIsCreateModalVisible(true)} />
      <Button title="Join Group" onPress={() => setIsJoinModalVisible(true)} />

      <Modal visible={isCreateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Generate Access Key</Text>
          {generatedKey ? (
            <Text style={styles.accessKey}>Access Key: {generatedKey} </Text>
          ) : (
            <Button title='Generate access key' onPress={createGroup} />
          )}
          <Button title='close' onPress={() => setIsCreateModalVisible(false)} />
        </View>
      </Modal>


      <Modal visible={isJoinModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Access Key"
            value={accessKey}
            onChangeText={setAccessKey}
          />
          <Button title='Join Group' onPress={joinGroup} />
          <Button title='close' onPress={() => setIsJoinModalVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
  accessKey: {
    fontSize: 20,
    color: 'green',
  
  }
});

export default HomeScreen;