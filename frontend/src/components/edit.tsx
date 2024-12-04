import React, { useState, useContext, ChangeEvent, useEffect } from "react";

import {
  Box,
  Flex,
  Text,
  Grid,
  Icon,
  Button,
  Select,
  FormControl,
  GridItem,
  Input,
  Textarea,
  HStack,
  CircularProgress,
  CircularProgressLabel,
  Checkbox,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import { MdCircle } from "react-icons/md";
import { Timestamp } from "firebase/firestore";

import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  DocumentSnapshot,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase"; // import auth from your firebase configuration file
import Navbar from "./navbar";
import UserContext from "../context/userContext";
import { useCustomToast } from "./showToast";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import axios from "axios";

// const optionsCliente = [
//   { value: "", text: { it: " Inserisci un valore", en: " Insert a value" } },
//   {
//     value: "Conagra Oakdale USA",
//     text: { it: "Conagra Oakdale USA", en: "Conagra Oakdale USA" },
//   },
//   { value: "Steriltom", text: { it: "Steriltom", en: "Steriltom" } },
//   { value: "Sugal", text: { it: "Sugal", en: "Sugal" } },
//   { value: "Martinete", text: { it: "Martinete", en: "Martinete" } },
//   { value: "Tomatek", text: { it: "Tomatek", en: "Tomatek" } },
//   {
//     value: "Tamek Salihli",
//     text: { it: "Tamek Salihli", en: "Tamek Salihli" },
//   },
//   { value: "Los Gatos", text: { it: "Los Gatos", en: "Los Gatos" } },
//   { value: "Treko", text: { it: "Treko", en: "Treko" } },
//   { value: "Alsat", text: { it: "Alsat", en: "Alsat" } },
//   { value: "Apis Carnes", text: { it: "Apis Carnes", en: "Apis Carnes" } },
//   {
//     value: "Conagra Canada",
//     text: { it: "Conagra Canada", en: "Conagra Canada" },
//   },
// ];

// const optionsOreLav = Array.from({ length: 48 }, (_, i) => {
//   const value = (i + 1) * 0.5;
//   return { value, text: { it: value.toString(), en: value.toString() } };
// });

// const optionsTipoIntervento = [
//   { value: "", text: { it: " Inserisci un valore", en: " Insert a value" } },
//   { value: 0, text: { it: "Assistenza", en: "Assistenza" } },
//   {
//     value: 1,
//     text: {
//       it: "Non risolutivo (Rimandabile)",
//       en: "Non risolutivo (Rimandabile)",
//     },
//   },
//   {
//     value: 2,
//     text: { it: "Non risolutivo (Urgente)", en: "Non risolutivo (Urgente)" },
//   },
//   { value: 3, text: { it: "Risolutivo", en: "Risolutivo" } },
// ];

// const mappings = [
//   { cliente: "", commessa: "", machine: "", SW: 0 },
//   { cliente: "Conagra Oakdale USA", commessa: "O22050", machine: "", SW: 1 },
//   {
//     cliente: "Conagra Oakdale USA",
//     commessa: "O22050",
//     machine: "Thor M3",
//     SW: 1,
//   },
//   {
//     cliente: "Conagra Oakdale USA",
//     commessa: "O22050",
//     machine: "Thor M6",
//     SW: 1,
//   },
//   { cliente: "Steriltom", commessa: "O22066", machine: "Thor M2+2+2", SW: 2 },
//   { cliente: "Sugal", commessa: "O22089", machine: "Thor M3", SW: 2 },
//   { cliente: "Martinete", commessa: "", machine: "", SW: 0 },
//   { cliente: "Martinete", commessa: "O23021", machine: "Linea HBO 350", SW: 0 },
//   {
//     cliente: "Martinete",
//     commessa: "O23091",
//     machine: "Sterilizzatore",
//     SW: 0,
//   },
//   { cliente: "Tomatek", commessa: "O23051", machine: "Thor M6", SW: 1 },
//   { cliente: "Tamek Salihli", commessa: "O23068", machine: "", SW: 0 },
//   {
//     cliente: "Tamek Salihli",
//     commessa: "O23068",
//     machine: "Evaporatore",
//     SW: 0,
//   },
//   {
//     cliente: "Tamek Salihli",
//     commessa: "O23068",
//     machine: "Linea HBV 500",
//     SW: 0,
//   },
//   { cliente: "Los Gatos", commessa: "O23078", machine: "", SW: 0 },
//   { cliente: "Los Gatos", commessa: "O23078", machine: "Linea HBV 500", SW: 1 },
//   { cliente: "Los Gatos", commessa: "O23078", machine: "Thor M3+3", SW: 1 },
//   { cliente: "Treko", commessa: "O23087", machine: "Sterilizzatore", SW: 2 },
//   { cliente: "Alsat", commessa: "O23090", machine: "", SW: 0 },
//   { cliente: "Alsat", commessa: "O23090", machine: "Metis", SW: 0 },
//   { cliente: "Alsat", commessa: "O23090", machine: "Thor M6", SW: 0 },
//   {
//     cliente: "Apis Carnes",
//     commessa: "O23095",
//     machine: "Linea HBT 450",
//     SW: 0,
//   },
//   {
//     cliente: "Conagra Canada",
//     commessa: "O24026",
//     machine: "Riempitrice",
//     SW: 1,
//   },
// ];

const EditPage = () => {
  const location = useLocation();
  const statusMap = {
    "🔵": "inCorso",
    "🟢": "completed",
    "🟡": "standby",
    "🟠": "problem",
    "🔴": "canceled",
  };
  const record = location.state.record;
  //console.log(record)
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [cliente, setCliente] = useState(record.nomeCliente)
  const [stato, setStato] = useState(record.stato)
  const [dataInizio, setDataInizio] = useState(record.dataInizio)
  const [dataFine, setDataFine] = useState(record.dataFine)
  const [oreLavorate, setOreLavorate] = useState(record.oreLav)
  const [titoloIntervento, setTitoloIntervento] = useState(record.titolo)
  const [marcaVeicolo, setMarcaVeicolo] = useState(record.veicolo.marca)
  const [targaVeicolo, setTargaVeicolo] = useState(record.veicolo.targa)
  const [vimVeicolo, setVimVeicolo] = useState(record.veicolo.vim)
  const [annoVeicolo, setAnnoVeicolo] = useState(record.veicolo.anno)
  const [cavalliVeicolo, setCavalliVeicolo] = useState(record.veicolo.cavalli)
  const [modelloVeicolo, setModelloVeicolo] = useState(record.veicolo.modello)
  const [kmVeicolo, setKmVeicolo] = useState(record.veicolo.km)
  const [tipoMotore, setTipoMotore] = useState(record.veicolo.tipomotore)
  const [pezzi, setPezzi] = useState(record.pezzi)
  const [acconti, setAcconti] = useState(record.acconti)
  const [note, setNote] = useState(record.note)
  //console.log(pezzi)

  const [selectedStatus, setSelectedStatus] = useState();
  const [isLoading, setIsLoading] = useState(false)
  const [clientiList, setClientiList] = useState<String[]>([''])
  const [titoloLavorazione, setTitoloLavoraione] = useState('')
  
  const fetchClienti = async () => {
    const recordsUsersCollection = collection(firestore, 'clienti');
    const recordsUsersDocs = await getDocs(recordsUsersCollection);
    const wholeRecord = recordsUsersDocs.docs.map((doc) => doc.data());
    const clienti: any[] = [];
    wholeRecord.forEach((record: any) => {
        clienti.push(record.nomeCompleto);
    });
    setClientiList(clienti);
  }

  const fetchAll = async () => {
      await fetchClienti();
  }

  useEffect(() => {
      setIsLoading(true);
      fetchAll();
      setIsLoading(false);
  }, []);

  useEffect(() => {
    const selectedStatusCalc = Object.entries(statusMap).find(
      ([emoji, key]) => stato[key]
    )?.[0] || "🔵"; // Default to 🔵 if no value is true
    setSelectedStatus(selectedStatusCalc)
  }, [stato])

  /*
  // //console.log(record);
  //const { languageSelected } = useContext(LanguageContext);
  //const { actualName, actualSurname } = useContext(UserContext);
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [cliente, setCliente] = useState(record.cliente);
  const [commessa, setCommessa] = useState(record.commessa);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState(record.note);
  const [oreLavorate, setOreLavorate] = useState(record.oreLavorate as number);
  const [tipoIntervento, setTipoIntervento] = useState(record.tipoIntervento);
  const [ourCommessa] = useState("");
  const [macchina, setMacchina] = useState(record.macchina);
  const [machineOptions, setMachineOptions] = useState<string[]>([]);
  const [commessaOptions, setCommessaOptions] = useState<string[]>([]);
  const [sw, setSw] = useState(0);
  const [inputKey] = useState(Math.random().toString());
  const [problem, setProblem] = useState(record.problem);
  const [newTecnicoCliente, setNewTecnicoCliente] = useState('');
  const [tecnicoClienteList, setTecnicoClienteList] = useState<any[]>([]);
  const [tecnicoCliente, setTecnicoCliente] = useState(record.tecnicoCliente);
  const [showTecnicoInput, setshowTecnicoInput] = useState(false);
  const [isClickedSchema, setIsClickedSchema] = useState(false);
  const [filePathSCHEMA, setFilePathSCHEMA] = useState(record.filePathSCHEMA);
  const [uploadProgressSCHEMA, setUploadProgressSCHEMA] = useState(0);
  const [fileSCHEMA, setFileSCHEMA] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePLC, setFilePLC] = useState<File | null>(null);
  const [fileHMI, setFileHMI] = useState<File | null>(null);
  const [isClickedPLC, setIsClickedPLC] = useState(false);
  const [isClickedHMI, setIsClickedHMI] = useState(false);
  const [filePathPLC, setFilePathPLC] = useState('');
  const [filePathHMI, setFilePathHMI] = useState('');
  const [uploadProgressPLC, setUploadProgressPLC] = useState(0);
  const [uploadProgressHMI, setUploadProgressHMI] = useState(0);

  const [problemsList, setProblemsList] = useState<any[]>([]); // add this state variable to store the problems
  const [newProblem, setNewProblem] = useState("");

  const fetchProblems = async () => {
    const problemsCollection = collection(firestore, "problems");
    const problemDocs = await getDocs(problemsCollection);
    const problemsData: any[] = [];
    problemDocs.forEach((doc) => {
      problemsData.push(doc.data());
    });
    setProblemsList(problemsData);
    ////console.log(problemsData)
  };
  const fetchTecnicoCliente = async () => {
    const ClienteCollection = collection(firestore, 'tecnicocliente');
    const clienteDocs = await getDocs(ClienteCollection);
    const tecnicoClienteData: any[] = [];
    clienteDocs.forEach((doc) => {
        tecnicoClienteData.push(doc.data());
        ////console.log(doc.data())

    });
    
    setTecnicoClienteList(tecnicoClienteData);
};

  useEffect(() => {
    fetchProblems();
    fetchTecnicoCliente();
  }, []);

  const url = new URL(window.location.origin);
  url.port = '3005';
  //console.log(url.toString());

  const resetForm = () => {
    setCliente("");
    setCommessa("");
    setDate(new Date());
    setNote("");
    setOreLavorate(0.5);
    setTipoIntervento("");
    setMacchina("");
    setMachineOptions([]);
    setCommessaOptions([]);
    setSw(0);
    setProblem("");
  };

  const updateRecord = async () => {
    const problemsCollection = collection(firestore, "problems");
    const q = query(
      problemsCollection,
      where("cliente", "==", cliente),
      where("machine", "==", macchina),
      where("commessa", "==", commessa),
      where("desc", "==", problem)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnapshot) => {
      const docRef = doc(firestore, "problems", docSnapshot.id);
      await updateDoc(docRef, { status: 2 });
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const recordsCollection = collection(firestore, "records");

    const q = query(recordsCollection, where("formData.id", "==", record.id));

    const querySnapshot = await getDocs(recordsCollection);
    let docToUpdate: DocumentSnapshot<DocumentData> | null = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.id === record.id) {
        docToUpdate = doc;
      }
    });

    if (docToUpdate) {
      let formData;
      ////console.log(tipoIntervento);
      if (tipoIntervento === "0") {
        formData = {
          //id: record.id,
          cliente: cliente,
          commessa: commessa,
          macchina: macchina,
          ourCommessa: ourCommessa,
          oreLavorate: oreLavorate,
          date: date,
          dateMod: new Date(),
          problem: "",
          tipoIntervento: tipoIntervento,
          tecnicoCliente: tecnicoCliente,
          filePathPLC: record.filePathPLC === "" ? filePathPLC : record.filePathPLC,
          filePathHMI: record.filePathHMI === "" ? filePathHMI : record.filePathHMI,
          filePathSCHEMA: record.filePathSCHEMA === "" ? filePathSCHEMA : record.filePathSCHEMA,
          sw: sw,
          note: note,
        };
      } else {
        formData = {
          //id: record.id,
          cliente: cliente,
          commessa: commessa,
          macchina: macchina,
          ourCommessa: ourCommessa,
          oreLavorate: oreLavorate,
          date: date,
          dateMod: new Date(),
          tipoIntervento: tipoIntervento,
          tecnicoCliente: tecnicoCliente,
          filePathPLC: record.filePathPLC === "" ? filePathPLC : record.filePathPLC,
          filePathHMI: record.filePathHMI === "" ? filePathHMI : record.filePathHMI,
          filePathSCHEMA: record.filePathSCHEMA === "" ? filePathSCHEMA : record.filePathSCHEMA,
          problem: problem,
          sw: sw,
          note: note,
        };
      }
      // //console.log(formData);
      showSuccessToast("Record updated correctly");
      await updateDoc((docToUpdate as DocumentSnapshot<DocumentData>).ref, formData);
      
    }

    showSuccessToast("Form submitted successfully!");
    resetForm();
    navigate("/")
  };

  const handleFileChange = (resource: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    switch (resource) {
        case "PLC":
            ////console.log(file);
            setFilePLC(file || null);
            break;
        case "HMI":
            //le.log(file);
            setFileHMI(file || null);
            break;
        case "SCHEMA":
            ////console.log(file);
            setFileSCHEMA(file || null);
            break;
    
    }
    // Do something with the file
  };

  const anotherOptions = problemsList.filter((p) => p.cliente === cliente && p.commessa === commessa && p.macchina === macchina).map((p) => ({ text: p.desc}));
  ////console.log(anotherOptions)
  const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCliente = event.target.value;
    setCliente(selectedCliente);
    const selectedMappings = mappings.filter(
      (m) => m.cliente === selectedCliente
    );
    const machineOptions = selectedMappings.map((m) => m.machine);
    const commessaOptions = selectedMappings
      .map((m) => m.commessa)
      .filter((value, index, self) => self.indexOf(value) === index);
    setMachineOptions(machineOptions);
    setCommessaOptions(commessaOptions);
    if (selectedMappings.length > 0) {
      const firstMapping = selectedMappings[0];
      setCommessa(firstMapping.commessa);
      setMacchina(firstMapping.machine);
      setSw(firstMapping.SW);
    }
  };

  useEffect(() => {
    const selectedMappings = mappings.filter((m) => m.cliente === cliente);
    const machineOptions = selectedMappings.map((m) => m.machine);
    const commessaOptions = selectedMappings
      .map((m) => m.commessa)
      .filter((value, index, self) => self.indexOf(value) === index);
    setMachineOptions(machineOptions);
    setCommessaOptions(commessaOptions);
    if (selectedMappings.length > 0) {
      const firstMapping = selectedMappings[0];
      setCommessa(firstMapping.commessa);
      setMacchina(firstMapping.machine);
      setSw(firstMapping.SW);
    }
    setMacchina(record.macchina);
  }, []);

  const handleMachineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClienteMappings = mappings.filter(
      (m) => m.cliente === cliente
    );
    const selectedMachine = event.target.value;
    setMacchina(selectedMachine);
    const selectedMappings = selectedClienteMappings.filter(
      (m) => m.machine === selectedMachine
    );
    //const commessaOptions = selectedMappings.map(m => m.commessa);
    //setCommessaOptions(commessaOptions);
    if (selectedMappings.length > 0) {
      const firstMapping = selectedMappings[0];
      setCommessa(firstMapping.commessa);
      setSw(firstMapping.SW);
    }
  };

  const handleUploadPLC = async () => {
    setUploadProgressPLC(0);
    if (!filePLC) {
        showErrorToast('No file selected.');
        return;
    }
    const FileInfo = {
      cliente: cliente,
      commessa: commessa,
      machine: macchina,
      type: "31_Plc",
    };
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', filePLC);
    formData.append("fileInfo", JSON.stringify(FileInfo));
    try {
        const response = await axios.post(`${url.toString()}upload`, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgressPLC(percentCompleted);
                }
            },
        });
        setFilePathPLC(response.data.filePath);
        showSuccessToast('PLC salvato correttamente.');
        setIsClickedPLC(false);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            showErrorToast('Error: ' + error.response?.data.error);
        } else if (error instanceof Error) {
            showErrorToast('Error: ' + error.message);
        }
    }
};
const handleUploadHMI = async () => {
    setUploadProgressHMI(0);
    if (!fileHMI) {
        showErrorToast('No file selected.');
        return;
    }
    const FileInfo = {
      cliente: cliente,
      commessa: commessa,
      machine: macchina,
      type: "32_HMI",
    };
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', fileHMI);
    formData.append("fileInfo", JSON.stringify(FileInfo));
    try {
        const response = await axios.post(`${url.toString()}upload`, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgressHMI(percentCompleted);
                }
            },
        });
        setFilePathHMI(response.data.filePath);
        showSuccessToast('HMI salvato correttamente.');
        setIsClickedHMI(false);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            showErrorToast('Error: ' + error.response?.data.error);
        } else if (error instanceof Error) {
            showErrorToast('Error: ' + error.message);
        }
    }
};

  const handleUploadSchema = async () => {
    setUploadProgressSCHEMA(0);
    if (!fileSCHEMA) {
        showErrorToast('No file selected.');
        return;
    }
    const FileInfo = {
      cliente: cliente,
      commessa: commessa,
      machine: macchina,
      type: "05_Schema",
    };
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', fileSCHEMA);
    formData.append("fileInfo", JSON.stringify(FileInfo));
    try {
        const response = await axios.post(`${url.toString()}upload`, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgressSCHEMA(percentCompleted);
                }
            },
        });
        setFilePathSCHEMA(response.data.filePath);
        showSuccessToast('Schema salvato correttamente.');
        setIsClickedSchema(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showErrorToast('Error: ' + error.response?.data.error);
      } else if (error instanceof Error) {
        showErrorToast('Error: ' + error.message);
      }
    }
  };

  const handleCreateProblems = async () => {
    if (!newProblem) {
      showErrorToast("Please enter a problem description.");
      return;
    }
    if (!cliente) {
      showErrorToast("Please select a client");
      return;
    }
    if (!commessa) {
      showErrorToast("Please select a commessa");
      return;
    }
    if (!macchina) {
      showErrorToast("Please select a machine");
      return;
    }
    const problemsCollection = collection(firestore, "problems");
    await addDoc(problemsCollection, {
      desc: newProblem,
      status: 1,
      cliente: cliente,
      commessa: commessa,
      macchina: macchina,
    });

    fetchProblems();
    setProblem(newProblem);
    showSuccessToast("Problema creato correttamente");
    // set the value of the Select to the ID of the new problem
    setNewProblem("");
  };


  ////console.log(record);
  /*
    const handleDownload = async (filePath: string) => {
        try {
            filePath = filePath.replace(/\\/g, '/');
            filePath = filePath.replace('uploads/', ''); // Remove 'uploads/' from the file path
            const urla = new URL(window.location.origin);
            urla.port = '3005';
            const response = await fetch(`${urla.toString()}download/${encodeURIComponent(filePath)}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath.split('/').pop() || 'file'; // Use the actual file name and extension
            document.body.appendChild(a); // we need to append the element to the dom -> invisible
            a.click();
            a.remove();  //afterwards we remove the element again         
        } catch (error) {
            //console.error('There has been a problem with your fetch operation: ', error);
        }
    };

  const handleChangeTecnicoCliente = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTecnicoCliente(event.target.value)
    if (event.target.value === 'crea') {
        setshowTecnicoInput(true);
    }else{
        setshowTecnicoInput(false);
    }
    ////console.log(event.target.value)
  }

  const handleCreateTecnicoCliente = async () => {
    ////console.log(newTecnicoCliente)
    const TecnicoCollection = collection(firestore, 'tecnicocliente');
    await addDoc(TecnicoCollection, {
        tecnicocliente: newTecnicoCliente,
    });

    fetchTecnicoCliente();
    setTecnicoCliente(newTecnicoCliente);
    setshowTecnicoInput(false);
    setTecnicoClienteList([newTecnicoCliente]); // Change the type of tecnicoClienteList to string[]
    showSuccessToast('Tecnico Cliente creato correttamente');
    // set the value of the Select to the ID of the new problem
    setNewTecnicoCliente('');
  };

  const optionsTipoIntervento = [
    { value: "", text: { it: " Inserisci un valore", en: " Insert a value" } },
    { value: 0, text: { it: "Assistenza", en: "Assistenza" } },
    {
      value: 1,
      text: {
        it: "Non risolutivo (Rimandabile)",
        en: "Non risolutivo (Rimandabile)",
      },
    },
    {
      value: 2,
      text: { it: "Non risolutivo (Urgente)", en: "Non risolutivo (Urgente)" },
    },
    { value: 3, text: { it: "Risolutivo", en: "Risolutivo" } },
  ];
  const value = record.tipoIntervento as number;
  let color;
  switch (Number(value)) {
    case 0:
      color = "#63b3ed";
      break;
    case 1:
      color = "#ffb600";
      break;
    case 2:
      color = "#ff1414";
      break;
    case 3:
      color = "#008000";
      break;
    default:
      color = "black";
  }
  const tipoInterventoOption = optionsTipoIntervento.find(
    (option) => option.value === Number(record.tipoIntervento)
  );
  const tipoInterventoText = tipoInterventoOption
    ? tipoInterventoOption.text.it
    : "Unknown";
*/
  const handleChangePezzi = (value, method, id) => {
    // Create a new copy of the array
    const updatedPezzi = [...pezzi];
    // Update the specific field
    updatedPezzi[id] = { ...updatedPezzi[id], [method]: value };
    // Set the new array as state
    setPezzi(updatedPezzi);
  };

  const handleChangeAcconti = (value, method, id) => {
    // Create a new copy of the array
    const updatedAcconti = [...acconti];
    // Update the specific field
    updatedAcconti[id] = { ...updatedAcconti[id], [method]: value };
    // Set the new array as state
    setAcconti(updatedAcconti);
  };

  const handleChangeDate = (value, method, id) => {
    // Format the date
    const valueFormatted = {
      seconds: Math.floor(value.getTime() / 1000),
      nanoseconds: (value.getTime() % 1000) * 1000000,
    };
    // Create a new copy of the array
    const updatedAcconti = [...acconti];
    // Update the date field
    updatedAcconti[id] = { ...updatedAcconti[id], [method]: valueFormatted };
    // Set the new array as state
    setAcconti(updatedAcconti);
  };

  const timestampToDate = (timestamp: any) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };
  const handleChangeStatus = (event) => {
    const selectedEmoji = event.target.value;
    const selectedKey = statusMap[selectedEmoji];

    // Create a new `stato` object with all values set to false except the selected one
    const updatedStato = Object.keys(stato).reduce((acc, key) => {
      acc[key] = key === selectedKey;
      return acc;
    }, {});

    // Update the state
    setStato({ ...updatedStato }); // Ensure React sees it as a new object
    console.log("Updated Stato:", updatedStato);
  }
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const id = record.id;
    const formData = {
      id: id,
      nomeCliente: cliente,
      titolo: titoloIntervento,
      pezzi: pezzi,
      acconti: acconti.map((acconto: any) => ({
        ...acconto,
        date: acconto.date ? Timestamp.fromDate(new Date(acconto.date.seconds * 1000)) : null, // Ensure timestamp format
      })),
      dataInizio: dataInizio ? Timestamp.fromDate(new Date(dataInizio.seconds * 1000)) : null, // Convert to Firestore Timestamp
      dataFine: dataFine ? Timestamp.fromDate(new Date(dataFine.seconds * 1000)) : null, // Convert to Firestore Timestamp
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
      stato: stato,
    };
    try {
      await setDoc(doc(firestore, "operazioni", id.toString()), formData);
      showSuccessToast("Form submitted successfully!");
      navigate("/");
    } catch (error) {
      showErrorToast("Qualcosa è andato storto, riprova!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Flex justifyContent="center" minHeight="100vh">
      <form onSubmit={handleSubmit}>
        <Box maxWidth="1500px">
          <Navbar />
          <Box border="1px solid grey" p={4} borderRadius="md">
            <Grid templateColumns={["repeat(3, 1fr)"]} gap={6} mb={6}>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text textAlign="center" fontWeight="bold">
                  Cliente
                </Text>
                <Select
                  textAlign="center"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                >
                  {clientiList.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </Select>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Text textAlign="center" fontWeight="bold">
                  Stato
                </Text>
                <Select
                  textAlign="center"
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                >
                  {/*<option>🔴🟠🟡🟢🔵</option>*/}
                  <option value={'🔵'}>🔵</option>
                  <option value={'🟢'}>🟢</option>
                  <option value={'🟡'}>🟡</option>
                  <option value={'🟠'}>🟠</option>
                  <option value={'🔴'}>🔴</option>
                </Select>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Text textAlign="center" fontWeight="bold">
                  Ore Lavorate
                </Text>
                <Select
                  textAlign="center"
                  value={oreLavorate}
                  onChange={(e) => setOreLavorate(parseInt(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = (i + 1);
                    return <option value={value} >{value}h</option>
                  })}
                </Select>
              </Box>
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mb={6}>
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Text textAlign="center" fontWeight="bold">
                  Data Inizio
                </Text>
                <SingleDatepicker
                  name="date-input"
                  date={timestampToDate(dataInizio)} // Convert Firestore timestamp to Date
                  onDateChange={(date) => {
                    // Convert back to Firestore timestamp format if needed
                    setDataInizio({
                      seconds: Math.floor(date.getTime() / 1000),
                      nanoseconds: (date.getTime() % 1000) * 1000000,
                    });
                  }}
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
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Text textAlign="center" fontWeight="bold">
                  Data Fine
                </Text>
                <SingleDatepicker
                  name="date-input"
                  date={timestampToDate(dataFine)} // Convert Firestore timestamp to Date
                  onDateChange={(date) => {
                    // Convert back to Firestore timestamp format if needed
                    setDataFine({
                      seconds: Math.floor(date.getTime() / 1000),
                      nanoseconds: (date.getTime() % 1000) * 1000000,
                    });
                  }}
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
            </Grid>
            <Grid templateColumns={["repeat(1, 1fr)"]} gap={6} mb={6}>
              <Input value={titoloIntervento} onChange={(e) => setTitoloIntervento(e.target.value)}></Input>
            </Grid>
            <Grid templateColumns={["repeat(1, 1fr)", "repeat(5, 1fr)"]} gap={4} mt={8}>
                <Input value={marcaVeicolo} onChange={(e) => setMarcaVeicolo(e.target.value)} placeholder="Marca Veicolo" type="text" required/>
                <Input value={annoVeicolo} onChange={(e) => setAnnoVeicolo(e.target.value)} placeholder="Anno Veicolo" type="number" />
                <Input value={targaVeicolo} onChange={(e) => setTargaVeicolo(e.target.value)} placeholder="Targa Veicolo" type="text" />
                <Input value={kmVeicolo} onChange={(e) => setKmVeicolo(e.target.value)} placeholder="Km Veicolo" type="number" />
                <Input value={cavalliVeicolo} onChange={(e) => setCavalliVeicolo(e.target.value)} placeholder="Cavalli Veicolo" type="number" />
                
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mt={8}>
              <Input value={modelloVeicolo} onChange={(e) => setModelloVeicolo(e.target.value)} placeholder="Modello Veicolo" type="text" required/>
              <Input value={vimVeicolo} onChange={(e) => setVimVeicolo(e.target.value)} placeholder="vim Veicolo" type="text" />
            </Grid>
            <Grid templateColumns={["repeat(1, 1fr)"]} gap={6} mt={6}>
              <Input value={tipoMotore} onChange={(e) => setTipoMotore(e.target.value)} placeholder="Tipo Motore"></Input>
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mt={6}>
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Flex justifyContent="center" alignItems="center" mb={10}>
                  <Heading size="lg">Pezzi</Heading>
                </Flex>
                {pezzi.map((item: any, idx: number) => {
                  //console.log(item)
                  return(
                  <Grid key={idx} templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]} gap={6} mt={4} border="1px solid grey" p={4} borderRadius="md">
                    <Input value={item.name} onChange={(e) => handleChangePezzi(e.target.value, 'name', idx)} placeholder="Nome Pezzo" type="text" />
                    <Select value={item.qta} onChange={(e) =>handleChangePezzi(parseInt(e.target.value), 'qta', idx)}>
                        <option value={0} selected disabled>0</option>
                        {Array.from({ length: 48 }, (_, i) => {
                            const value = (i + 1);
                            return <option value={value} >{value}</option>
                        })}
                    </Select>
                    <Input value={item.price} onChange={(e) => handleChangePezzi(parseInt(e.target.value), 'price', idx)} placeholder="Prezzo" type="number" />
                    <Input value={item.fornitor} onChange={(e) => handleChangePezzi(e.target.value, 'fornitor', idx)} placeholder="Fornitore" type="text" />
                  </Grid>
                )})}
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md" textAlign="center">
                <Flex justifyContent="center" alignItems="center" mb={10}>
                  <Heading size="lg">Acconti</Heading>
                </Flex>
                {acconti.map((item: any, idx: number) => {
                  //console.log(item)
                  return(
                  <Grid key={idx} templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]} gap={6} mt={4} border="1px solid grey" p={4} borderRadius="md">
                    <Input value={item.payment} onChange={(e) => handleChangeAcconti(e.target.value, 'payment', idx)} placeholder="Tipo di pagamento" type="text" />
                    <Input value={item.amount} onChange={(e) => handleChangeAcconti(parseInt(e.target.value), 'amount', idx)} placeholder="Acconto in €" type="number" />
                    <SingleDatepicker
                      name="date-input"
                      date={timestampToDate(item.date)}
                      onDateChange={(date) => handleChangeDate(date, 'date', idx)}
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
                  </Grid>
                  
                )})}
                
              </Box>
              {/*<Box p={4} border="1px solid grey" borderRadius="md">
                <Text mb={1} textAlign="center">
                  Macchina
                </Text>
                <Select
                  textAlign="center"
                  value={macchina}
                  onChange={handleMachineChange}
                  required
                >
                  {machineOptions
                    .sort((a, b) => a.localeCompare(b))
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </Select>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text mb={1} textAlign="center">
                  Commessa
                </Text>
                <Select
                  textAlign="center"
                  value={commessa}
                  onChange={(event) => setCommessa(event.target.value)}
                  required
                >
                  {commessaOptions
                    .sort((a, b) => a.localeCompare(b))
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </Select>
              </Box>
            </Grid>
            {/* <Box p={4}>
                    <Text fontWeight="bold">Our Commessa: {record.ourCommessa}</Text>
                </Box> 
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mb={6}>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text mb={1} textAlign="center">
                  OreLavorate
                </Text>
                <Select
                  textAlign="center"
                  value={oreLavorate}
                  onChange={(event) =>
                    setOreLavorate(Number(event.target.value))
                  }
                  required
                >
                  {optionsOreLav.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.text.it}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text textAlign="center" fontWeight="bold">
                  Data intervento
                </Text>
                <Flex justifyContent="center">
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
                </Flex>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text textAlign="center" fontWeight="bold">
                  Data inserimento
                </Text>
                <Text textAlign="center">{record.dateMod}</Text>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text textAlign="center" fontWeight="bold">
                  Tecnico
                </Text>
                <Text textAlign="center">{record.tecnico}</Text>
              </Box>
              <Box p={4} border="1px solid grey" borderRadius="md">
                <Text textAlign="center" fontWeight="bold">
                  <Icon
                    as={MdCircle}
                    fontSize="large"
                    mr={1}
                    style={{
                      color,
                      verticalAlign: "middle",
                      textAlign: "center",
                    }}
                  />
                  Tipo Intervento
                </Text>
                <Select
                  textAlign="center"
                  value={tipoIntervento}
                  onChange={(event) => setTipoIntervento(event.target.value)}
                  required
                >
                  <option value={tipoIntervento}>{tipoInterventoText}</option>
                  {optionsTipoIntervento.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.text.it}
                    </option>
                  ))}
                </Select>
              </Box>
              {Number(tipoIntervento) > 0 && (
                <Box p={4} border="1px solid grey" borderRadius="md">
                  <FormControl id="Problema" mb={3}>
                    <Text mb={1} textAlign="center">
                      Problema
                    </Text>
                    <Select
                      mb={1}
                      textAlign="center"
                      value={problem}
                      onChange={(event) => setProblem(event.target.value)}
                      required
                    >
                      <option value=""> Inserisci un valore</option>
                      {anotherOptions.map((option, index) => (
                        <option key={index} value={option.text}>
                          {option.text}
                        </option>
                      ))}
                      {Number(tipoIntervento) !== 3 && (
                        <option value="new">Creane uno nuovo...</option>
                      )}
                    </Select>
                  </FormControl>
                  <Grid templateColumns={"repeat(3, 1fr)"} gap={6}>
                    {problem === "new" && Number(tipoIntervento) !== 3 && (
                      <>
                        <GridItem colSpan={2}>
                          <FormControl id="NuovoNomeProblema" mb={3}>
                            <Text mb={1} textAlign="center">
                              Descrizione
                            </Text>
                            <Input
                              mb={1}
                              type="text"
                              textAlign="center"
                              value={newProblem}
                              onChange={(event) =>
                                setNewProblem(event.target.value)
                              }
                              flex="2"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem colSpan={1}>
                          <FormControl id="NuovoNomeProblema" mb={3}>
                            <Text mb={1} textAlign="center" color={"#1a202c"}>
                              _
                            </Text>
                            <Button
                              width="150px"
                              onClick={handleCreateProblems}
                              flex="1"
                            >
                              Crea
                            </Button>
                          </FormControl>
                        </GridItem>
                      </>
                    )}
                  </Grid>
                </Box>
              )}

<Box p={4} border="1px solid grey" borderRadius="md">
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
                    </Box>
            </Grid>
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
                    <Button flexShrink="0" onClick={handleUploadSchema} style={{ background: isClickedSchema ? 'red' : '#2c323d' }}>
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
            <Box p={4} border="1px solid grey" borderRadius="md">
              <Text textAlign="center" fontWeight="bold">
                Note
              </Text>
              <Textarea
                textAlign="center"
                height={150}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                required
              />
            </Box>
            <Flex justifyContent="center">
              <Button type="submit" colorScheme="teal">
                Submit
              </Button>
            </Flex>
          </Box>*/}
          </Grid>
          <Grid templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)"]} gap={6} mt={8}>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" rows={4}/>
              
          </Grid>
          <Flex justifyContent="center" mt={10}>
              <Button type="submit" colorScheme="red">{isLoading ? <Spinner/> : 'Submit'}</Button>
          </Flex>
          </Box>
        </Box>
      </form>
    </Flex>
  );
};

export default EditPage;
