import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapScreen from "./MapAndChatScreen";
import ChatScreen from "./ChatScreen";

const Tab = createMaterialBottomTabNavigator();

const TabScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="goldenrod"
      inactiveColor="gray"
      barStyle={{ backgroundColor: 'royalblue', height: 67, }}
    >
      <Tab.Screen name="Track" component={MapScreen} options={{
        tabBarLabel: 'Track',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="google-maps" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="chat" color={color} size={26} />
        ),
      }} />
    </Tab.Navigator>
  );
};

export default TabScreen;
