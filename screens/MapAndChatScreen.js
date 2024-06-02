import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

const MapScreen = () => {
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    throw new Error('Permission to access location was denied');
                }

                const location = await Location.getCurrentPositionAsync({});
                setCurrentLocation(location.coords);
            } catch (error) {
                console.error('Error fetching location:', error);
                Alert.alert('Error', 'Failed to fetch location. Please try again.');
            }
        }

        fetchLocation();
    }, []);

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
                    }}
                >
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
