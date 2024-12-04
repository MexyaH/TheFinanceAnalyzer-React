import React, { useState, useEffect } from 'react';
//import AuthContext from './context/AuthContext';
import { BrowserRouter as Router, useNavigate, useRoutes } from 'react-router-dom';
import LoginPage from './components/login'
import HomePage from './components/homepage';
import AddRecord from './components/addRecord';
import AddClient from './components/addClient';
import DetailsPage from './components/details';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/react';
//import './App.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import WaitingRoom from './components/waitingRoom';
import UserProfilePage from './components/userProfilePage';
import EditPage from './components/edit';
import FilesManager from './components/fileMan';
import AdminMan from './components/AdminMan';
import Backup from './components/backup';
//import EditUser from './components/EditUser';

const RoutesComponent = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLogged(true);
      } else {
        setIsLogged(false);
        navigate('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const element = useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/', element: <HomePage /> },
    { path: '/wait', element: <WaitingRoom /> },
    { path: '/addAssistance', element: <AddRecord /> },
    { path: '/addClient', element: <AddClient /> },
    { path: '/profile', element: <UserProfilePage /> },
    { path: '/show/:id', element: <DetailsPage /> },
    { path: '/edit/:id', element: <EditPage /> },
    // { path: '/filemanager', element: <FilesManager /> }, // Use the imported component
    { path: '/userman', element: <AdminMan /> },
    // { path: '/backup', element: <Backup /> },
    //{ path: '/edituser/:id', element: <EditUser /> },
  ]);

  return isLogged ? element : <LoginPage />;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 3000 milliseconds = 3 seconds
  }, []);

  const theme = extendTheme({
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner
          thickness='4px'
          speed='0.65s'
          color='#d9e70c'
          size='xl'
          style={{ marginBottom: '20px' }}
        />
        <p>Loading... Please wait</p>
      </div>
    );
  }

  return (
    <Router>
      <ChakraProvider theme={theme}>
        <RoutesComponent />
      </ChakraProvider>
    </Router>
  );
};

export default App;