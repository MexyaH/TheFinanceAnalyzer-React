import React, { useState, useEffect } from 'react';
import AuthContext from './context/AuthContext';
import { BrowserRouter as Router, useNavigate, /*Routes, Route,*/ useRoutes } from 'react-router-dom';
import LoginPage from './components/login'
import HomePage from './components/homepage';
import ReviewForm from './components/addRecord';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/react';
import './App.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import WaitingRoom from './components/waitingRoom';


const App: React.FC = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, user => {
  //     setIsLogged(!!user);
  //     setTimeout(() => {
  //       setIsLoading(false);
  //     }, 3000); // 3000 milliseconds = 3 seconds
  //   });

  //   return () => unsubscribe();
  // }, [auth]);

  const navigate = useNavigate();

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

  const login = () => setIsLogged(true);
  const logout = () => setIsLogged(false);

  const RoutesComponent = () => {
    const element = useRoutes([
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <HomePage /> },
      { path: '/wait', element: <WaitingRoom /> },
      { path: '/form', element: <ReviewForm /> }, // Add this line
    ]);  
    return isLogged ? element : <LoginPage />;
  };

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
      <AuthContext.Provider value={{ isLogged, login, logout }}>
              <RoutesComponent />
      </AuthContext.Provider>
    </ChakraProvider>
    </Router>
  );
};

export default App;