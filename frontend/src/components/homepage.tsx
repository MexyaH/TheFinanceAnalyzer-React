import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase'; // import auth from your firebase configuration file
import { collection, deleteDoc, getDocs, query, Timestamp, where } from 'firebase/firestore';
import DataGridTable from './Table';
import Navbar from './navbar';
import { Box, Button, Flex, IconButton, useDisclosure } from '@chakra-ui/react';
import { GridColDef } from '@mui/x-data-grid';
import { MdDelete, MdEdit, MdSearch } from "react-icons/md";
import { useCustomToast } from './showToast';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import UserContext from "../context/userContext";

interface Record {
  id: string;
  status: number;
  commessa: string;
  cliente: string;
  macchina: string;
  date: Date;
  dateMod: Date;
  tecnico: string;
  veicolo: any;
}

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [notYours, setNotYours] = useState(false); // [true, false]
  const { actualName, actualSurname, actualRole} = useContext(UserContext);
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [records, setRecords] = useState<Record[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const cancelRef = React.useRef<any>(null);
  const openModal = (record: Record) => {
    setSelectedRecord(record);
    //console.log(record)
    onOpen();
  };

  const closeModal = () => {
    setSelectedRecord(null);
    onClose();
  };

  const deleteRecord = async () => {
    if (selectedRecord) {
      const q = query(collection(firestore, "records"), where("id", "==", selectedRecord.id));

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

  const fetchRecords = async () => {
    const recordsCollection = collection(firestore, 'operazioni');
    const recordsDocs = await getDocs(recordsCollection);
    const fetchedRecords: any[] = [];
    recordsDocs.forEach((doc) => {
      const data = doc.data();
      fetchedRecords.push(data);
    });
    setRecords(fetchedRecords);
    console.log(fetchedRecords)
  };

  useEffect(() => {
    // Fetch records from Firestore database
    fetchRecords();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    console.log(date)
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const actualNameSurname = actualName + " " + actualSurname;

  const columns: GridColDef<Record>[] = [
    {
      field: 'nomeCliente',
      headerName: 'Cliente',
      headerClassName: 'super-app-theme--header',
      //width: 150,
      //editable: true,
    },
    {
      field: 'titolo',
      headerName: 'Intervento',
      headerClassName: 'super-app-theme--header',
      width: 500
    }, 
    {
      field: 'veicoloMarca',
      headerName: 'Marca Veicolo',
      headerClassName: 'super-app-theme--header',
      width: 200,
      renderCell(params) {
        console.log(params)
        return params.row.veicolo.marca;
        
      },
      //editable: true,
    },
    {
      field: 'veicoloModello',
      headerName: 'Modello Veicolo',
      headerClassName: 'super-app-theme--header',
      //type: 'number',
      width: 150,
      renderCell(params) {
        console.log(params)
        return params.row.veicolo.modello;        
      },
      //editable: true,
    },
    {
      field: 'dataInizio',
      headerName: 'Data inizio int.',
      headerClassName: 'super-app-theme--header',
      width: 150,
      renderCell(params) {
        return formatDate(params.value)
      },
      //editable: true,
    },
    {
      field: 'stato',
      headerName: 'Stato',
      headerClassName: 'super-app-theme--header',
      width: 50,
      renderCell(params) {
        console.log(params.value)
        if (params.value.completed === true){
          return '🟢'
        }else if (params.value.standby){
          return '🟡'
        }else if (params.value.problem){
          return '🟠'
        }else if (params.value.inCorso){
          return '🔵'
        }else if (params.value.canceled){
          return '🔴'
        }
        // switch 
      },
      //editable: true,
    },
    {
      field: 'edit',
      headerName: '',
      headerClassName: 'super-app-theme--header',
      sortable: false,
      width: 10,
      renderCell: (params) => {
        const onClick = () => {
          const id = params.row.id;
          navigate('/edit/' + id, { state: { record: params.row } });
        };
        
        // Check if the content of the row is equal to something
        if (params.row.tecnico === (actualName + " " + actualSurname)) {
          return (
            <IconButton aria-label="edit" onClick={onClick}>
              <MdEdit size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center' }} />
            </IconButton>
          );
        }
        if (actualRole == 99) {
          return (
            <IconButton aria-label="edit" onClick={onClick}>
              <MdEdit size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center', color:'red' }} />
            </IconButton>
          );
        }
        
        // Return null or an empty element if the condition is not met
        return null;
      },
    },
    {
      field: 'show',
      headerName: '',
      headerClassName: 'super-app-theme--header',
      sortable: false,
      width: 10,
      renderCell: (params) => {
        const onClick = () => {
          const id = params.row.id;
          navigate('/show/' + id, { state: { record: params.row } });
        };

        return (
          <IconButton aria-label="show" onClick={onClick}>
            <MdSearch size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center' }} />
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
        if (params.row.tecnico === actualNameSurname || actualRole === 99) {
          return (
            <IconButton aria-label="edit" onClick={() => {openModal(params.row); setNotYours(true)}} style={{ color: params.row.tecnico != actualNameSurname ? '#ff0000' : 'inherit' }}>
              <MdDelete size={"25px"} style={{ verticalAlign: 'middle', textAlign: 'center' }} />
            </IconButton>
          );
        }
        //console.log(params.row.tecnico)
        
        // Return null or an empty element if the condition is not met
        return null;
      },
    },
  ];
  //console.log(records)
  return (
    <Flex justifyContent="center" minHeight="100vh">
      <Box >
        <Navbar />
        <DataGridTable rows={records} columns={columns} />
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
                Non puoi tornare indietro!!.<br />
                {notYours == true ? 'P.S. Questa manutenzione non è stata inserita da te' : ''}
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
    </Box>
    </Flex >
  );
};

export default Homepage;