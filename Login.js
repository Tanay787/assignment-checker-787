import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import firebase from 'firebase';
import AuthContext from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setUid} = useContext(AuthContext);

  // Inside the handleLogin function in Login.js
  const handleLogin = async () => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('userCredentials: ', userCredential);
      const uid = userCredential.user.uid;
      console.log('uid: ', uid);
      setUid(uid);
      await AsyncStorage.setItem('uid', uid);  //Setting UId
      
      let role = 'Student'; // Default role is Student

      // Check if the email matches the HOD email
      if (email === 'hod1@gmail.com') {
        //password: hod@123
        role = 'HOD';
      }

      // Check if the email belongs to a Teacher
      const teacherQuery = firebase.firestore().collection('Teacher').where('email', '==', email);
      const teacherSnapshot = await teacherQuery.get();
      if (!teacherSnapshot.empty) {
        role = 'Teacher';
      }

      // Check if the email belongs to a Student
      const studentRef = firebase.firestore().collection('Student').doc(uid);
      const docSnapshot = await studentRef.get();
      if (docSnapshot.exists) {
        role = 'Student';
      }
      await AsyncStorage.setItem('role', role); //Setting Role
      // Navigate to the appropriate screen based on the role and FormSubmit value
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
        // Add the student to the 'Student' collection if not already present
        if (role === 'Student' && !docSnapshot.exists) {
          studentRef
            .set({
              email: email,
              FormSubmit: 'No',
              teacherID: studentRef.id,
            })
            .then(() => {
              console.log('Student added to Firestore');
            })
            .catch((error) => {
              console.error('Error adding student to Firestore:', error);
            });
        }

        // Check the value of FormSubmit and navigate accordingly
        if (docSnapshot.exists && docSnapshot.data().FormSubmit === 'Yes') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStudent', params: { uid: uid } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'onBoardingStudent',
                params: { email: email},
              },
            ],
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
});

export default Login;
