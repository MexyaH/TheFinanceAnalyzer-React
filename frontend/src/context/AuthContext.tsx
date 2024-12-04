import { createContext, useState, ReactNode } from 'react';

interface User {
  displayName: string;
  email: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({
  user: null as User | null,
  login: (user: User) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;