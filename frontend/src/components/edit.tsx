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
} from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";

import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase"; // import auth from your firebase configuration file
import Navbar from "./navbar";
import { useCustomToast } from "./showToast";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

const EditPage = () => {
  const location = useLocation();
  const statusMap: { [key: string]: keyof typeof stato } = {
    "🔵": "blueStatus",
    "🟢": "greenStatus",
    "🟡": "yellowStatus",
    "🟠": "orangeStatus",
    "🔴": "redStatus",
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

  const [selectedStatus, setSelectedStatus] = useState<any>();
  const [isLoading, setIsLoading] = useState(false)
  const [clientiList, setClientiList] = useState<String[]>([''])
  
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
      ([_emoji, key]) => stato[key]
    )?.[0] || "🔵"; // Default to 🔵 if no value is true
    setSelectedStatus(selectedStatusCalc)
  }, [stato])

  const handleChangePezzi = (value: any, method: any, id: any) => {
    // Create a new copy of the array
    const updatedPezzi = [...pezzi];
    // Update the specific field
    updatedPezzi[id] = { ...updatedPezzi[id], [method]: value };
    // Set the new array as state
    setPezzi(updatedPezzi);
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
    const selectedKey = statusMap[selectedEmoji];

    // Create a new `stato` object with all values set to false except the selected one
    const updatedStato = Object.keys(stato).reduce((acc: any, key: any) => {
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
                  {clientiList.map((option: any, index: any) => (
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
