import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Card} from 'react-native-elements';
import {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {CLOUD_KEY} from '@env';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await fetch(CLOUD_KEY + `/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({firstname, lastname, username, email, password}),
      });
      const data = await response.json();

      if (response.ok) {
        console.log(data);
        Alert.alert('Sign Up Successful', 'Welcome!');
        navigation.navigate('Login');
      } else {
        Alert.alert(
          'Error',
          data.message || 'An error occured while signing up.',
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'An error occured while signing up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView behavior="padding">
        <Animated.View style={[{transform: [{translateY: btnY}]}]}>
          <Card containerStyle={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstname}
              onChangeText={setFirstname}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastname}
              onChangeText={setLastname}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              autoCapitalize="none"
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              autoCapitalize="none"
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            {loading ? (
              <ActivityIndicator size="large" color="steelblue" />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => handleSignUp()}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'snow',
  },
  card: {
    backgroundColor: 'snow',
    alignContent: 'center',
    margin: 23,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: 'gainsboro',
    fontSize: 15,
    padding: 11,
    margin: 5,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 3,
    elevation: 8,
  },
  btn: {
    backgroundColor: 'gold',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 9,
    width: 200,
    alignSelf: 'center',
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
    alignContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpScreen;
