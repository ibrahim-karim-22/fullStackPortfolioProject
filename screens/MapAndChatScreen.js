import {useEffect, useState} from 'react';
import {View, Text, Alert, StyleSheet} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import socketIOClient from 'socket.io-client';
import CustomMarker from './CustomMarker';
import {CLOUD_KEY} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MapAndChatScreen = ({localUserId, accessKey, username}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});

  useEffect(() => {
    const socket = getSocket();

    socket.on('groupJoined', ({groupName}) => {
      console.log('Group Joined:', groupName);
    });

    socket.on('error', ({message}) => {
      Alert.alert('Error', message);
    });

    socket.on('locationUpdated', ({userId, coordinates, username}) => {
      console.log('Received location update:', {userId, coordinates, username});
      setUserLocations(prevLocations => ({
        ...prevLocations,
        [userId]: {
          coordinates,
          username,
        },
      }));
    });

    return () => {
      socket.off('locationUpdated');
      socket.off('groupJoined');
    };
  }, [localUserId, username]);

  useEffect(() => {
    const joinGroup = async () => {
      const storedAccessKey = await AsyncStorage.getItem('accessKey');
      if (storedAccessKey && localUserId && username) {
        const socket = getSocket();
        console.log('Joining Group', {
          accessKey: storedAccessKey,
          userId: localUserId,
          username,
        });
        socket.emit('joinGroup', {
          accessKey: storedAccessKey,
          userId: localUserId,
          username,
        });
      }
    };
    joinGroup();
  }, [accessKey, localUserId, username]);

  const getLocationFromDevice = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      const {latitude, longitude} = location.coords;
      console.log(`Current location: ${latitude}, ${longitude}`);
      return {latitude, longitude};
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
        const storedAccessKey = await AsyncStorage.getItem('accessKey');
        const socket = getSocket();
        console.log('Emitting location event', {
          userId: localUserId,
          username,
          coordinates: [location.latitude, location.longitude],
          accessKey: storedAccessKey,
        });
        socket.emit('updateLocation', {
          userId: localUserId,
          username,
          coordinates: [location.latitude, location.longitude],
          accessKey: storedAccessKey,
        });

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 0.1,
          },
          async location => {
            const {latitude, longitude} = location.coords;
            setCurrentLocation({latitude, longitude});
            console.log('Emitting location update', {
              userId: localUserId,
              username,
              coordinates: [latitude, longitude],
              accessKey: storedAccessKey,
            });
            socket.emit('updateLocation', {
              userId: localUserId,
              username,
              coordinates: [latitude, longitude],
              accessKey: storedAccessKey,
            });
          },
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
    <View style={{flex: 1}}>
      {currentLocation ? (
        <MapView
          provider="google"
          style={{flex: 1}}
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
    textShadowOffset: {width: 0.7, height: 0.7},
    textShadowRadius: 10,
    textAlign: 'center',
    backgroundColor: 'royalblue',
  },
});

export default MapAndChatScreen;
