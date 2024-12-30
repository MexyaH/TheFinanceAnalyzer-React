import React, { useState, useEffect } from "react";

import {
  Box,
  Flex,
  Text,
  Grid,
  Button,
  Select,
  Input,
  Textarea,
  Heading,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  Popover,
  PopoverContent,
  PopoverFooter,
  PopoverBody,
  PopoverHeader,
  PopoverCloseButton,
  PopoverArrow,
  PopoverTrigger,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import { RiDeleteBinFill, RiEditLine } from "react-icons/ri";

import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // import auth from your firebase configuration file
import Navbar from "./navbar";
import { useCustomToast } from "./showToast";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import FieldTitle from "./standardTitle";

const EditPage = () => {
  const location = useLocation();
  const statusMap: { [key: string]: keyof typeof stato } = {
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
  const [cliente, setCliente] = useState(record.nomeCliente);
  const [stato, setStato] = useState(record.stato);
  const [dataInizio, setDataInizio] = useState(record.dataInizio);
  const [dataFine, setDataFine] = useState(record.dataFine);
  const [oreLavorate, setOreLavorate] = useState(record.oreLav);
  const [interventi, setInterventi] = useState(record.interventi);
  const [marcaVeicolo, setMarcaVeicolo] = useState(record.veicolo.marca);
  const [targaVeicolo, setTargaVeicolo] = useState(record.veicolo.targa);
  const [vimVeicolo, setVimVeicolo] = useState(record.veicolo.vim);
  const [annoVeicolo, setAnnoVeicolo] = useState(record.veicolo.anno);
  const [cavalliVeicolo, setCavalliVeicolo] = useState(record.veicolo.cavalli);
  const [modelloVeicolo, setModelloVeicolo] = useState(record.veicolo.modello);
  const [kmVeicolo, setKmVeicolo] = useState(record.veicolo.km);
  const [tipoMotore, setTipoMotore] = useState(record.veicolo.tipomotore);
  const [pezzi, setPezzi] = useState(record.pezzi);
  const [acconti, setAcconti] = useState(record.acconti);
  const [note, setNote] = useState(record.note);
  //console.log(pezzi)

  const [selectedStatus, setSelectedStatus] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [clientiList, setClientiList] = useState<String[]>([""]);
  const [idxInt, setIdxInt] = useState<number>(0);
  const [newAcconto, setNewAcconto] = useState({
    payment: "",
    amount: 0,
    date: {
      seconds: Math.floor(new Date().getTime() / 1000),
      nanoseconds: (new Date().getTime() % 1000) * 1000000,
    },
  });
  const [newPezzi, setNewPezzi] = useState({
    name: "", // Default name
    qta: 0, // Default quantity
    price: 0, // Default price
    fornitor: "", // Default fornitor
  });
  const [editedIntervento, setEditedIntervento] = useState({
    title: "",
    amount: 0,
    date: {
      seconds: Math.floor(new Date().getTime() / 1000),
      nanoseconds: (new Date().getTime() % 1000) * 1000000,
    },
  });

  const [newIntervento, setNewIntervento] = useState({
    title: "",
    amount: 0,
    date: {
      seconds: Math.floor(new Date().getTime() / 1000),
      nanoseconds: (new Date().getTime() % 1000) * 1000000,
    },
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenPezzi,
    onOpen: onOpenPezzi,
    onClose: onClosePezzi,
  } = useDisclosure();

  const {
    isOpen: isOpenEditInterventi,
    onOpen: onOpenEditInterventi,
    onClose: onCloseEditInterventi,
  } = useDisclosure();

  const {
    isOpen: isOpenNewIntervento,
    onOpen: onOpenNewIntervento,
    onClose: onCloseNewIntervento,
  } = useDisclosure();

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

  const fetchAll = async () => {
    await fetchClienti();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAll();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const selectedStatusCalc =
      Object.entries(statusMap).find(([_emoji, key]) => stato[key])?.[0] ||
      "🔵"; // Default to 🔵 if no value is true
    setSelectedStatus(selectedStatusCalc);
  }, [stato]);

  const handleChangePezzi = (value: any, method: any, id: any) => {
    // Create a new copy of the array
    const updatedPezzi = [...pezzi];
    // Update the specific field
    updatedPezzi[id] = { ...updatedPezzi[id], [method]: value };
    // Set the new array as state
    setPezzi(updatedPezzi);
  };

  const handleInputChange = (field: string, value: any) => {
    console.log(field);
    console.log(value);
    setNewAcconto((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date) => {
    setNewAcconto((prev) => ({
      ...prev,
      date: {
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      },
    }));
  };

  const handleInputChangePezzi = (field: string, value: any) => {
    setNewPezzi((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeAcconti = (value: any, method: any, id: any) => {
    // Create a new copy of the array
    const updatedAcconti = [...acconti];
    // Update the specific field
    updatedAcconti[id] = { ...updatedAcconti[id], [method]: value };
    // Set the new array as state
    setAcconti(updatedAcconti);
  };

  const handleChangeDate = (value: any, method: any, id: any) => {
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
  const handleChangeStatus = (event: any) => {
    const selectedEmoji = event.target.value;
    //const selectedKey = statusMap[selectedEmoji];

    // Create a new `stato` object with all values set to false except the selected one
    const updatedStato = Object.keys(statusMap).reduce((acc: any, key: any) => {
      acc[statusMap[key]] = key === selectedEmoji; // Ensure the correct key-value pairing
      return acc;
    }, {});

    // Update the state
    setStato(updatedStato);

    // Update the selectedStatus
    setSelectedStatus(selectedEmoji);
  };

  const handleAddAcconto = () => {
    setAcconti([...acconti, newAcconto]);
    onClose();
    setNewAcconto({
      payment: "",
      amount: 0,
      date: {
        seconds: Math.floor(new Date().getTime() / 1000),
        nanoseconds: (new Date().getTime() % 1000) * 1000000,
      },
    });
  };

  const handleAddPezzi = () => {
    setPezzi([...pezzi, newPezzi]);
    onClosePezzi();
  };

  const handleAddIntervento = () => {
    setInterventi([...interventi, newIntervento]);
    onCloseNewIntervento();
  };

  const handleSubmitInterventi = () => {
    const updatedInterventi = [...interventi];

    // Merge updated fields with the existing ones
    updatedInterventi[idxInt] = {
      ...interventi[idxInt], // Existing data
      ...editedIntervento, // New data (overwrites only the updated fields)
    };

    setInterventi(updatedInterventi); // Update the state
    onCloseEditInterventi(); // Close the modal
  };

  const handleEditInterventi = (idx: number) => {
    setIdxInt(idx);
    setEditedIntervento(interventi[idx]); // Load the selected intervento's current data
    onOpenEditInterventi();
  };

  const handleRemoveIntervento = (idx: number) => {
    const updatedInterventi = interventi.filter((_: any, i: any) => i !== idx);
    setInterventi(updatedInterventi);
  };

  const handleRemovePezzo = (idx: number) => {
    const updatedPezzi = pezzi.filter((_: any, i: number) => i !== idx);
    setPezzi(updatedPezzi);
  };

  const handleRemoveAcconto = (idx: number) => {
    const updatedAcconti = acconti.filter((_: any, i: number) => i !== idx);
    setAcconti(updatedAcconti);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const id = record.id;
    const formData = {
      id: id,
      nomeCliente: cliente,
      interventi: interventi,
      pezzi: pezzi,
      acconti: acconti.map((acconto: any) => ({
        ...acconto,
        date: acconto.date
          ? Timestamp.fromDate(new Date(acconto.date.seconds * 1000))
          : null, // Ensure timestamp format
      })),
      dataInizio: dataInizio
        ? Timestamp.fromDate(new Date(dataInizio.seconds * 1000))
        : null, // Convert to Firestore Timestamp
      dataFine: dataFine
        ? Timestamp.fromDate(new Date(dataFine.seconds * 1000))
        : null, // Convert to Firestore Timestamp
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
                  {clientiList.map((option: any, index: any) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
                <Text textAlign="center" fontWeight="bold">
                  Stato
                </Text>
                <Select
                  textAlign="center"
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                >
                  {/*<option>🔴🟠🟡🟢🔵</option>*/}
                  <option value={"🔵"}>🔵</option>
                  <option value={"🟢"}>🟢</option>
                  <option value={"🟡"}>🟡</option>
                  <option value={"🟠"}>🟠</option>
                  <option value={"🔴"}>🔴</option>
                </Select>
              </Box>
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
                <Text textAlign="center" fontWeight="bold">
                  Ore Lavorate
                </Text>
                <Select
                  textAlign="center"
                  value={oreLavorate}
                  onChange={(e) => setOreLavorate(parseInt(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = i + 1;
                    return <option value={value}>{value}h</option>;
                  })}
                </Select>
              </Box>
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mb={6}>
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
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
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
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
            <Grid
              templateColumns={["repeat(1, 1fr)"]}
              gap={6}
              mb={6}
              w={"100%"}
              textAlign={"center"}
            >
              <Box
                border={"1px solid gray"}
                borderRadius={"md"}
                p={3}
                maxHeight={200}
                overflowY={"auto"}
              >
                <FieldTitle title="Intervento" />
                <Button onClick={onOpenNewIntervento} colorScheme="blue" mb={4}>
                  Aggiungi Intervento
                </Button>
                {interventi.map((item: any, idx: any) => (
                  <Box
                    border={"1px solid gray"}
                    p={3}
                    mb={2}
                    display="grid"
                    gridTemplateColumns="1fr 1fr 1fr auto"
                    gap={4}
                    alignItems="center"
                    borderRadius={"md"}
                  >
                    <Text maxWidth={300} isTruncated>
                      {item.title}
                    </Text>
                    <Text>{item.amount} €</Text>
                    <Text>
                      {timestampToDate(item.date).toLocaleDateString()}
                    </Text>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Popover>
                          <PopoverTrigger>
                            <Button colorScheme="red" size="sm">
                              <RiDeleteBinFill />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Conferma eliminazione</PopoverHeader>
                            <PopoverBody>
                              Sei sicuro di voler eliminare questo intervento?
                            </PopoverBody>
                            <PopoverFooter
                              display="flex"
                              justifyContent="flex-end"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveIntervento(idx)}
                              >
                                Sì, elimina
                              </Button>
                            </PopoverFooter>
                          </PopoverContent>
                        </Popover>
                        <Button
                          size="sm"
                          onClick={() => handleEditInterventi(idx)}
                        >
                          <RiEditLine />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Modal isOpen={isOpenNewIntervento} onClose={onCloseNewIntervento}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Modifica Intervento</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                    <Box>
                      <FieldTitle title="Nome Intervento" />
                      <Input
                        value={newIntervento.title || ""}
                        onChange={(e) =>
                          setNewIntervento((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Nome Intervento"
                        type="text"
                      />
                    </Box>
                    <Box>
                      <FieldTitle title="Costo" />
                      <InputGroup>
                        <Input
                          value={newIntervento.amount || ""}
                          onChange={(e) =>
                            setNewIntervento((prev) => ({
                              ...prev,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="Costo"
                          type="number"
                        />
                        <InputRightElement pointerEvents="none" color="gray.500">
                          €
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Box>
                      <FieldTitle title="Data" />
                      <SingleDatepicker
                        name="date-input"
                        date={
                          newIntervento.date
                            ? timestampToDate(editedIntervento.date)
                            : new Date()
                        }
                        onDateChange={(date) =>
                          setNewIntervento((prev) => ({
                            ...prev,
                            date: {
                              seconds: Math.floor(date.getTime() / 1000),
                              nanoseconds: (date.getTime() % 1000) * 1000000,
                            },
                          }))
                        }
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
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="green"
                    mr={3}
                    onClick={handleAddIntervento}
                  >
                    Modifica
                  </Button>
                  <Button variant="ghost" onClick={onCloseNewIntervento}>
                    Cancella
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Modal
              isOpen={isOpenEditInterventi}
              onClose={onCloseEditInterventi}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Modifica Intervento</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                    <Box>
                      <FieldTitle title="Nome Intervento" />
                      <Input
                        value={editedIntervento.title || ""}
                        onChange={(e) =>
                          setEditedIntervento((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Nome Intervento"
                        type="text"
                      />
                    </Box>
                    <Box>
                      <FieldTitle title="Costo" />
                      <InputGroup>
                        <Input
                          value={editedIntervento.amount || ""}
                          onChange={(e) =>
                            setEditedIntervento((prev) => ({
                              ...prev,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="Costo"
                          type="number"
                        />
                        <InputRightElement pointerEvents="none" color="gray.500">
                          €
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Box>
                      <FieldTitle title="Data" />
                      <SingleDatepicker
                        name="date-input"
                        date={
                          editedIntervento.date
                            ? timestampToDate(editedIntervento.date)
                            : new Date()
                        }
                        onDateChange={(date) =>
                          setEditedIntervento((prev) => ({
                            ...prev,
                            date: {
                              seconds: Math.floor(date.getTime() / 1000),
                              nanoseconds: (date.getTime() % 1000) * 1000000,
                            },
                          }))
                        }
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
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="green"
                    mr={3}
                    onClick={handleSubmitInterventi}
                  >
                    Modifica
                  </Button>
                  <Button variant="ghost" onClick={onCloseEditInterventi}>
                    Cancella
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
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
                <FieldTitle title="Anno" />
                <Input
                  value={annoVeicolo}
                  onChange={(e) => setAnnoVeicolo(e.target.value)}
                  placeholder="Anno Veicolo"
                  type="number"
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
              <Box>
                <FieldTitle title="Cavalli" />
                <Input
                  value={cavalliVeicolo}
                  onChange={(e) => setCavalliVeicolo(e.target.value)}
                  placeholder="Cavalli Veicolo"
                  type="number"
                />
              </Box>
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mt={8}>
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
            </Grid>
            <Grid templateColumns={["repeat(1, 1fr)"]} gap={6} mt={6}>
              <Box>
                <FieldTitle title="Tipo motore" />
                <Input
                  value={tipoMotore}
                  onChange={(e) => setTipoMotore(e.target.value)}
                  placeholder="Tipo Motore"
                ></Input>
              </Box>
            </Grid>
            <Grid templateColumns={["repeat(2, 1fr)"]} gap={6} mt={6}>
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
                <Flex justifyContent="center" alignItems="center" mb={10}>
                  <Heading size="lg">Pezzi</Heading>
                </Flex>
                {pezzi.map((item: any, idx: number) => {
                  //console.log(item)
                  return (
                    <Box key={idx} position="relative" p={4} mt={-5}>
                      <Grid
                        key={idx}
                        templateColumns={["repeat(1, 1fr)", "repeat(5, 1fr)"]}
                        gap={6}
                        mt={4}
                        border="1px solid grey"
                        p={4}
                        borderRadius="md"
                      >
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            handleChangePezzi(e.target.value, "name", idx)
                          }
                          placeholder="Nome Pezzo"
                          type="text"
                        />
                        <Select
                          value={item.qta}
                          onChange={(e) =>
                            handleChangePezzi(
                              parseInt(e.target.value),
                              "qta",
                              idx
                            )
                          }
                        >
                          <option value={0} selected disabled>
                            0
                          </option>
                          {Array.from({ length: 48 }, (_, i) => {
                            const value = i + 1;
                            return <option value={value}>{value}</option>;
                          })}
                        </Select>
                        <InputGroup>
                          <Input
                            value={item.price}
                            onChange={(e) =>
                              handleChangePezzi(
                                parseInt(e.target.value),
                                "price",
                                idx
                              )
                            }
                            placeholder="Prezzo"
                            type="number"
                          />
                          <InputRightElement pointerEvents="none" color="gray.500">
                            €
                          </InputRightElement>
                        </InputGroup>
                        <Input
                          value={item.fornitor}
                          onChange={(e) =>
                            handleChangePezzi(e.target.value, "fornitor", idx)
                          }
                          placeholder="Fornitore"
                          type="text"
                        />
                      </Grid>
                      <Button
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top="52px"
                        right="28px"
                        onClick={() => handleRemovePezzo(idx)}
                      >
                        X
                      </Button>
                    </Box>
                  );
                })}
                <Flex justifyContent="center" mt={4}>
                  <Button onClick={onOpenPezzi} colorScheme="green">
                    Aggiungi Pezzo
                  </Button>
                </Flex>
              </Box>
              <Modal isOpen={isOpenPezzi} onClose={onClosePezzi}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Aggiungi nuovo pezzo</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                      <Box>
                        <FieldTitle title="Nome Pezzo" />
                        <Input
                          value={newPezzi.name}
                          onChange={(e) =>
                            handleInputChangePezzi("name", e.target.value)
                          }
                          placeholder="Nome Pezzo"
                          type="text"
                        />
                      </Box>
                      <Box>
                        <FieldTitle title="Quantità" />
                        <Select
                          value={newPezzi.qta}
                          onChange={(e) =>
                            handleInputChangePezzi("qta", e.target.value)
                          }
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
                            value={newPezzi.price}
                            onChange={(e) =>
                              handleInputChangePezzi("price", e.target.value)
                            }
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
                          value={newPezzi.fornitor}
                          onChange={(e) =>
                            handleInputChangePezzi("fornitor", e.target.value)
                          }
                          placeholder="Fornitore"
                          type="text"
                        />
                      </Box>
                    </Grid>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="green" mr={3} onClick={handleAddPezzi}>
                      Aggiungi
                    </Button>
                    <Button variant="ghost" onClick={onClosePezzi}>
                      Cancella
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Box
                p={4}
                border="1px solid grey"
                borderRadius="md"
                textAlign="center"
              >
                <Flex justifyContent="center" alignItems="center" mb={10}>
                  <Heading size="lg">Acconti</Heading>
                </Flex>
                {acconti.map((item: any, idx: number) => {
                  //console.log(item)
                  return (
                    <Box key={idx} position="relative" p={4} mt={-5}>
                      <Grid
                        key={idx}
                        templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]}
                        gap={6}
                        mt={4}
                        border="1px solid grey"
                        p={4}
                        borderRadius="md"
                      >
                        <Select
                          value={item.payment}
                          onChange={(e) => handleChangeAcconti(e.target.value, "payment", idx)}
                        >
                          <option value="Contanti">Contanti</option>
                          <option value="Bancomat">Bancomat</option>
                        </Select>
                        <InputGroup>
                          <Input
                            value={item.amount}
                            onChange={(e) =>
                              handleChangeAcconti(
                                parseInt(e.target.value),
                                "amount",
                                idx
                              )
                            }
                            placeholder="Acconto in €"
                            type="number"
                          />
                          <InputRightElement pointerEvents="none" color="gray.500">
                            €
                          </InputRightElement>
                        </InputGroup>
                        <SingleDatepicker
                          name="date-input"
                          date={timestampToDate(item.date)}
                          onDateChange={(date) =>
                            handleChangeDate(date, "date", idx)
                          }
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
                      <Button
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top="52px"
                        right="28px"
                        onClick={() => handleRemoveAcconto(idx)}
                      >
                        X
                      </Button>
                    </Box>
                  );
                })}
                <Flex justifyContent="center" mt={4}>
                  <Button onClick={onOpen} colorScheme="green">
                    Aggiungi Acconto
                  </Button>
                </Flex>
              </Box>
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Aggiungi nuovo Acconto</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                      <Box>
                        <FieldTitle title="Tipo pagamento" />
                        <Select
                          value={newAcconto.payment}
                          onChange={(e) =>
                            setNewAcconto((prev) => ({
                              ...prev,
                              payment: e.target.value,
                            }))
                          } // Correctly update the "payment" field
                        >
                          <option value="Contanti">Contanti</option>
                          <option value="Bancomat">Bancomat</option>
                        </Select>
                      </Box>
                      <Box>
                        <FieldTitle title="Acconto" />
                        <InputGroup>
                          <Input
                            value={newAcconto.amount}
                            onChange={(e) =>
                              handleInputChange(
                                "amount",
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder="Acconto in €"
                            type="number"
                          />
                          <InputRightElement pointerEvents="none" color="gray.500">
                            €
                          </InputRightElement>
                        </InputGroup>
                      </Box>
                      <Box>
                        <FieldTitle title="Data pagamento" />
                        <Flex justifyContent="center" alignItems="center">
                          <SingleDatepicker
                            date={timestampToDate(newAcconto.date)}
                            onDateChange={handleDateChange}
                            configs={{
                              dateFormat: "yyyy-MM-dd",
                              dayNames: "Dom,Lun,Mar,Mer,Gio,Ven,Sab".split(
                                ","
                              ),
                              monthNames:
                                "Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dec".split(
                                  ","
                                ),
                              firstDayOfWeek: 1,
                            }}
                          />
                        </Flex>
                      </Box>
                    </Grid>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="green"
                      mr={3}
                      onClick={handleAddAcconto}
                    >
                      Aggiungi
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
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
            <Flex justifyContent="center" mt={10}>
              <Button type="submit" colorScheme="red">
                {isLoading ? <Spinner /> : "Submit"}
              </Button>
            </Flex>
          </Box>
        </Box>
      </form>
    </Flex>
  );
};

export default EditPage;
