import { Box, Button, Flex, Heading, Input } from "@chakra-ui/react";
import React, { useState, useContext } from 'react';
//import logo from "../assets/autotecnica_botti_logo_completo_nosfondo_bianco.png";
import AuthContext from "../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { useCustomToast } from './showToast';
import {auth} from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { showErrorToast, showSuccessToast } = useCustomToast();
    const { login } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");//precompiled@email.com
    const [password, setPassword] = useState(""); //precompiledPassword

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
                // Signed in 
                const user = userCredential.user
                login({ displayName: user.displayName || 'Anonymous', email: user.email || 'No Email' });
                navigate('/');
                showSuccessToast('Login successful');
            }).catch((error) => {
                //const errorCode = error.code;
                const errorMessage = error.message;
                showErrorToast(errorMessage)                
              });
        setIsLoading(false);
    };

    return (
        <Flex height="100vh" alignItems="center" justifyContent="center">
            <Box as="form" onSubmit={handleSubmit} p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg" border="1px solid grey">
                <Flex alignItems="center" justifyContent="center">
                    <Heading size="lg">Personal Home-Banking</Heading>
                </Flex>
                <Box my={4} textAlign="center">
                    <Heading mt={2} mb={3}>Login</Heading>
                    <Input variant="filled" mt={2} mb={6} type="email" placeholder="Email" width="75%" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input variant="filled" mt={2} mb={6} type="password" placeholder="Password" width="75%" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button mt={4} type="submit" width="50%" isLoading={isLoading}>
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Flex>
    );
};

export default LoginPage;