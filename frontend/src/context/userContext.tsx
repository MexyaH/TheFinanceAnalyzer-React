import { createContext } from 'react';

type UserContextType = {
  actualName: string;
  actualSurname: string;
  actualRole: number;
  Userid: number;
  setUserData: (_name: string, _surname: string, role: number, Userid: number) => void;
  updateNameAndSurname: (newName: string, newSurname: string) => void;
  updateRole: (newRole: number) => void; // Add this line
  updateId: (newId: number) => void; // Add this line
};

const UserContext = createContext<UserContextType>({
  actualName: '',
  actualSurname: '',
  actualRole: 0,
  Userid: 0,
  setUserData: (_name: string, _surname: string, _role: number, Userid:number ) => {},
  updateNameAndSurname: (_newName: string, _newSurname: string) => {},
  updateRole: (_newRole: number) => {}, // Add this line
  updateId: (_newId: number) => {}, // Add this line
});

export default UserContext;