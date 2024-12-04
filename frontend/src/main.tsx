import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import { extendTheme } from '@chakra-ui/react'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageProvider';
import { UserProvider } from './context/userProvider.tsx'
// Somewhere in your `index.ts`:

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({ colors })

// 3. Pass the `theme` prop to the `ChakraProvider`

const rootElement = document.getElementById('root')!
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
    <LanguageProvider>
    <UserProvider>
      <App />
      </UserProvider>
    </LanguageProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
