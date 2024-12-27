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
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";

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
  const [titoloIntervento, setTitoloIntervento] = useState(record.titolo);
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenPezzi,
    onOpen: onOpenPezzi,
    onClose: onClosePezzi,
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
  };

  const handleAddPezzi = () => {
    setPezzi([...pezzi, newPezzi]);
    onClosePezzi();
  };

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
            <Grid templateColumns={["repeat(1, 1fr)"]} gap={6} mb={6}>
              <Box>
                <FieldTitle title="Intervento" />
                <Input
                  value={titoloIntervento}
                  onChange={(e) => setTitoloIntervento(e.target.value)}
                ></Input>
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
                    <Grid
                      key={idx}
                      templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]}
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
                      <Input
                        value={item.fornitor}
                        onChange={(e) =>
                          handleChangePezzi(e.target.value, "fornitor", idx)
                        }
                        placeholder="Fornitore"
                        type="text"
                      />
                    </Grid>
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
                        <Input
                          value={newPezzi.price}
                          onChange={(e) =>
                            handleInputChangePezzi("price", e.target.value)
                          }
                          placeholder="Prezzo"
                          type="number"
                        />
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
                    <Grid
                      key={idx}
                      templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
                      gap={6}
                      mt={4}
                      border="1px solid grey"
                      p={4}
                      borderRadius="md"
                    >
                      <Input
                        value={item.payment}
                        onChange={(e) =>
                          handleChangeAcconti(e.target.value, "payment", idx)
                        }
                        placeholder="Tipo di pagamento"
                        type="text"
                      />
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
                        <Input
                          value={newAcconto.payment}
                          onChange={(e) =>
                            handleInputChange("payment", e.target.value)
                          }
                          placeholder="Tipo di pagamento"
                          type="text"
                        />
                      </Box>
                      <Box>
                        <FieldTitle title="Acconto" />
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
