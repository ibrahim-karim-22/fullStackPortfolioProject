import React from 'react';
import {StatusBar} from 'react-native';
import Stacks from './nav/nav';
import {NavigationContainer} from '@react-navigation/native';

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <Stacks />
    </NavigationContainer>
  );
};

export default App;
