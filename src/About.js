import * as React from 'react';
import { View, Text, } from 'react-native';
import * as firebase from 'firebase';

const AboutScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ textAlign: "center", fontSize: 25, padding: 20 }}>This is a final year project of two Computer Science students of The Chinese University of Hong Kong Henry Chow and David Lau.</Text>
    </View>
  );
}
export default AboutScreen;