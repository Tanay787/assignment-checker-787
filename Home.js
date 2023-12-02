import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase';
import AuthContext from './AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = ({ navigation }) => {
 const { uid, role } = useContext(AuthContext);
 const [storedRole, setStoredRole] = useState(null);
 const { colors } = useTheme();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is logged in, navigate to the respective screen based on role
        handleLoggedInUser(user);
      } else if (uid && role) {
        // User is logged in according to AsyncStorage, navigate based on role
        handleLoggedInUser({ uid: uid, email: 'Unknown' });
      } else {
        // User is logged out, show the Home screen
        handleLoggedOutUser();
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [uid, role]);

  const handleLoggedInUser = async (user) => {
    if (uid && role) {
      if (role === 'HOD') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Hod' }],
        });
      } else if (role === 'Teacher') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTeacher', params: { uid: uid } }],
        });
      } else {
        const studentRef = firebase.firestore().collection('Student').doc(uid);
        studentRef.get().then((docSnapshot) => {
          if (docSnapshot.exists) {
            const { FormSubmit } = docSnapshot.data();
            if (FormSubmit === 'Yes') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainStudent', params: { uid: uid } }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'onBoardingStudent', params: { email: user.email } },
                ],
              });
            }
          } else {
            navigation.reset({
              index: 0,
              routes: [
                { name: 'onBoardingStudent', params: { email: user.email } },
              ],
            });
          }
        });
      }
    }
  };

  const handleLoggedOutUser = () => {};

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  useEffect(() => {
    // Retrieve the stored role from AsyncStorage
    const getStoredRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        setStoredRole(storedRole);
      } catch (error) {
        console.log('Error retrieving role from AsyncStorage:', error);
      }
    };

    getStoredRole();
  }, []);

   return (
   <SafeAreaView style={styles.container}>
     <Text style={styles.title}>Assignment Checker</Text>
     <Text style={styles.tagline}>A better way to manage assignments</Text>
     <View style={styles.buttonContainer}>
       <Button
         mode="contained"
         icon={() => <Icon name="login" size={20} color="#fffffff" />}
         onPress={handleLogin}
         style={styles.button}>
         Get Started
       </Button>
       <Button
         mode="contained"
         icon={() => <Icon name="account-plus" size={20} color="#e5e5e5ff" />}
         onPress={handleSignup}
         style={styles.button}>
         Create Account
       </Button>
     </View>
     {storedRole && <Text>Stored Role: {storedRole}</Text>}
   </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: '#212529',
 },
 title: {
   fontSize: 30,
   color: '#e5e5e5ff',
   fontFamily: 'Nexa',
   marginBottom: 10,
 },
 tagline: {
   fontSize: 16,
   color: '#fca311ff',
   marginBottom: 20,
 },
 buttonContainer: {
   justifyContent: 'space-around',
   width: '80%',
 },
 button: {
   margin: 20,
   backgroundColor: '#14213dff',
 },
});

export default Home;