import { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import socketIOClient from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLOUD_KEY } from '@env';
import CustomMarker from './CustomMarker';

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

const MapScreen = ({ route }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});
  const [localUserId, setLocalUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [groupName, setGroupName] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      const groupName = await AsyncStorage.getItem('groupName');
      setLocalUserId(userId);
      setUsername(username);
      setGroupName(groupName);
      console.log('Local user id:', userId);
      console.log('Username:', username);
      console.log('Group name:', groupName);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const joinGroupWithUsername = async () => {
      const socket = getSocket();
      const accessKey = await AsyncStorage.getItem('accessKey');
      if (accessKey && localUserId && username) {
        socket.emit('joinGroup', { accessKey, userId: localUserId, username });
      }
    };

    joinGroupWithUsername();

    socket.on('groupJoined', ({ groupName }) => {
      console.log('Group Joined:', groupName);
    });

    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
    });

    socket.on('locationUpdated', data => {
      console.log('Received location update:', data);
      setUserLocations(prevLocations => ({
        ...prevLocations,
        [data.userId]: {
          coordinates: data.coordinates,
          username: data.username,
        },
      }));
    });

    return () => {
      socket.off('locationUpdated');
      socket.off('groupJoined');
    };
  }, [localUserId, username]);

  const getLocationFromDevice = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log(`Current location: ${latitude}, ${longitude}`);
      return { latitude, longitude };
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Failed to fetch location. Please try again.');
      return null;
    }
  };

  useEffect(() => {
    let locationSubscription;

    const fetchLocation = async () => {
      const location = await getLocationFromDevice();
      if (location) {
        setCurrentLocation(location);
        const socket = getSocket();
        const accessKey = await AsyncStorage.getItem('accessKey');
        console.log('Emitting location event', { userId: localUserId, username, coordinates: [location.latitude, location.longitude] });
        socket.emit('updateLocation', { userId: localUserId, username, coordinates: [location.latitude, location.longitude], accessKey });

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0.1 },
          async (location) => {
            const { latitude, longitude } = location.coords;
            setCurrentLocation({ latitude, longitude });
            console.log('Emitting location update', { userId: localUserId, username, coordinates: [latitude, longitude] });
            socket.emit('updateLocation', { userId: localUserId, username, coordinates: [latitude, longitude], accessKey });
          }
        );
      }
    };

    if (localUserId && username) {
      fetchLocation();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [localUserId, username]);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.groupInfo}>{groupName}</Text>
      {currentLocation ? (
        <MapView
          provider="google"
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <CustomMarker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            username={username}
          />
          {Object.keys(userLocations).map(key => (
            <CustomMarker
              key={key}
              coordinate={{
                latitude: userLocations[key].coordinates[0],
                longitude: userLocations[key].coordinates[1],
              }}
              username={userLocations[key].username}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupInfo: {
    fontSize: 22,
    fontFamily: 'sans-serif-condensed',
    color: 'rgba(0, 191, 255, 1)',
    textShadowColor: '#222',
    textShadowOffset: { width: .7, height: .7 },
    textShadowRadius: 10,
    textAlign: 'center',
    backgroundColor: 'royalblue',
  },
});

export default MapScreen;