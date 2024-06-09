import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MapScreen from "./MapAndChatScreen";
import ChatScreen from "./ChatScreen";


const Tab = createMaterialBottomTabNavigator();

const TabScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 16, fontWeight: "bold" },
        tabBarStyle: { backgroundColor: "black" },
      }}
    >
      <Tab.Screen name="Track" component={MapScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

export default TabScreen;
