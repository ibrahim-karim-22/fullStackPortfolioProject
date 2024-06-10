import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TextInput,
  Alert,
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
};

const HomeScreen = ({ navigation }) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [groupName, setGroupName] = useState('');
 

  useEffect(() => {
    const socket = getSocket();

    socket.on('groupCreated', ({ accessKey }) => {
      setAccessKey(accessKey);
      AsyncStorage.setItem('accessKey', accessKey);
      Alert.alert('Group Created', `Access key: ${accessKey}`);
    });

    socket.on('groupJoined', ({ accessKey }) => {
      navigation.navigate('Group', { accessKey });
    });

    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
    });

    return () => {
      socket.off('groupCreated');
      socket.off('groupJoined');
      socket.off('error');
    };
  }, [navigation]);

  const createGroup = () => {
    const socket = getSocket();

    AsyncStorage.setItem('groupName', groupName);
    socket.emit('createGroup', { groupName });
  };

  const joinGroup = (accessKey) => {
    const socket = getSocket();
    socket.emit('joinGroup', { accessKey });
  };

  const handleLogout = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        let response = await fetch(`${serverKey}/locations/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error deleting location data');
        }
      }
      await AsyncStorage.clear();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Logout Error', 'There was an error logging out.');
    }
  };

  useEffect(() => {
    const retrieveAccessKey = async () => {
      const storedAccessKey = await AsyncStorage.getItem('accessKey');
      console.log('Retrieved Access Key:', storedAccessKey);
      if (storedAccessKey) {
        setAccessKey(storedAccessKey);
      }
    };

    retrieveAccessKey();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Create Group" onPress={() => setIsCreateModalVisible(true)} />
      <Button title="Join Group" onPress={() => setIsJoinModalVisible(true)} />

      <Modal visible={isCreateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Generate Access Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            value={groupName}
            onChangeText={setGroupName}
          />
          {accessKey ? (
            <Text style={styles.accessKey}>Access Key: {accessKey}</Text>
          ) : (
            <Button
            title="Generate Access Key"
            onPress={createGroup}
            disabled={!groupName}
          />
          )}
      <Button title="Close" onPress={() => setIsCreateModalVisible(false)} />        
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
          <Button
            title="Join Group"
            onPress={() => joinGroup(accessKey)}
            disabled={!accessKey}
          />
          <Button title="Close" onPress={() => setIsJoinModalVisible(false)} />
        </View>
      </Modal>
      <Button
        title="Logout"
        onPress={handleLogout}
        color="red"
      />
    </ScrollView>
  );
};

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
    borderColor: 'gray'
  },
  accessKey: {
    fontSize: 20,
    color: 'green',
  
  }
});

export default HomeScreen;