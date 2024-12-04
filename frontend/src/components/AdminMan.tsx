import DataGridTable from './Table';
import Navbar from './navbar';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, FormControl, Grid, IconButton, Input, Select, Text, useDisclosure } from '@chakra-ui/react';
import { GridColDef } from '@mui/x-data-grid';
import { auth, firestore } from '../firebase'; // import auth from your firebase configuration file
import { collection, getDocs, query, where, updateDoc, deleteDoc, DocumentSnapshot, DocumentData, Query} from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { MdDelete, MdEdit} from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useCustomToast } from './showToast';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import UserContext from '../context/userContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface Record {
    id: number;
    name: string;
    surname: string;
    role: number;
}

const AdminMan = () => {
  const navigate = useNavigate();
  const { actualRole , setUserData} = useContext(UserContext);
  const [users, setUsers] = useState<Record[]>([]);
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState(0);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const fetchRecords = async () => {
      
      const recordsUsersCollection = collection(firestore, 'users');
      const recordsUsersDocs = await getDocs(recordsUsersCollection);

      const fetchedRecords: any[] = [];
      recordsUsersDocs.forEach((doc) => {// Set the date to 'YYYY/MM/DD hh:mm' format
  
          fetchedRecords.push(doc.data());
      });
      setUsers(fetchedRecords);
      //console.log(fetchedRecords);
  };
  
  useEffect(() => {
  // Fetch records from Firestore database
      fetchRecords();
      //console.log(users.map((user) => user.id));
      if(actualRole !== 99) {
        navigate('/');
      }
  }, []);


  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenCreateUser, onOpen: onOpenCreateUser, onClose: onCloseCreateUser } = useDisclosure();
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const cancelRef = useRef<any>(null);
  const openModal = (record: Record) => {
      setSelectedRecord(record);
      console.log(record)
      onOpen();
  };

  const closeModal = () => {
    setSelectedRecord(null);
    onClose();
  };

  const onOpenEdit = (record: Record) => {
    
    setSelectedRecord(record);
    setIsOpenEdit(true);
  }
   const onCloseEdit = () => {
    setIsOpenEdit(false);
   }

  useEffect(() => {
    if (selectedRecord) {
      setName(selectedRecord.name);
      setSurname(selectedRecord.surname);
      setRole(selectedRecord.role);
    }
  }, [selectedRecord]);
  const deleteRecord = async () => {
    console.log(selectedRecord)
    if (selectedRecord) {
      const q = query(collection(firestore, "users"), where("id", "==", selectedRecord.id));

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        try {
          await deleteDoc(doc.ref);
          showSuccessToast(`The Record has been deleted.`);
        } catch (error) {
          showErrorToast("Error deleting record: " + error);
        }
      });

      fetchRecords();
      closeModal();
    }
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, mail, password);
      const newTableData = await fetchRecords();
      if (newTableData !== undefined) {
        setUsers(newTableData);
      }

      // Show success message and clear input fields
      showSuccessToast("User created successfully!");
      setName("");  // Clear the name input
      setSurname("");  // Clear the surname input
      onCloseCreateUser();  // Close the modal or reset form
    } catch (error) {
      showErrorToast("Mail already in use, Contact the server administrator");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    //console.log(selectedRecord?.id)
    //console.log(name, surname, role);
    event.preventDefault();
    const usersCollection = collection(firestore, "users");
    const recordsCollection = collection(firestore, "records");

    let qUser: Query<DocumentData> = query(usersCollection);
    let qRecords: Query<DocumentData> = query(recordsCollection);
    let docToUpdateUser: DocumentSnapshot<DocumentData> | null = null;
    let docToUpdateRecords: DocumentSnapshot<DocumentData> | null = null;

    if (selectedRecord) {
        qUser = query(usersCollection, where("id", "==", selectedRecord.id));
        qRecords = query(recordsCollection, where("idUser", "==", selectedRecord.id));
        
    
        
        const querySnapshotUser = await getDocs(qUser);
        //console.log(querySnapshot)
        querySnapshotUser.forEach((doc) => {
            //console.log(data)
            docToUpdateUser = doc;
        });
        const querySnapshotRecords = await getDocs(qRecords);
        //console.log(querySnapshot)
        querySnapshotRecords.forEach(async (doc) => {
            //console.log(data)
            docToUpdateRecords = doc;
            if (docToUpdateRecords) {
              const formData = {
                  tecnico: name + " " + surname,
                  role: role,
              };
        
              await updateDoc((docToUpdateRecords as DocumentSnapshot<DocumentData>).ref, formData);
          }
        });
    }

    

    if (docToUpdateUser) {
        const formData = {
            id: selectedRecord?.id,
            name : name,
            surname: surname,
            role: role,
        };

        await updateDoc((docToUpdateUser as DocumentSnapshot<DocumentData>).ref, formData);
        setUserData(name, surname, role, selectedRecord?.id || 99);
    }
    

    const newTableData = await fetchRecords();
    if (newTableData !== undefined) {
        setUsers(newTableData);
    }
    showSuccessToast("Form submitted successfully!");
    setName("");
    setSurname("");
    setRole(0);
    onCloseEdit();
  }

    
    
    const columns: GridColDef<Record>[] = [
        {
            field: 'id',
            headerName: 'id',
            headerClassName: 'super-app-theme--header',
        },
        
        {
          field: 'name',
          headerName: 'Nome',
          headerClassName: 'super-app-theme--header',
        },
    
        {
          field: 'surname',
          headerName: 'Cognome',
          headerClassName: 'super-app-theme--header',
          width: 350,
        },
        {
          field: 'role',
          headerName: 'Ruolo',
          headerClassName: 'super-app-theme--header',
          width: 150,
          renderCell: (params) => {
            const value = params.value as number;
            switch (value) {
                case 99: 
                    return <Text>Amministratore</Text>;
                default:
                    return <Text>Utente</Text>;
            }
            
          }
        },
        {
            field: 'edit',
            headerName: '',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            width: 10,
            renderCell: (params) => {
              return (
                <IconButton aria-label="edit" onClick={() => onOpenEdit(params.row)}>
                    <MdEdit size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center' }} />
                </IconButton>
              );
            },
        },
        {
            field: 'delete',
            headerName: '',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            width: 10,
            renderCell: (params) => {
              return (
                <IconButton aria-label="edit" onClick={() => openModal(params.row)}>
                  <MdDelete size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center' }} />
                </IconButton>
              );
            },
        },
    ]
  return (
    <>
        <Flex justifyContent="center" minHeight="50vh">
        <Box >
          <Navbar />
          <Box display="flex" justifyContent="center" marginTop={5}>
            <Button marginBottom={10} onClick={onOpenCreateUser} >Add User</Button>
          </Box>
          <DataGridTable rows={users} columns={columns} />
          <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          > 
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize='lg' fontWeight='bold' style={{ textAlign: 'center' }}>
                  Cancella assistenza
                </AlertDialogHeader>

                <AlertDialogBody style={{ textAlign: 'center' }}>
                  Sei sicuro?<br />
                  Non puoi tornare indietro!!.
                </AlertDialogBody>

                <AlertDialogFooter style={{ textAlign: 'center' }}>
                  <>
                    <Box display="flex" justifyContent="center" width="100%">
                      <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                      </Button>
                      <Button background='#e53e3e' onClick={deleteRecord} ml={3}>
                        Delete
                      </Button> 
                    </Box>
                  </>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex justifyContent="center" minHeight="10vh">
                <Box width="800px">
                  <Box border="1px solid grey" p={4} borderRadius="md">
                      <form onSubmit={handleSubmit}>
                        <Grid
                          templateColumns="repeat(1, 1fr)"
                          gap={6}
                        >
                          <FormControl id="Cliente" mb={3}>
                            <Text mb={1} textAlign="center">Name:</Text>
                            <Input
                              type="text"
                              value={name}
                              onChange={(e) => {setName(e.target.value)}}
                              //placeholder={selectedRecord?.name || "Nome"}
                            />
                          </FormControl>
                          <FormControl id="Ruolo" mb={3}>
                            <Text mb={1} textAlign="center">Surname:</Text>
                            <Input
                              type="text"
                              value={surname}
                              onChange={(e) => setSurname(e.target.value)}
                              //placeholder={selectedRecord?.surname || "Cognome"}
                              
                            />
                          </FormControl>
                          <FormControl id="Ruolo" mb={3}>
                            <Text mb={1} textAlign="center">Ruolo:</Text>
                            <Select
                              value={role}
                              onChange={(e) => setRole(parseInt(e.target.value))}
                              
                            >
                              <option value={0}>Utente</option>
                              <option value={99}>Amministratore</option>
                            </Select>
                          </FormControl>
                          <Button type="submit">Submit</Button>
                        </Grid>
                      </form>
                  </Box>
                </Box>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal isOpen={isOpenCreateUser} onClose={onCloseCreateUser}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex justifyContent="center" minHeight="10vh">
                <Box width="800px">
                  <Box border="1px solid grey" p={4} borderRadius="md" m={6} mb={10}>
                      <form onSubmit={handleCreateUser}>
                        <Grid
                          templateColumns="repeat(1, 1fr)"
                          gap={6}
                        >
                          <FormControl id="Cliente" mb={3}>
                            <Text mb={1} textAlign="center">Mail:</Text>
                            <Input
                              type="mail"
                              onChange={(e) => {setMail(e.target.value)}}
                              //placeholder={selectedRecord?.name || "Nome"}
                            />
                          </FormControl>
                          <FormControl id="Ruolo" mb={3}>
                            <Text mb={1} textAlign="center">Password:</Text>
                            <Input
                              type="password"
                              onChange={(e) => setPassword(e.target.value)}
                              //placeholder={selectedRecord?.surname || "Cognome"}
                              
                            />
                          </FormControl>
                          <Button type="submit">Create</Button>
                        </Grid>
                      </form>
                  </Box>
                </Box>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
      </Flex >
    </>
  )/*
    return (
        <div>fdfs</div>
    );*/
}

export default AdminMan
