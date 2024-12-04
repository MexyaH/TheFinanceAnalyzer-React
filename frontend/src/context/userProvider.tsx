import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, collection, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import UserContext from './userContext';
import { useCustomToast } from '../components/showToast';


type UserProviderProps = {
    children: React.ReactNode;
  };

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [actualName, setActualName] = useState('');
  const [actualSurname, setActualSurname] = useState('');
  const [actualRole, setActualRole] = useState(0); // ['admin', 'user']
  const [Userid, setId] = useState(0); // ['admin', 'user']

  const setUserData = (name: string, surname: string, role:number, id: number) => {
    setActualName(name);
    setActualSurname(surname);
    setActualRole(role);
    setId(id);
  };

  const updateNameAndSurname = (newName: string, newSurname: string) => {
    setActualName(newName);
    setActualSurname(newSurname);
  };

  const updateRole = (role: number) => {
    setActualRole(role);

  };
  const updateId = (id: number) => {
    setId(id);
    //console.log(id);
  };

  const getMaxIdFromUsers = async () => {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    let maxId = 0;
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.id && data.id > maxId) {
        maxId = data.id;
      }
    });
    return maxId;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        //console.log(user);
        const userDoc = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDoc);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data().name, userDocSnap.data().surname, userDocSnap.data().role, userDocSnap.data().id );
          showSuccessToast("Record fetched correctly");
        } else {
          // showErrorToast("Something went wrong in fetching records");
          try {
            // Get the maximum id from the users collection
            const maxId = await getMaxIdFromUsers();
            const newId = maxId + 1;

            const newUser = {
              name: user.displayName || 'Anonymous',  // If displayName is available from Firebase Auth, use it
              surname: '',  // Set a default surname if needed
              role: 0,      // Default role: 1 (e.g., 'user')
              id: newId     // Assign a new unique id
            };
            await setDoc(userDoc, newUser);  // Create the new user in Firestore
            setUserData(newUser.name, newUser.surname, newUser.role, newUser.id);
            showSuccessToast("New user created successfully.");
          } catch (error) {
            showErrorToast("Failed to create new user.");
            console.error("Error creating user: ", error);
          }
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ actualName, actualSurname, actualRole, Userid, setUserData, updateNameAndSurname, updateRole, updateId}}>
  {children}
</UserContext.Provider>
  );
};