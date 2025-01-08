import {
    Box, Button, Flex, IconButton,
    Spacer, useColorMode, useColorModeValue,
    Avatar,
    Heading
} from "@chakra-ui/react";
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import AuthContext from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // import auth from your firebase configuration file
import UserContext from "../context/userContext";
import { FaHome } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import ModalVersion from "./ModalVersion";
//import logo from "../assets/autotecnica_botti_logo_completo_nosfondo_bianco.png";
interface NavbarProps {
}
//const db = getDatabase(firebaseApp);

const Navbar: React.FC<NavbarProps> = ({ }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { logout: logoutContext } = useContext(AuthContext);
    //const { languageSelected, setLanguageSelected } = useContext(LanguageContext);
    const { actualName, actualSurname, actualRole } = useContext(UserContext);
    const bgColor = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const navigate = useNavigate();

    const logout = async () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            logoutContext();
            localStorage.removeItem('sessionId');
        }).catch((error) => {
            // An error happened.
            console.error(error);
        });
    };


    return (
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1rem" bg={bgColor} color={textColor}>
            {/* <Text>{currentDisplayName}</Text> */}
            <Flex justifyContent="center" alignItems="center" mb={3}>
                <Heading size="lg"> Personal Home-Banking</Heading>
            </Flex>
            <Spacer />
            {/* Navigation button */}
            <IconButton
                aria-label="home"
                variant="outline"
                colorScheme="red"
                icon={<FaHome />}
                onClick={() => navigate('/')}
                ml={4}
            />
            <IconButton
                aria-label="form"
                variant="outline"
                colorScheme="red"
                icon={<IoMdAdd />}
                onClick={() => navigate('/addAssistance')}
                ml={4}
            />
            {actualRole === 99 ? 
                <IconButton
                    aria-label="home"
                    variant="outline"
                    colorScheme="red"
                    icon={<FaUsersGear />}
                    onClick={() => navigate('/userman')}
                    ml={4}
                />
                : null
            }            
            <ModalVersion />
            <Button colorScheme="red" variant="outline" ml={4} onClick={logout}>
                Logout
            </Button>
            <IconButton
                aria-label="Toggle color mode"
                variant="outline"
                colorScheme="red"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                ml={4}
            />
            <Box ml={4}>
                <Button
                    aria-label="Profile"
                    variant="unstyled"
                    onClick={() => navigate('/profile')}
                    h="40px" // adjust this value to change the height
                    w="40px" // adjust this value to change the width
                    p={0} // remove padding
                >
                    <Avatar name={actualName + " " + actualSurname} boxSize='40px' bg='#feb2b2' color='#1a202c' />
                </Button>
            </Box>
        </Flex>

    );
};

export default Navbar;