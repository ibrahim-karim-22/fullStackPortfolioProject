import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import socketIOClient from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLOUD_KEY } from '@env';

const serverKey = CLOUD_KEY;

// Singleton pattern for socket connection
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

const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});
  const [localUserId, setLocalUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setLocalUserId(userId);
        console.log ('local user id: ', userId);
      } else {
        setLocalUserId(null);
        console.log ('no local user id');
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    const fetchUserLocations = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        response = await fetch(CLOUD_KEY + `/locations/${localUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const locations = await response.json();
          setUserLocations(locations);
      }
      } catch (error) {
        console.log('Error fetching user locations:', error);
      }
    };
    if (localUserId) {
    socket.on('locationUpdated', data => {
      console.log('Received location update:', data);
      setUserLocations(prevLocations => ({
        ...prevLocations,
        [data.userId]: data.coordinates,
      }));
    });

    socket.on('latestLocations', locations => {
       setUserLocations(locations);
    });
    fetchUserLocations();
  } 

    return () => {
      socket.off('locationUpdated');
      socket.off('latestLocations');
      };
  }, [localUserId]);

  const getLocationfromDevice = async () => {
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
      const location = await getLocationfromDevice();
      if (location) {
        setCurrentLocation(location);
        const socket = getSocket();
        console.log('emmitiging location event', { userId: localUserId, coordinates: [location.latitude, location.longitude] });
        socket.emit('updateLocation', { userId: localUserId, coordinates: [location.latitude, location.longitude] });

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: .1 },
          (location) => {
            const { latitude, longitude } = location.coords;
            setCurrentLocation({ latitude, longitude });
            console.log('emmiting location update', { userId: localUserId, coordinates: [latitude, longitude] });
            socket.emit('updateLocation', { userId: localUserId, coordinates: [latitude, longitude] });
          }
        );
      }
    };
    if (localUserId) {
      fetchLocation();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [localUserId]);

  return (
    <View style={{ flex: 1 }}>
      {currentLocation ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="My Location"
            description="My first tracked location"
          />
          {Object.keys(userLocations).map(key => (
            <Marker
              key={key}
              coordinate={{
                latitude: userLocations[key][0],
                longitude: userLocations[key][1],
              }}
              title={`User ${key}`}
              description={`Location of user ${key}`}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default MapScreen;
