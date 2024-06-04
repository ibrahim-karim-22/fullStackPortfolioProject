import {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import socketIOClient from 'socket.io-client';
import {MONGO_KEY} from '@env';

const mongoKey = MONGO_KEY;

const MapScreen = ({ userId }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});

  useEffect(() => {
    const socket = socketIOClient(mongoKey);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('locationUpdated', data => {
      console.log('Received location update:', data);
      setUserLocations(prevLocations => ({
        ...prevLocations,
        [data.userId]: data.coordinates,
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getLocationfromDevice = async () => {
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
      }

  useEffect(() => {
    const fetchLocation = async () => {
        const location = await getLocationfromDevice();
        if (location) {
          setCurrentLocation(location);
        const socket = socketIOClient(mongoKey);
        socket.emit('updateLocation', { userId, coordinates: [location.latitude, location.longitude] });
        }
    }

    fetchLocation();
  }, [userId]);

  return (
    <View style={{flex: 1}}>
      {currentLocation ? (
        <MapView
          style={{flex: 1}}
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
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default MapScreen;
