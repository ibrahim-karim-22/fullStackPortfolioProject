import {createStackNavigator} from '@react-navigation/stack';
import {StyleSheet, View, Platform} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import TabScreen from '../screens/TabScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createStackNavigator();
const Nav = () => {
  const screenOptions = {
    headerTintColor: 'black',
    headerStyle: {backgroundColor: 'gold'},
    headerTitleStyle: {
      fontFamily: 'sans-serif-condensed',
      fontSize: 18,
      color: 'black',
    },
  };

  return (
    <View style={styles.stackContainer}>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="Main"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Group" component={TabScreen} />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  stackContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
  },
  stackIcon: {
    marginLeft: 10,
    color: 'royalblue',
    fontSize: 24,
  },
});

export default Nav;
