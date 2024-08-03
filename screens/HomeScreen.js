import React from 'react';
import {useEffect, useState, useRef} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import socketIOClient from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CLOUD_KEY} from '@env';

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

const HomeScreen = ({navigation}) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [groupName, setGroupName] = useState('');

  const btnY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(btnY, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [btnY]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('groupCreated', async ({accessKey, userId, username}) => {
      setAccessKey(accessKey);
      await AsyncStorage.setItem('accessKey', accessKey);
      console.log(
        'Group Created',
        `Access key: ${accessKey}, User ID: ${userId}, Username: ${username}`,
      );
      Alert.alert(
        'Group Created',
        `Access key: ${accessKey}, User ID: ${userId}, Username: ${username}`,
      );
    });

    socket.on(
      'groupJoined',
      async ({accessKey, userId, username, groupName}) => {
        await AsyncStorage.setItem('accessKey', accessKey);
        console.log(
          'Group Joined',
          `Access key: ${accessKey}, User ID: ${userId}, Username: ${username}, Group Name: ${groupName}`,
        );
        Alert.alert(
          'Group Joined',
          `Access key: ${accessKey}, User ID: ${userId}, Username: ${username}, Group Name: ${groupName}`,
        );
        navigation.navigate('Group');
      },
    );

    socket.on('error', ({message}) => {
      console.error('Socket Error:', message);
      Alert.alert('Error', message);
    });

    return () => {
      socket.off('groupCreated');
      socket.off('groupJoined');
      socket.off('error');
    };
  }, [navigation]);

  const createGroup = async () => {
    const socket = getSocket();
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');
    console.log('Creating Group', {groupName, userId, username});

    if (userId && username) {
      await AsyncStorage.setItem('groupName', groupName);
      socket.emit('createGroup', {groupName, userId, username});
    } else {
      Alert.alert('Error', 'happened in createGroup.');
    }
  };

  const joinGroup = async accessKey => {
    const socket = getSocket();
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');
    console.log('Joining Group', {accessKey, userId, username});

    if (userId && username) {
      await AsyncStorage.setItem('accessKey', accessKey);
      socket.emit('joinGroup', {accessKey, userId, username});
    } else {
      Alert.alert('Error', 'happened in joinGroup.');
    }
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
        routes: [{name: 'Welcome'}],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Logout Error', 'There was an error logging out.');
    }
  };

  useEffect(() => {
    const retrieveAccessKey = async () => {
      const storedAccessKey = await AsyncStorage.getItem('accessKey');
      if (storedAccessKey) {
        setAccessKey(storedAccessKey);
      } else {
        setAccessKey('');
      }
    };

    retrieveAccessKey();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View
        style={[styles.buttonContainer, {transform: [{translateY: btnY}]}]}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {
            setAccessKey('');
            setIsCreateModalVisible(true);
          }}
          color={'rgba(124, 252, 0, .7)'}>
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[styles.buttonContainer, {transform: [{translateY: btnY}]}]}>
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => setIsJoinModalVisible(true)}
          color={'rgba(124, 252, 0, .7)'}>
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
      </Animated.View>
      <Modal visible={isCreateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            value={groupName}
            onChangeText={setGroupName}
          />
          {accessKey ? (
            <Text style={styles.accessKey}>Access Key: {accessKey}</Text>
          ) : (
            <TouchableOpacity
              style={[styles.button, !groupName ? styles.disabledButton : null]}
              onPress={createGroup}
              disabled={!groupName}>
              <Text style={styles.buttonText}>Generate Access Key</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setIsCreateModalVisible(false)}
            color={'rgba(124, 252, 0, .7)'}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={[styles.button, !accessKey ? styles.disabledButton : null]}
            onPress={() => joinGroup(accessKey)}
            disabled={!accessKey}>
            <Text style={styles.buttonText}>Join Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setIsJoinModalVisible(false)}
            color={'rgba(124, 252, 0, .7)'}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Animated.View
        style={[styles.buttonContainer, {transform: [{translateY: btnY}]}]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  input: {
    backgroundColor: 'honeydew',
    fontSize: 22,
    padding: 22,
    margin: 11,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 3,
    elevation: 8,
    width: 300,
  },
  accessKey: {
    fontSize: 20,
    color: 'green',
    margin: 10,
  },
  button: {
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
  },
  createBtn: {
    backgroundColor: 'rgba(255,105,180, 1)',
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
    alignSelf: 'center',
  },
  joinBtn: {
    backgroundColor: 'rgba(255,215,0,1)',
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
    alignSelf: 'center',
  },
  logoutBtn: {
    backgroundColor: 'rgba(178,34,34,1)',
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
    alignSelf: 'center',
    top: 100,
  },
  buttonText: {
    fontSize: 18,
    color: 'snow',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    textAlign: 'center',
    textShadowColor: '#222',
    textShadowOffset: {width: 0.7, height: 0.7},
    textShadowRadius: 1,
  },
  backBtn: {
    backgroundColor: 'rgba(70,130,180,1)',
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
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'snow',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    textAlign: 'center',
    textShadowColor: '#222',
    textShadowOffset: {width: 0.7, height: 0.7},
    textShadowRadius: 1,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
});

export default HomeScreen;
