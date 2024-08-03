import * as Location from 'expo-location';

export const getGeoLocation = async () => {
  try {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const {latitude, longitude} = location.coords;
    console.log(`Current location: ${latitude}, ${longitude}`);
  } catch (error) {
    console.error('Failed to request location permission', error);
  }
};
