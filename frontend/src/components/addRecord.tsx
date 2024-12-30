import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  FormControl,
  Text,
  HStack,
  Textarea,
  Button,
  Select,
  Grid,
  Flex,
  Input,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  Spinner,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { useCustomToast } from "./showToast";
import Navbar from "./navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase"; // import auth from your firebase configuration file
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import FieldTitle from "./standardTitle";

interface Pezzi {
  name: string;
  price: number;
  qta: number;
  fornitor: string;
}
interface Acconti {
  date: Date;
  payment: string;
  amount: number;
}
interface Interventi {
  date: Date;
  amount: number;
  title: string;
}

const addAssistance: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [recordsIds, setRecordsIds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientiList, setClientiList] = useState<string[]>([]);
  const [clienteSelected, setClienteSelected] = useState<string>("");
  const [oreLavorate, setOreLavorate] = useState<number>(0.5);
  const [dataInizio] = useState<Date>(new Date());
  const [dataFine] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [interventi, setInterventi] = useState<Interventi[]>([]);
  const [uploadProgressPreventivo, setUploadProgressPreventivo] =
    useState<number>(0);
  const [filePreventivo, setFilePreventivo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [pathPreventivo, setPathPreventivo] = useState<string>("");
  const [pezzi, setPezzi] = useState<Pezzi[]>([]);
  const [acconti, setAcconti] = useState<Acconti[]>([]);
  const [inputKey] = useState(Math.random().toString());

  const [annoVeicolo, setAnnoVeicolo] = useState<string>("");
  const [marcaVeicolo, setMarcaVeicolo] = useState<string>("");
  const [modelloVeicolo, setModelloVeicolo] = useState<string>("");
  const [cavalliVeicolo, setCavalliVeicolo] = useState<string>("");
  const [targaVeicolo, setTargaVeicolo] = useState<string>("");
  const [kmVeicolo, setKmVeicolo] = useState<string>("");
  const [tipoMotore, setTipoMotore] = useState<string>("");
  const [vimVeicolo, setVimVeicolo] = useState<string>("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [qta, setQta] = useState<number | null>(null);
  const [fornitor, setFornitor] = useState("");

  const [date, setDate] = useState(new Date());
  const [payment, setPayment] = useState("");
  const [amount, setAmount] = useState<number | null>(null);

  const [dateInt, setDateInt] = useState(new Date());
  const [title, setTitle] = useState("");
  const [amountInt, setAmountInt] = useState<number | null>(null);

  const fetchClienti = async () => {
    const recordsUsersCollection = collection(firestore, "clienti");
    const recordsUsersDocs = await getDocs(recordsUsersCollection);
    const wholeRecord = recordsUsersDocs.docs.map((doc) => doc.data());
    const clienti: any[] = [];
    wholeRecord.forEach((record: any) => {
      clienti.push(record.nomeCompleto);
    });
    setClientiList(clienti);
  };

  const fetchRecords = async () => {
    const recordsCollection = collection(firestore, "operazioni");
    const recordsDocs = await getDocs(recordsCollection);
    const wholeRecord = recordsDocs.docs.map((doc) => doc.data());
    const records: any[] = [];
    wholeRecord.forEach((record: any) => {
      records.push(record.id);
    });
    setRecordsIds(records);
  };

  const fetchAll = async () => {
    await fetchClienti();
    await fetchRecords();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAll();
    setIsLoading(false);
  }, []);

  const handleFileChange = () => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFilePreventivo(file || null);
  };

  const url = new URL(window.location.origin);
  url.port = "3005";

  const handleUploadPreventivo = async () => {
    setUploadProgressPreventivo(0);
    if (!filePreventivo) {
      showErrorToast("No file selected.");
      return;
    }
    const FileInfo = {
      cliente: clienteSelected,
      vimVeicolo: vimVeicolo,
    };
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", filePreventivo);
    formData.append("fileInfo", JSON.stringify(FileInfo));
    try {
      const response = await axios.post(`${url.toString()}upload`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgressPreventivo(percentCompleted);
          }
        },
      });
      setPathPreventivo(response.data.filePath);
      showSuccessToast("PLC salvato correttamente.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showErrorToast("Error: " + error.response?.data.error);
      } else if (error instanceof Error) {
        showErrorToast("Error: " + error.message);
      }
    }
  };

  // const optionsCliente = [
  //     { value: "", text: { it: " Inserisci un valore", en: " Insert a value" } },
  //     { value: "Conagra Oakdale USA", text: { it: "Conagra Oakdale USA", en: "Conagra Oakdale USA" } },
  //     { value: "Steriltom", text: { it: "Steriltom", en: "Steriltom" } },
  //     { value: "Sugal", text: { it: "Sugal", en: "Sugal" } },
  //     { value: "Martinete", text: { it: "Martinete", en: "Martinete" } },
  //     { value: "Tomatek", text: { it: "Tomatek", en: "Tomatek" } },
  //     { value: "Tamek Salihli", text: { it: "Tamek Salihli", en: "Tamek Salihli" } },
  //     { value: "Los Gatos", text: { it: "Los Gatos", en: "Los Gatos" } },
  //     { value: "Treko", text: { it: "Treko", en: "Treko" } },
  //     { value: "Alsat", text: { it: "Alsat", en: "Alsat" } },
  //     { value: "Apis Carnes", text: { it: "Apis Carnes", en: "Apis Carnes" } },
  //     { value: "Conagra Canada", text: { it: "Conagra Canada", en: "Conagra Canada" } },
  // ];

  // const optionsOreLav = Array.from({ length: 48 }, (_, i) => {
  //     const value = (i + 1) * 0.5;
  //     return { value, text: { it: value.toString(), en: value.toString() } };
  // });

  // const optionsTipoIntervento = [
  //     { value: "", text: { it: " Inserisci un valore", en: " Insert a value" } },
  //     { value: 0, text: { it: "Assistenza", en: "Assistenza" } },
  //     { value: 1, text: { it: "Non risolutivo (Rimandabile)", en: "Non risolutivo (Rimandabile)" } },
  //     { value: 2, text: { it: "Non risolutivo (Urgente)", en: "Non risolutivo (Urgente)" } },
  //     { value: 3, text: { it: "Risolutivo", en: "Risolutivo" } },
  // ];

  // const anotherOptions = problemsList
  //     .filter(problem => problem.cliente === cliente && problem.commessa === commessa && problem.machine === machine)
  //     .filter(problem => problem.status === 1)
  //     .map((problem) => ({
  //         value: problem.desc,
  //         text: {
  //             it: problem.desc,
  //             en: problem.desc,
  //         },
  //     }));

  // const mappings = [
  //     { cliente: "", commessa: "", machine: "", SW: 0 },
  //     { cliente: "Conagra Oakdale USA", commessa: "O22050", machine: "", SW: 1 },
  //     { cliente: "Conagra Oakdale USA", commessa: "O22050", machine: "Thor M3", SW: 1 },
  //     { cliente: "Conagra Oakdale USA", commessa: "O22050", machine: "Thor M6", SW: 1 },
  //     { cliente: "Steriltom", commessa: "O22066", machine: "Thor M2+2+2", SW: 2 },
  //     { cliente: "Sugal", commessa: "O22089", machine: "Thor M3", SW: 2 },
  //     { cliente: "Martinete", commessa: "", machine: "", SW: 0 },
  //     { cliente: "Martinete", commessa: "O23021", machine: "Linea HBO 350", SW: 0 },
  //     { cliente: "Martinete", commessa: "O23091", machine: "Sterilizzatore", SW: 0 },
  //     { cliente: "Tomatek", commessa: "O23051", machine: "Thor M6", SW: 1 },
  //     { cliente: "Tamek Salihli", commessa: "O23068", machine: "", SW: 0 },
  //     { cliente: "Tamek Salihli", commessa: "O23068", machine: "Evaporatore", SW: 0 },
  //     { cliente: "Tamek Salihli", commessa: "O23068", machine: "Linea HBV 500", SW: 0 },
  //     { cliente: "Los Gatos", commessa: "O23078", machine: "", SW: 0 },
  //     { cliente: "Los Gatos", commessa: "O23078", machine: "Linea HBV 500", SW: 1 },
  //     { cliente: "Los Gatos", commessa: "O23078", machine: "Thor M3+3", SW: 1 },
  //     { cliente: "Treko", commessa: "O23087", machine: "Sterilizzatore", SW: 2 },
  //     { cliente: "Alsat", commessa: "O23090", machine: "", SW: 0 },
  //     { cliente: "Alsat", commessa: "O23090", machine: "Metis", SW: 0 },
  //     { cliente: "Alsat", commessa: "O23090", machine: "Thor M6", SW: 0 },
  //     { cliente: "Apis Carnes", commessa: "O23095", machine: "Linea HBT 450", SW: 0 },
  //     { cliente: "Conagra Canada", commessa: "O24026", machine: "Riempitrice", SW: 1 },
  // ];

  // // #endregion

  // // #region handleChanges

  // const resetForm = () => {
  //     setCliente('');
  //     setCommessa('');
  //     setDate(new Date());
  //     setNote('');
  //     setOreLavorate(0.5);
  //     setTipoIntervento('');
  //     setMachine("");
  //     setMachineOptions([]);
  //     setCommessaOptions([]);
  //     setSw(0);
  //     setFilePLC(null);
  //     setFileHMI(null);
  //     setFileSCHEMA(null);
  //     setUploadProgressPLC(0);
  //     setUploadProgressHMI(0);
  //     setUploadProgressSCHEMA(0);
  //     setFilePathPLC('');
  //     setFilePathHMI('');
  //     setIsUploading(false);
  //     setIsClickedPLC(false);
  //     setIsClickedHMI(false);
  //     setProblem('');
  // };

  // const updateRecord = async () => {
  //     const problemsCollection = collection(firestore, 'problems');
  //     const q = query(problemsCollection,
  //         where("cliente", "==", cliente),
  //         where("machine", "==", machine),
  //         where("commessa", "==", commessa),
  //         where("desc", "==", problem),
  //     );

  //     const querySnapshot = await getDocs(q);
  //     querySnapshot.forEach(async (docSnapshot) => {
  //         const docRef = doc(firestore, 'problems', docSnapshot.id);
  //         await updateDoc(docRef, { status: 2 });
  //     });
  // }

  // const handleSubmit = async (event: React.FormEvent) => {
  //     event.preventDefault();
  //     if (uploadProgressPLC !== 100 && sw !== 0) {
  //         showErrorToast('Non hai caricato il software PLC.');
  //         setIsClickedPLC(true);
  //         return;
  //     }
  //     if (uploadProgressHMI !== 100 && sw === 1) {
  //         showErrorToast('Non hai caricato il software HMI.');
  //         setIsClickedHMI(true);
  //         return;
  //     }
  //     /*
  //     if (uploadProgressSCHEMA !== 100) {
  //         showErrorToast('Non hai caricato lo Schema Elettrico.');
  //         setIsClickedSchema(true);
  //         return;
  //     }*/

  //     if ((problem === 'new' || problem === '') && Number(tipoIntervento) > 0) {
  //         showErrorToast('Inserisci un problema.');
  //         return;
  //     }
  //     const recordsCollection = collection(firestore, 'records');
  //     const recordsDocs = await getDocs(recordsCollection);
  //     let maxId = 0;
  //     recordsDocs.forEach((docSnapshot) => {
  //         const data = docSnapshot.data();
  //         if (data.id > maxId) {
  //             maxId = data.id;
  //         }
  //     });

  //     const id = maxId + 1;

  //     const formData = {
  //         id: id,
  //         idUser: Userid,
  //         cliente: cliente,
  //         commessa: commessa,
  //         macchina: machine,
  //         ourCommessa: ourCommessa,
  //         oreLavorate: oreLavorate,
  //         date: date,
  //         dateMod: new Date(),
  //         tipoIntervento: tipoIntervento,
  //         problem: problem,
  //         sw: sw,
  //         filePathPLC: filePathPLC,
  //         filePathHMI: filePathHMI,
  //         filePathSCHEMA: filePathSCHEMA,
  //         note: note,
  //         tecnico: actualName + " " + actualSurname,
  //         tecnicoCliente: tecnicoCliente
  //       }

  //     await addDoc(recordsCollection, formData);
  //     if (Number(tipoIntervento) === 3) {
  //         await updateRecord();
  //         await fetchProblems();
  //         await fetchTecnicoCliente();
  //     }

  //     //console.log(JSON.stringify(formData, null, 2));
  //     showSuccessToast("Form submitted successfully!");
  //     resetForm();
  //     navigate('/');
  // };

  // const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //     const selectedCliente = event.target.value;
  //     setCliente(selectedCliente);
  //     const selectedMappings = mappings.filter(m => m.cliente === selectedCliente);
  //     const machineOptions = selectedMappings.map(m => m.machine);
  //     const commessaOptions = selectedMappings
  //         .map(m => m.commessa)
  //         .filter((value, index, self) => self.indexOf(value) === index);
  //     setMachineOptions(machineOptions);
  //     setCommessaOptions(commessaOptions);
  //     if (selectedMappings.length > 0) {
  //         const firstMapping = selectedMappings[0];
  //         setCommessa(firstMapping.commessa);
  //         setMachine(firstMapping.machine);
  //         setSw(firstMapping.SW);
  //     }
  // };

  // const handleMachineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  //     const selectedClienteMappings = mappings.filter(m => m.cliente === cliente);
  //     const selectedMachine = event.target.value;
  //     setMachine(selectedMachine);
  //     const selectedMappings = selectedClienteMappings.filter(m => m.machine === selectedMachine);
  //     //const commessaOptions = selectedMappings.map(m => m.commessa);
  //     //setCommessaOptions(commessaOptions);
  //     if (selectedMappings.length > 0) {
  //         const firstMapping = selectedMappings[0];
  //         setCommessa(firstMapping.commessa);
  //         setSw(firstMapping.SW);
  //     }
  // };

  // const handleChangeTecnicoCliente = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //     setTecnicoCliente(event.target.value)
  //     if (event.target.value === 'crea') {
  //         setshowTecnicoInput(true);
  //     }else{
  //         setshowTecnicoInput(false);
  //     }
  //     //console.log(event.target.value)
  // }

  // const handleFileChange = (resource: string) => (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0];
  //     switch (resource) {
  //         case "PLC":
  //             //console.log(file);
  //             setFilePLC(file || null);
  //             break;
  //         case "HMI":
  //             //le.log(file);
  //             setFileHMI(file || null);
  //             break;
  //         case "SCHEMA":
  //             //console.log(file);
  //             setFileSCHEMA(file || null);
  //             break;

  //     }
  //     // Do something with the file
  //   };

  // const handleCreateProblems = async () => {
  //     if (!newProblem) {
  //         showErrorToast('Please enter a problem description.');
  //         return;
  //     }
  //     if (!cliente) {
  //         showErrorToast('Please select a client');
  //         return;
  //     }
  //     if (!commessa) {
  //         showErrorToast('Please select a commessa');
  //         return;
  //     }
  //     if (!machine) {
  //         showErrorToast('Please select a machine');
  //         return;
  //     }
  //     const problemsCollection = collection(firestore, 'problems');
  //     await addDoc(problemsCollection, {
  //         desc: newProblem, status: 1, cliente: cliente,
  //         commessa: commessa, machine: machine
  //     });

  //     fetchProblems();
  //     setProblem(newProblem);
  //     showSuccessToast('Problema creato correttamente');
  //     // set the value of the Select to the ID of the new problem
  //     setNewProblem('');
  // };

  // const handleCreateTecnicoCliente = async () => {
  //     //console.log(newTecnicoCliente)
  //     const TecnicoCollection = collection(firestore, 'tecnicocliente');
  //     await addDoc(TecnicoCollection, {
  //         tecnicocliente: newTecnicoCliente,
  //     });

  //     fetchTecnicoCliente();
  //     setTecnicoCliente(newTecnicoCliente);
  //     setshowTecnicoInput(false);
  //     setTecnicoClienteList([newTecnicoCliente]); // Change the type of tecnicoClienteList to string[]
  //     showSuccessToast('Tecnico Cliente creato correttamente');
  //     // set the value of the Select to the ID of the new problem
  //     setNewTecnicoCliente('');
  // };

  // // #endregion
  // const url = new URL(window.location.origin);
  // url.port = '3005';
  // //console.log(url.toString());

  // // #region fileUpload
  // const handleUploadPLC = async () => {
  //     setUploadProgressPLC(0);
  //     if (!filePLC) {
  //         showErrorToast('No file selected.');
  //         return;
  //     }
  //     const FileInfo = {
  //       cliente: cliente,
  //       commessa: commessa,
  //       machine: machine,
  //       type: "31_Plc",
  //     };
  //     setIsUploading(true);
  //     const formData = new FormData();
  //     formData.append('file', filePLC);
  //     formData.append("fileInfo", JSON.stringify(FileInfo));
  //     try {
  //         const response = await axios.post(`${url.toString()}upload`, formData, {
  //             onUploadProgress: (progressEvent) => {
  //                 if (progressEvent.total) {
  //                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //                     setUploadProgressPLC(percentCompleted);
  //                 }
  //             },
  //         });
  //         setFilePathPLC(response.data.filePath);
  //         showSuccessToast('PLC salvato correttamente.');
  //         setIsClickedPLC(false);
  //     } catch (error) {
  //         if (axios.isAxiosError(error)) {
  //             showErrorToast('Error: ' + error.response?.data.error);
  //         } else if (error instanceof Error) {
  //             showErrorToast('Error: ' + error.message);
  //         }
  //     }
  // };
  // const handleUploadHMI = async () => {
  //     setUploadProgressHMI(0);
  //     if (!fileHMI) {
  //         showErrorToast('No file selected.');
  //         return;
  //     }
  //     const FileInfo = {
  //       cliente: cliente,
  //       commessa: commessa,
  //       machine: machine,
  //       type: "32_HMI",
  //     };
  //     setIsUploading(true);
  //     const formData = new FormData();
  //     formData.append('file', fileHMI);
  //     formData.append("fileInfo", JSON.stringify(FileInfo));
  //     try {
  //         const response = await axios.post(`${url.toString()}upload`, formData, {
  //             onUploadProgress: (progressEvent) => {
  //                 if (progressEvent.total) {
  //                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //                     setUploadProgressHMI(percentCompleted);
  //                 }
  //             },
  //         });
  //         setFilePathHMI(response.data.filePath);
  //         showSuccessToast('HMI salvato correttamente.');
  //         setIsClickedHMI(false);
  //     } catch (error) {
  //         if (axios.isAxiosError(error)) {
  //             showErrorToast('Error: ' + error.response?.data.error);
  //         } else if (error instanceof Error) {
  //             showErrorToast('Error: ' + error.message);
  //         }
  //     }
  // };

  // const handleUploadSchema = async () => {
  //     setUploadProgressSCHEMA(0);
  //     if (!fileSCHEMA) {
  //         showErrorToast('No file selected.');
  //         return;
  //     }
  //     const FileInfo = {
  //       cliente: cliente,
  //       commessa: commessa,
  //       machine: machine,
  //       type: "05_Schema",
  //     };
  //     setIsUploading(true);
  //     const formData = new FormData();
  //     formData.append('file', fileSCHEMA);
  //     formData.append("fileInfo", JSON.stringify(FileInfo));
  //     try {
  //         const response = await axios.post(`${url.toString()}upload`, formData, {
  //             onUploadProgress: (progressEvent) => {
  //                 if (progressEvent.total) {
  //                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //                     setUploadProgressSCHEMA(percentCompleted);
  //                 }
  //             },
  //         });
  //         setFilePathSCHEMA(response.data.filePath);
  //         showSuccessToast('Schema salvato correttamente.');
  //         //setIsClickedSchema(false);
  //     } catch (error) {
  //         if (axios.isAxiosError(error)) {
  //             showErrorToast('Error: ' + error.response?.data.error);
  //         } else if (error instanceof Error) {
  //             showErrorToast('Error: ' + error.message);
  //         }
  //     }
  // #endregion

  const handleAddPezzo = async () => {
    if (name && price && qta && fornitor) {
      setPezzi([
        ...pezzi,
        {
          name: name,
          price: price,
          qta: qta,
          fornitor: fornitor,
        },
      ]);
      console.log(pezzi);
      setName("");
      setPrice(0.0);
      setQta(0);
      setFornitor("");
    } else {
      showErrorToast("Inserisci tutti i parametri del pezzo da aggiungere");
    }
  };

  const handleAddAcconto = async () => {
    if (date && payment && amount) {
      setAcconti([
        ...acconti,
        {
          date: date,
          payment: payment,
          amount: amount,
        },
      ]);
      setDate(new Date());
      setPayment("");
      setAmount(0);
    } else {
      showErrorToast("Inserisci tutti i parametri dell'acconto da aggiungere");
    }
  };

  const handleAddIntervento = async () => {
    if (dateInt && title && amountInt) {
      setInterventi([
        ...interventi,
        {
          date: dateInt,
          title: title,
          amount: amountInt,
        },
      ]);
      setDateInt(new Date());
      setTitle("");
      setAmountInt(0);
    } else {
      showErrorToast(
        "Inserisci tutti i parametri dell'intervento da aggiungere"
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const id = recordsIds[recordsIds.length - 1] + 1;
    const formData = {
      id: id,
      nomeCliente: clienteSelected,
      interventi: interventi,
      pezzi: pezzi,
      acconti: acconti,
      dataInizio: dataInizio,
      dataFine: dataFine,
      oreLav: oreLavorate,
      note: note,
      veicolo: {
        vim: vimVeicolo,
        marca: marcaVeicolo,
        modello: modelloVeicolo,
        targa: targaVeicolo,
        km: kmVeicolo,
        cavalli: cavalliVeicolo,
        tipomotore: tipoMotore,
        anno: annoVeicolo,
      },
      pathPreventivo: pathPreventivo,
      pathFattura: "",
      stato: {
        canceled: false,
        completed: false,
        inCorso: true,
        problem: false,
        standby: false,
      },
    };
    await setDoc(doc(firestore, "operazioni", id.toString()), formData)
      .then(() => {
        showSuccessToast("Form submitted successfully!");
        navigate("/");
      })
      .catch(() => {
        showErrorToast("Qualcosa é andato storto, riprova!");
      });
    setIsLoading(false);
  };
  useEffect(() => {
    console.log(vimVeicolo);
  }, [vimVeicolo]);

  return (
    <div>
      <Flex justifyContent="center" minHeight="100vh" width={"100%"}>
        <Box width="100%">
          <Navbar />
          <Grid
            templateColumns={["1fr", "70% 30%"]}
            gap={6}
            width="100%"
            p={10}
          >
            <Box border="1px solid grey" p={4} borderRadius="md">
              <form onSubmit={handleSubmit}>
                <Flex justifyContent="center" alignItems="center" mb={10}>
                  <Heading size="lg">Nuovo Intervento</Heading>
                </Flex>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)"]}
                  gap={6}
                >
                    <Box>
                        <FieldTitle title="Cliente" />
                        <Select
                            value={clienteSelected}
                            onChange={(e) => setClienteSelected(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                            Seleziona un cliente
                            </option>
                            {clientiList.map((cliente) => (
                            <option key={cliente} value={cliente}>
                                {cliente}
                            </option>
                            ))}
                        </Select>
                    </Box>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(5, 1fr)"]}
                  gap={4}
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Marca" />
                        <Input
                            value={marcaVeicolo}
                            onChange={(e) => setMarcaVeicolo(e.target.value)}
                            placeholder="Marca Veicolo"
                            type="text"
                            required
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Modello" />
                        <Input
                            value={modelloVeicolo}
                            onChange={(e) => setModelloVeicolo(e.target.value)}
                            placeholder="Modello Veicolo"
                            type="text"
                            required
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Vim" />
                        <Input
                            value={vimVeicolo}
                            onChange={(e) => setVimVeicolo(e.target.value)}
                            placeholder="vim Veicolo"
                            type="text"
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Targa" />
                        <Input
                            value={targaVeicolo}
                            onChange={(e) => setTargaVeicolo(e.target.value)}
                            placeholder="Targa Veicolo"
                            type="text"
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Chilometraggio" />
                        <Input
                            value={kmVeicolo}
                            onChange={(e) => setKmVeicolo(e.target.value)}
                            placeholder="Km Veicolo"
                            type="number"
                        />
                    </Box>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
                  gap={6}
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Cavalli" />
                        <Input
                            value={cavalliVeicolo}
                            onChange={(e) => setCavalliVeicolo(e.target.value)}
                            placeholder="Cavalli Veicolo"
                            type="number"
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Anno" />
                        <Input
                            value={annoVeicolo}
                            onChange={(e) => setAnnoVeicolo(e.target.value)}
                            placeholder="Anno Veicolo"
                            type="number"
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Ore lavorate" />
                        <Select
                            value={oreLavorate}
                            onChange={(e) => setOreLavorate(parseInt(e.target.value))}
                            required
                        >
                            <option value={0} selected disabled>
                            Ore Lavorate
                            </option>
                            {Array.from({ length: 72 }, (_, i) => {
                            const value = i + 1;
                            return <option value={value}>{value}h</option>;
                            })}
                        </Select>
                    </Box>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]}
                  gap={6}
                  width="100%"
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Nome intervento" />
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nome Intervento"
                            type="text"
                        />
                    </Box>
                    <Box textAlign="center">
                        <FieldTitle title="Data intervento" />
                        <SingleDatepicker
                            name="date-input"
                            date={dateInt}
                            onDateChange={setDateInt}
                            configs={{
                            dateFormat: "yyyy-MM-dd",
                            dayNames: "Dom,Lun,Mar,Mer,Gio,Ven,Sab".split(","), // length of 7
                            monthNames:
                                "Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dec".split(
                                ","
                                ), // length of 12
                            firstDayOfWeek: 1, // default is 0, the dayNames[0], which is Sunday if you don't specify your own dayNames,
                            }}
                            propsConfigs={{
                            triggerBtnProps: {
                                fontSize: "md",
                            },
                            dateNavBtnProps: {
                                colorScheme: "blue",
                                variant: "outline",
                            },
                            dayOfMonthBtnProps: {
                                defaultBtnProps: {
                                _hover: {
                                    background: "blue.400",
                                    color: "black",
                                },
                                },
                                selectedBtnProps: {
                                background: "blue.200",
                                color: "black",
                                },
                                todayBtnProps: {
                                background: "#4681ac",
                                },
                            },
                            }}
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Costo intervento" />
                        <InputGroup>
                            <Input
                                value={amountInt !== null ? amountInt : ''}
                                onChange={(e) => setAmountInt(parseFloat(e.target.value) || null)}
                                placeholder="Costo"
                                type="number"
                            />
                            <InputRightElement pointerEvents="none" color="gray.500">
                                €
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                  <Button mt={8} onClick={handleAddIntervento}>+</Button>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(5, 1fr)"]}
                  gap={6}
                  width="100%"
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Nome Pezzo" />
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome Pezzo"
                            type="text"
                        />
                    </Box>
                    <Box>
                        <FieldTitle title="Quantità" />
                        <Select
                            value={qta || 0}
                            onChange={(e) => setQta(parseInt(e.target.value))}
                        >
                            <option value={0} selected disabled>
                            0
                            </option>
                            {Array.from({ length: 48 }, (_, i) => {
                            const value = i + 1;
                            return <option value={value}>{value}</option>;
                            })}
                        </Select>
                    </Box>
                    <Box>
                        <FieldTitle title="Prezzo" />
                        <InputGroup>
                            <Input
                                value={price !== null ? price : ''}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || null)}
                                placeholder="Prezzo"
                                type="number"
                            />
                            <InputRightElement pointerEvents="none" color="gray.500">
                                €
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                    <Box>
                        <FieldTitle title="Fornitore" />
                        <Input
                            value={fornitor}
                            onChange={(e) => setFornitor(e.target.value)}
                            placeholder="Fornitore"
                            type="text"
                        />
                    </Box>
                  <Button onClick={handleAddPezzo} mt={8}>+</Button>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]}
                  gap={6}
                  width="100%"
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Tipo di pagamento" />
                        <Select
                            value={payment || 1}
                            onChange={(e) => setPayment(e.target.value)}
                        >
                            <option value={'Contanti'} selected>Contanti</option>
                            <option value={'Bancomat'} selected>Bancomat</option>
                        </Select>
                    </Box>
                    <Box>
                        <FieldTitle title="Acconto in €" />
                        <InputGroup>
                            <Input
                                value={amount !== null ? amount : ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || null)}
                                placeholder="Acconto in €"
                                type="number"
                            />
                            <InputRightElement pointerEvents="none" color="gray.500">
                                €
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                    <Box textAlign="center">
                        <FieldTitle title="Data di pagamento" />
                        <SingleDatepicker
                            name="date-input"
                            date={date}
                            onDateChange={setDate}
                            configs={{
                            dateFormat: "yyyy-MM-dd",
                            dayNames: "Dom,Lun,Mar,Mer,Gio,Ven,Sab".split(","), // length of 7
                            monthNames:
                                "Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dec".split(
                                ","
                                ), // length of 12
                            firstDayOfWeek: 1, // default is 0, the dayNames[0], which is Sunday if you don't specify your own dayNames,
                            }}
                            propsConfigs={{
                            triggerBtnProps: {
                                fontSize: "md",
                            },
                            dateNavBtnProps: {
                                colorScheme: "blue",
                                variant: "outline",
                            },
                            dayOfMonthBtnProps: {
                                defaultBtnProps: {
                                _hover: {
                                    background: "blue.400",
                                    color: "black",
                                },
                                },
                                selectedBtnProps: {
                                background: "blue.200",
                                color: "black",
                                },
                                todayBtnProps: {
                                background: "#4681ac",
                                },
                            },
                            }}
                        />
                    </Box>
                  <Button mt={8} onClick={handleAddAcconto}>+</Button>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)"]}
                  gap={6}
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Tipo motore" />
                        <Input
                            value={tipoMotore}
                            onChange={(e) => setTipoMotore(e.target.value)}
                            placeholder="Tipo Motore"
                        />
                    </Box>
                </Grid>
                <Grid
                  templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)"]}
                  gap={6}
                  mt={8}
                >
                    <Box>
                        <FieldTitle title="Note" />
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Note"
                            rows={4}
                        />
                    </Box>
                </Grid>
                <Grid templateColumns={["1fr"]} gap={6} width="100%">
                  <FormControl id="file" mb={3} width="100%">
                    <Text>Preventivo</Text>
                    <HStack spacing={4} width="100%">
                      <Input
                        alignContent="center"
                        flex="1"
                        key={inputKey}
                        type="file"
                        onChange={handleFileChange()}
                      />
                      <Button
                        flexShrink="0"
                        onClick={
                          handleUploadPreventivo
                        } /*style={{ background: isClickedSchema ? 'red' : '#2c323d' }}*/
                      >
                        Upload
                      </Button>
                      {isUploading && (
                        <CircularProgress
                          value={uploadProgressPreventivo}
                          thickness="4px"
                        >
                          <CircularProgressLabel>
                            {uploadProgressPreventivo}%
                          </CircularProgressLabel>
                        </CircularProgress>
                      )}
                    </HStack>
                  </FormControl>
                </Grid>
                <Flex justifyContent="center" mt={10}>
                  <Button type="submit" colorScheme="red">
                    {isLoading ? <Spinner /> : "Submit"}
                  </Button>
                </Flex>

                {/* #region Cliente, Commessa e Macchina */}

                {/* <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]} gap={6}>
                                    <FormControl id="Cliente" mb={3}>
                                        <Text mb={1} textAlign="center">Cliente</Text>
                                        <Select textAlign="center" value={cliente} onChange={handleClienteChange} required >
                                            {optionsCliente.sort((a, b) => a.text.it.localeCompare(b.text.it)).map((option, index) => (
                                                <option key={index} value={option.value}>
                                                    {option.text.it}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl id="Machine" mb={3}>
                                        <Text mb={1} textAlign="center">Macchina</Text>
                                        <Select textAlign="center" value={machine} onChange={handleMachineChange} required >
                                            {machineOptions.sort((a, b) => a.localeCompare(b)).map((option, index) => (
                                                <option key={index} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl id="Commessa" mb={3}>
                                        <Text mb={1} textAlign="center">Commessa</Text>
                                        <Select textAlign="center" value={commessa} onChange={event => setCommessa(event.target.value)} required >
                                            {commessaOptions.sort((a, b) => a.localeCompare(b)).map((option, index) => (
                                                <option key={index} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} justifyContent="center" alignItems="center">
                                    <FormControl id="OreLavorate" mb={3}>
                                        <Text mb={1} textAlign="center">OreLavorate</Text>

                                        <Select textAlign="center" value={oreLavorate} onChange={event => setOreLavorate(Number(event.target.value))} required >
                                            {optionsOreLav.map((option, index) => (
                                                <option key={index} value={option.value}>
                                                    {option.text.it}
                                                </option>
                                            ))}
                                        </Select>

                                    </FormControl>
                                    <FormControl id="Data" mb={3}>
                                        <Text mb={1} textAlign="center">Data</Text>
                                        <Flex justifyContent="center">
                                            <SingleDatepicker name="date-input" date={date} onDateChange={setDate}
                                                configs={{
                                                    dateFormat: 'yyyy-MM-dd',
                                                    dayNames: 'Dom,Lun,Mar,Mer,Gio,Ven,Sab'.split(','), // length of 7
                                                    monthNames: 'Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dec'.split(','), // length of 12
                                                    firstDayOfWeek: 1, // default is 0, the dayNames[0], which is Sunday if you don't specify your own dayNames,
                                                }}
                                                propsConfigs={{
                                                    triggerBtnProps: {
                                                        fontSize: 'md',
                                                    },
                                                    dateNavBtnProps: {
                                                        colorScheme: "blue",
                                                        variant: "outline"
                                                    },
                                                    dayOfMonthBtnProps: {
                                                        defaultBtnProps: {
                                                            _hover: {
                                                                background: 'blue.400',
                                                                color: "black",
                                                            }
                                                        },
                                                        selectedBtnProps: {
                                                            background: "blue.200",
                                                            color: "black",
                                                        },
                                                        todayBtnProps: {
                                                            background: "#4681ac",
                                                        }
                                                    },
                                                }} />
                                        </Flex>
                                    </FormControl>
                                </Grid>

                                <FormControl id="TipoDiIntervento" mb={3}>
                                    <Text mb={1} textAlign="center">Tipo di Intervento</Text>
                                    <Select textAlign="center" value={tipoIntervento} onChange={event => setTipoIntervento(event.target.value)} required >
                                        {optionsTipoIntervento.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.text.it}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                {Number(tipoIntervento) > 0 && (
                                    <>
                                        <FormControl id="Problema" mb={3}>
                                            <Text mb={1} textAlign="center">Problema</Text>
                                            <Select mb={1} textAlign="center" value={problem} onChange={event => setProblem(event.target.value)} required>
                                                <option value=""> Inserisci un valore</option>
                                                {anotherOptions.map((option, index) => (
                                                    <option key={index} value={option.value}>
                                                        {option.text.it}
                                                    </option>
                                                ))}
                                                {Number(tipoIntervento) !== 3 && <option value="new">Creane uno nuovo...</option>}
                                            </Select>
                                        </FormControl>
                                        <Grid templateColumns={"repeat(3, 1fr)"} gap={6}>
                                            {problem === 'new' && Number(tipoIntervento) !== 3 && (
                                                <>
                                                    <GridItem colSpan={2} >
                                                        <FormControl id="NuovoNomeProblema" mb={3}>
                                                            <Text mb={1} textAlign="center">Descrizione</Text>
                                                            <Input mb={1} type="text" textAlign="center" value={newProblem} onChange={event => setNewProblem(event.target.value)} flex="2" />
                                                        </FormControl>
                                                    </GridItem>
                                                    <GridItem colSpan={1} >
                                                        <FormControl id="NuovoNomeProblema" mb={3}>
                                                            <Text mb={1} textAlign="center" color={"#1a202c"}>_</Text>
                                                            <Button width="150px" onClick={handleCreateProblems} flex="1">Crea</Button>
                                                        </FormControl>
                                                    </GridItem>
                                                </>
                                            )}
                                        </Grid>
                                    </>
                                )}
                                <Text mb={1} textAlign="center">Tecnico Cliente</Text>
                                <Select textAlign="center" value={tecnicoCliente} onChange={handleChangeTecnicoCliente}>
                                    <option value=""> Inserisci un valore</option>
                                    {tecnicoClienteList.map((option, index) => (
                                        <option key={index} value={option.tecnicocliente}>
                                            {option.tecnicocliente}
                                        </option>
                                    ))}
                                    {<option value="crea">Crea un nuovo Tecnico Cliente</option>}
                                
                                </Select>
                                {showTecnicoInput && (
                                <Grid templateColumns={"repeat(3, 1fr)"} gap={6}>
                                    <GridItem colSpan={2} >
                                        <FormControl id="nuovotecnico" mb={3}>
                                            <Text mb={1} textAlign="center">Nome e Cognome</Text>
                                            <Input mb={1} type="text" textAlign="center" value={newTecnicoCliente} onChange={event => setNewTecnicoCliente(event.target.value)} flex="2" />
                                        </FormControl>
                                    </GridItem>
                                    <GridItem colSpan={1} >
                                        <FormControl id="nuovotecnico" mb={3}>
                                            <Text mb={1} textAlign="center" color={"#1a202c"}>_</Text>
                                            <Button width="150px" onClick={handleCreateTecnicoCliente} flex="1">Crea</Button>
                                        </FormControl>
                                    </GridItem>
                                </Grid>
                                )}

                                {sw !== 0 ? (<Grid templateColumns={["1fr"]} gap={6} width="100%">
                                    <FormControl id="file" mb={3} width="100%">
                                        <Text>Upload the PLC</Text>
                                        <HStack spacing={4} width="100%">
                                            <Input alignContent="center" flex="1" key={inputKey} type="file" onChange={handleFileChange('PLC')} />
                                            <Button flexShrink="0" onClick={handleUploadPLC} style={{ background: isClickedPLC ? 'red' : '#2c323d' }}>
                                                Upload
                                            </Button>
                                            {isUploading &&
                                                <CircularProgress value={uploadProgressPLC} thickness='4px'>
                                                    <CircularProgressLabel>{uploadProgressPLC}%</CircularProgressLabel>
                                                </CircularProgress>
                                            }
                                        </HStack>

                                    </FormControl>
                                </Grid>) : null}
                                {sw === 1 ? (<Grid templateColumns={["1fr"]} gap={6} width="100%">
                                    <FormControl id="file" mb={3} width="100%">
                                        <Text>Upload the HMI</Text>
                                        <HStack spacing={4} width="100%">
                                            <Input alignContent="center" flex="1" key={inputKey} type="file" onChange={handleFileChange('HMI')} />
                                            <Button flexShrink="0" onClick={handleUploadHMI} style={{ background: isClickedHMI ? 'red' : '#2c323d' }}>Upload</Button>
                                            {isUploading &&
                                                <CircularProgress value={uploadProgressHMI} thickness='4px'>
                                                    <CircularProgressLabel>{uploadProgressHMI}%</CircularProgressLabel>
                                                </CircularProgress>
                                            }
                                        </HStack>

                                    </FormControl>
                                </Grid>) : null}
                                <Grid templateColumns={["1fr"]} gap={6} width="100%">
                                    <FormControl id="file" mb={3} width="100%">
                                        <Text>Upload the Schemas</Text>
                                        <HStack spacing={4} width="100%">
                                            <Input alignContent="center" flex="1" key={inputKey} type="file" onChange={handleFileChange('SCHEMA')} />
                                            <Button flexShrink="0" onClick={handleUploadSchema} /*style={{ background: isClickedSchema ? 'red' : '#2c323d' }}>
                                                Upload
                                            </Button>
                                            {isUploading &&
                                                <CircularProgress value={uploadProgressSCHEMA} thickness='4px'>
                                                    <CircularProgressLabel>{uploadProgressSCHEMA}%</CircularProgressLabel>
                                                </CircularProgress>
                                            }
                                        </HStack>

                                    </FormControl>
                                </Grid>
                                <FormControl id="note" mb={3}>
                                    <Text mb={1} textAlign="center">Note</Text>
                                    <Textarea textAlign="center" height={150} value={note} onChange={(event) => setNote(event.target.value)} required />
                                </FormControl>
                                <Flex justifyContent="center">
                                    <Button type="submit" colorScheme="teal">{languageSelected ? 'Invia' : 'Submit'}</Button>
                                </Flex> */}
              </form>
            </Box>
            <Grid templateColumns="1fr" gap={6} width="100%">
              {interventi.length > 0 && (
                <Box border="1px solid grey" p={4} borderRadius="md">
                  <Flex justifyContent="center" alignItems="center" mb={10}>
                    <Heading size="lg">Interventi</Heading>
                  </Flex>
                  {interventi.map((item, index) => (
                    <Grid
                      key={index}
                      templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
                      gap={6}
                      mt={4}
                      border="1px solid grey"
                      p={4}
                      borderRadius="md"
                    >
                      <Text textAlign={'center'}>{item.title}</Text>
                      <Text textAlign={'center'}>{new Date(item.date).toLocaleDateString()}</Text>
                      <Text textAlign={'center'}>{item.amount} €</Text>
                    </Grid>
                  ))}
                </Box>
              )}
              {pezzi.length > 0 && (
                <Box border="1px solid grey" p={4} borderRadius="md">
                  <Flex justifyContent="center" alignItems="center" mb={10}>
                    <Heading size="lg">Pezzi</Heading>
                  </Flex>
                  {pezzi.map((item, index) => (
                    <Grid
                      key={index}
                      templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
                      gap={6}
                      mt={4}
                      border="1px solid grey"
                      p={4}
                      borderRadius="md"
                    >
                      <Text textAlign={'center'}>{item.name}</Text>
                      <Text textAlign={'center'}>{item.qta}</Text>
                      <Text textAlign={'center'}>{item.fornitor}</Text>
                    </Grid>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
          {acconti.length > 0 && (
            <Box border="1px solid grey" borderRadius="md" width="96%" mb={10} p={10} ml={'2%'} mr={'2%'}>
              <Flex justifyContent="center" alignItems="center" mb={10}>
                <Heading size="lg">Acconti</Heading>
              </Flex>
              {acconti.map((item, index) => (
                <Grid
                  key={index}
                  templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
                  gap={6}
                  mt={4}
                  border="1px solid grey"
                  p={4}
                  borderRadius="md"
                >
                  <Text textAlign={'center'}>{item.payment}</Text>
                  <Text textAlign={'center'}>{new Date(item.date).toLocaleDateString()}</Text>
                  <Text textAlign={'center'}>{item.amount} €</Text>
                </Grid>
              ))}
            </Box>
          )}
        </Box>
      </Flex>
    </div>
  );
};

export default addAssistance;
