import {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
const WelcomeScreen = ({navigation}) => {
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

  return (
    <View style={styles.container}>
      <Animated.View style={[{transform: [{translateY: btnY}]}]}>
        <Text style={styles.title}>HeyYou</Text>
      </Animated.View>
      <Animated.View style={[{transform: [{translateY: btnY}]}]}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[{transform: [{translateY: btnY}]}]}>
        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={() => navigation.navigate('SignUp')}
          color={'rgba(124, 252, 0, .7)'}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'snow',
  },
  title: {
    fontSize: 100,
    marginBottom: 20,
    fontFamily: 'sans-serif-condensed',
    color: 'rgba(0, 191, 255, 1)',
    textShadowColor: '#222',
    textShadowOffset: {width: 0.7, height: 0.7},
    textShadowRadius: 10,
    textAlign: 'center',
    padding: 10,
  },
  btnContainer: {
    marginTop: 20,
  },
  loginBtn: {
    backgroundColor: 'rgba(255,215,0, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 3},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 9,
    width: 200,
  },
  signUpBtn: {
    backgroundColor: 'rgba(255,105,180, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 3},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 9,
    width: 200,
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
    fontSize: 22,
  },
});

export default WelcomeScreen;
