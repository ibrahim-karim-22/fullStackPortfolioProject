const config = require("./config");
const AsyncStorage = require("@react-native-async-storage/async-storage");
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
  } from "react-native";
  import { useEffect, useState } from "react";
  import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { Card } from "react-native-elements";
  import { Alert } from "react-native";
  // import * as SecureStore from "expo-secure-store";

  const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.MONGO_KEY}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem("authToken", data.token);
                Alert.alert("Login Successful", "Welcome back!");
                navigation.navigate("Home");
            } else {
                Alert.alert("Error", data.message || "An error occured while logging in.");
            } 

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "An error occured while logging in.");
        } finally {
            setLoading(false);
        }
        }
    return (
        <View style={styles.mainContainer}>
        <KeyboardAvoidingView behavior="padding">
          {/* <Card containerStyle={styles.card}> */}
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