import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  Animated
} from "react-native";
import { useEffect, useRef } from "react";
import { Card } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { CLOUD_KEY } from "@env";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(CLOUD_KEY + `/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(CLOUD_KEY + `/users/login`);
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("response data:", data);

        const { token, user } = data;
        console.log("Token:", token);
        console.log("User:", user);

        if (token && user) {
          await AsyncStorage.setItem("authToken", token);
          console.log("Token:", token);

          await AsyncStorage.setItem("userId", user._id);
          await AsyncStorage.setItem("username", user.username);
          console.log("User ID:", user._id, "USERNAME:", user.username);
          if (user._id) {
            const userId = user._id;
            console.log("User ID:", userId);
          } else {
            console.log("No user ID found.");
          }
          navigation.navigate("Main");
        } else {
          console.log("Token or user is missing in the response.");
          Alert.alert("Error", "An error occurred while logging in.");
        }
      } else {
        const errorData = await response.json();
        console.log("Error response data:", errorData);
        Alert.alert("Error", errorData.message || "An error occurred while logging in.");
      }

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "An error occured while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView behavior="padding">
        <Animated.View style={[{ transform: [{ translateY: btnY }] }]}>
          <Card containerStyle={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="username"
              value={username}
              autoCapitalize="none"
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              autoCapitalize="none"
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity
              style={styles.btn}
              onPress={() => handleLogin()}
              color={"rgba(124, 252, 0, .7)"}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator size="large" color="rgba(124, 252, 0, .7)" />}
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "snow",
  },
  card: {
    backgroundColor: 'snow',
    alignContent: 'center',
    margin: 23,
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 12,
    textAlign: "center",
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
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
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 3,
    elevation: 8,
  },
  btn: {
    backgroundColor: 'rgba(255,105,180, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    textShadowOffset: { width: .7, height: .7 },
    textShadowRadius: 1,
    fontSize: 22
  },
});

export default LoginScreen;