import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useRoutes } from 'react-router-dom';
import LoginPage from './components/login'
import HomePage from './components/homepage';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Details from './components/details';

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
    { path: '/details/:category', element: <Details /> },

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
