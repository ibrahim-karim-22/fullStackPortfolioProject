import {createStackNavigator} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import HomeScreen from '../screens/HomeScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomDrawerContent = props => (
  <DrawerContentScrollView {...props} style={styles.sideDrawer}>
    <View style={styles.drawerSideLogo}>
      <View style={{flex: 1}}>
        <Image
          source={require('../assets/splash.png')}
          style={styles.drawerImage}
        />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.drawerLogoText}>BARD</Text>
      </View>
    </View>
    <DrawerItemList {...props} labelStyle={{fontWeight: 'bold'}} />
  </DrawerContentScrollView>
);

const Main = () => {
  return (
    <SafeAreaView style={styles.drawerContainer}>
      <Drawer.Navigator
        drawerContent={CustomDrawerContent}
        screenOptions={{
          headerStyle: {backgroundColor: 'black'},
          headerTintColor: 'white',
        }}>
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            drawerLabelStyle: {color: 'white'},
            drawerIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faHouseFlag}
                style={styles.drawerIcon}
                size={28}
                color={focused ? 'peru' : 'gray'}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

const Stacks = () => {
    const screenOptions = {
      headerTintColor: "white",
      headerStyle: { backgroundColor: "black" },
    };
  
    return (
      <View style={styles.stackContainer}>
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="Root">
          <Stack.Screen
            name="Main"
            component={Main}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    drawerContainer: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 0 : Constants.statusBarHeight,
    },
    stackContainer: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 0 : Constants.statusBarHeight,
    },
    drawerSideLogo: {
      backgroundColor: "rgba(128, 0, 0, .2)",
      height: 100,
      flex: 1,
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
    },
    drawerLogoText: {
      color: "rgba(255, 250, 250, .7)",
      fontSize: 55,
      fontWeight: "bold",
      marginLeft: -70,
      textShadowColor: "rgba(255, 255, 255, .4)",
      textShadowOffset: { width: 0.2, height: 0.2 },
      textShadowRadius: 33,
    },
    sideDrawer: {
      backgroundColor: "black",
    },
    drawerImage: {
      margin: 22,
      height: 122,
      width: 200,
      marginLeft: 7,
    },
    stackIcon: {
      marginLeft: 10,
      color: "royalblue",
      fontSize: 24,
    },
  
    drawerIcon: {
      width: 55,
      borderRadius: 5,
      padding: 4,
      textAlign: "center",
    },
  });

  export default Stacks;