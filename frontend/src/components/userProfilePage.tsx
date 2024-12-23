import React, { useContext, useState } from 'react';
import { auth } from '../firebase'; // Import your Firebase configuration
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Image, Heading, Box, Button, Flex, FormControl, Input, Text, Grid } from "@chakra-ui/react";
import Navbar from './navbar';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // import firestore from your firebase configuration file
import { useCustomToast } from './showToast';
import logo from "../assets/autotecnica_botti_logo_completo_nosfondo_bianco.png";
import UserContext from "../context/userContext";

const UserProfilePage: React.FC = () => {
  const { actualName, actualSurname, updateNameAndSurname} = useContext(UserContext);
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [name, setName] = useState(actualName);
  const [surname, setSurname] = useState(actualSurname);
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSurnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSurname(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUpdateNameAndSurname = async () => {
    const user = auth.currentUser;

    if (user) {
      // Update additional user data in Firestore
      const userDoc = doc(firestore, 'users', user.uid);
      await setDoc(userDoc, {
        name: name.trim(),
        surname: surname.trim(),
      }, { merge: true });
      
      updateNameAndSurname(name.trim(), surname.trim());

      //console.log('Name and Surname updated successfully');
      showSuccessToast('Name and Surname updated successfully');
    }
  };

  const handleUpdatePassword = () => {
    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email, // user's email
        currentPassword // user's current password
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, password)
            .then(() => {
              showSuccessToast('Password updated successfully');
            })
            .catch((error) => {
              showErrorToast('Error updating password: - ' + error);
            });
        })
        .catch((error) => {
          showErrorToast('Error reauthenticating: - ' + error);
        });
    }
  };

  return (
    <Flex justifyContent="center" minHeight="100vh">
      <Box maxWidth="700px" width={"700px"}>
        <Navbar />
        <Box border="1px solid grey" p={4} borderRadius="md">
          <Flex justifyContent="center" alignItems="center" mb={3}>
            <Image src={logo} boxSize="50px" mr={2} />
            <Heading size="lg">User Profile</Heading>
          </Flex>

          {/* <FormControl id="displayName" mb="4">
            <Text>Display Name</Text>
            <Input textAlign="center" type="text" value={displayName || ''} onChange={handleDisplayNameChange} width={'50%'} />
          </FormControl>
          <Button colorScheme="blue" onClick={handleUpdateProfile}>Update Display Name</Button> */}
          <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]} gap={6}>
            <FormControl id="name" mt="6" mb="4">
              <Text textAlign={"center"}>Name</Text>
              <Input textAlign="center" type="text" value={name} onChange={handleNameChange} />
            </FormControl>

            <FormControl id="surname" mt="6" mb="4">
              <Text textAlign={"center"}>Surname</Text>
              <Input textAlign="center" type="text" value={surname} onChange={handleSurnameChange} />
            </FormControl>
          </Grid>
          <Flex justifyContent="center">
          <Button colorScheme="blue" onClick={handleUpdateNameAndSurname}>Update Name and Surname</Button>
          </Flex>
          <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]} gap={6}>
            <FormControl id="currentPassword" mt="6" mb="4">
              <Text textAlign={"center"}>Current Password</Text>
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </FormControl>
            <FormControl id="newPassword" mt="6" mb="4">
              <Text textAlign={"center"}>Password</Text>
              <Input textAlign="center" type="password" value={password} onChange={handlePasswordChange} />
            </FormControl>
          </Grid>
          <Flex justifyContent="center">
          <Button colorScheme="blue" onClick={() => {
            if (password.trim() === '' || currentPassword.trim() === ''){
              showErrorToast('Password is required');
            } else {
              handleUpdatePassword();
            }
          }}>Update Password</Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};
export default UserProfilePage;