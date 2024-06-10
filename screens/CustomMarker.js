import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

const CustomMarker = ({ coordinate, username }) => {
  return (
    <Marker coordinate={coordinate}>
      <View style={styles.markerContainer}>
        <View style={styles.pointer} />
        <View style={styles.labelContainer}>
          <Text style={styles.markerText}>{username}</Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: 'gold',
    padding: 5,
    borderRadius: 5,
    overflow: 'visible',
    fontSize: 18,
    marginTop: 1,
  },
  markerText: {
    fontSize: 18,
    color: 'black',
    zIndex: 1,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'royalblue',
    marginTop: 1,
  },
});

export default memo(CustomMarker);
