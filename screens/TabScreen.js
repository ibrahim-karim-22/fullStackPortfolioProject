import {useState, useEffect} from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapAndChatScreen from './MapAndChatScreen';
import ChatScreen from './ChatScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialBottomTabNavigator();

const TabScreen = () => {
  const [localUserId, setLocalUserId] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('username');
      const storedAccessKey = await AsyncStorage.getItem('accessKey');
      setLocalUserId(userId);
      setUsername(userName);
      setAccessKey(storedAccessKey);
    };
    fetchUserData();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Track"
      activeColor="goldenrod"
      inactiveColor="gray"
      barStyle={{backgroundColor: 'royalblue', height: 67}}>
      <Tab.Screen
        name="Track"
        children={props => (
          <MapAndChatScreen
            {...props}
            localUserId={localUserId}
            accessKey={accessKey}
            username={username}
          />
        )}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="google-maps"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        children={props => (
          <ChatScreen
            {...props}
            localUserId={localUserId}
            accessKey={accessKey}
            username={username}
          />
        )}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="chat" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabScreen;
