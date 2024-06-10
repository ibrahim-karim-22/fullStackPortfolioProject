const config = require("../config");
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import { useEffect, useState } from "react";
import { CLOUD_KEY } from "@env";


const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


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
          navigation.navigate("Home");
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
        {/* <Card containerStyle={styles.card}> */}
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
        <View style={styles.btnContainer}>
          <Button
            color={"rgba(124, 252, 0, .7)"}
            title="Login"
            onPress={handleLogin}
          />
        </View>
        {/* </Card> */}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  card: {
    backgroundColor: "rgba(245, 245, 220, .5)",
    alignContent: "center",
    margin: 23,
    borderRadius: 22,
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
    backgroundColor: "gainsboro",
    fontSize: 18,
    padding: 22,
    margin: 5,
    borderRadius: 222,
    shadowColor: "rgba(125, 0, 0, .9)",
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 33,
    elevation: 3,
  },
  btnContainer: {
    margin: -7,
    padding: 16,
    color: "rgba(240, 255, 240, .3)",
  },
  formCheckbox: {
    padding: 2,
    backgroundColor: "rgba(240, 255, 240, .3)",
  },
});

export default LoginScreen;