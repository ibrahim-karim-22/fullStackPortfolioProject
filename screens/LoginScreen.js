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
import  jwtDecode from "jwt-decode";



// import * as SecureStore from "expo-secure-store";

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
        const { token, user } = data;

        if (token && user) {
          await AsyncStorage.setItem("authToken", token);

          // const decodedToken = jwtDecode(token);
          // console.log("Decoded Token:", decodedToken);

          // const userId = decodedToken._id;


        await AsyncStorage.setItem("userId", user._id);
        if (user._id) {
          const userId = user._id;
          console.log("User ID:", userId);
        } else {
          console.log("No user ID found.");
        }
        // await AsyncStorage.setItem("username", user.username);
        // await AsyncStorage.setItem("email", user.email);
        // await AsyncStorage.setItem("firstname", user.firstname);
        // await AsyncStorage.setItem("lastname", user.lastname)
          console.log("Token:", token);
          // fetchUserInfo()
          navigation.navigate("Map");
        }

      } else {
        const errorData = await response.text();
        // const data = JSON.parse(errorData);
        Alert.alert("Error", errorData || "An error occured while logging in.");
      }

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "An error occured while logging in.");
    } finally {
      setLoading(false);
    }
  };

  // const fetchUserInfo = async () => {
  //   const token = await AsyncStorage.getItem("authToken");
  //   if (!token) {
  //     return;
  //   }
  //   try {
  //     const response = await fetch(CLOUD_KEY + `/users/me`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       const { _id, username, email, firstname, lastname } = data;
  //       console.log(data);
  //       if (_id && username && email && firstname && lastname) {
  //         await AsyncStorage.setItem("userId", _id);
  //         await AsyncStorage.setItem("username", username);
  //         await AsyncStorage.setItem("email", email);
  //         await AsyncStorage.setItem("firstname", firstname);
  //         await AsyncStorage.setItem("lastname", lastname);
  //       }
  //     } else {
  //       console.log("Error fetching user info:", response.status);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
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
