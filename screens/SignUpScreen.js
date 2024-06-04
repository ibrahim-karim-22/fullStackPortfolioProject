import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Card } from 'react-native-elements';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
const config = require('../config');
import { CLOUD_KEY } from '@env'

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
            placeholder="username"
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
              <View style={styles.btn}>
                <Button title="SignUp" color={'rgba(130, 0, 0, .7)'} onPress={handleSignUp} />

              </View>
            </>
          )}
        </Card>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  card: {
    backgroundColor: 'silver',
    alignContent: 'center',
    margin: 23,
    borderRadius: 22,
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
    fontSize: 18,
    padding: 22,
    margin: 5,
    borderRadius: 222,
    shadowColor: 'rgba(125, 0, 0, .9)',
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 33,
    elevation: 3,
  },
  btn: {
    margin: -7,
    padding: 16,
  },
});

export default SignUpScreen;
