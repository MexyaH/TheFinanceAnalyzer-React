import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase"; // import auth from your firebase configuration file
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import DataGridTable from "./Table";
import Navbar from "./navbar";
import { format } from "date-fns";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";
import { useCustomToast } from "./showToast";

/*interface RawRecords{
  outcome: Expence[],
  income: Income[]
}

interface Expence{
  label: string,
  currency: string,
  amount: number,
  merchant: string,
  date: Date,
  category: string
}

interface Income{
  label: string,
  currency: string,
  amount: number,
  date: Date,
  category: string
}*/

const Homepage: React.FC = () => {
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [rawRecords, setRawRecords] = useState<any>();
  const [balanceIncome, setBalanceIncome] = useState<any>(null);
  const [balanceOutcome, setBalanceOutcome] = useState<any>(null);
  const [file, setFile] = useState(null)
  const [dataExtrapolated, setDataExtrapolated] = useState([])
  const {
    isOpen: isOpenAddMonthlyExpence,
    onOpen: onOpenAddMonthlyExpence,
    onClose: onCloseAddMonthlyExpence,
  } = useDisclosure();

  const [isLoading, setIsLoading] = useState(true);
  const [incomePercentageChange, setIncomePercentageChange] =
    useState<any>(null);
  const [outcomePercentageChange, setOutcomePercentageChange] =
    useState<any>(null);
  const [savingPercentageChange, setSavingPercentageChange] =
    useState<any>(null);

  const fetchRecords = async () => {
    const recordsCollection = collection(firestore, "transaction");
    const currentDate = new Date();

    const lastThreeMonths = [
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
    ];

    const previousThreeMonths = [
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
      format(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        "yyyy-MM"
      ),
    ];

    const fetchDataForMonths = async (months: string[]) => {
      const records = await Promise.all(
        months.map(async (month) => {
          const docRef = doc(recordsCollection, month);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            //console.log(`Data for ${month}:`, data); // Log the fetched data
            return { month, ...data };
          } else {
            //console.log(`No data found for month: ${month}`);
            return null;
          }
        })
      );

      return records.filter((record) => record !== null);
    };

    const lastThreeRecords = await fetchDataForMonths(lastThreeMonths);
    const previousThreeRecords = await fetchDataForMonths(previousThreeMonths);

    const calculateTotals = (records: any[]) => {
      let totalIncome = 0.0;
      let totalOutcome = 0.0;

      records.forEach((record) => {
        record.income?.forEach((item: any) => {
          //console.log('Income item:', item);
          totalIncome += item.amount || 0;
        });
        record.outcome?.forEach((item: any) => {
          //console.log('Outcome item:', item);
          totalOutcome += item.amount || 0;
        });
      });

      //console.log('Calculated Totals - Income:', totalIncome, 'Outcome:', totalOutcome);
      return { totalIncome, totalOutcome, savings: totalIncome - totalOutcome };
    };

    const lastThreeTotals = calculateTotals(lastThreeRecords);
    const previousThreeTotals = calculateTotals(previousThreeRecords);

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const incomePercentageChange = calculatePercentageChange(
      lastThreeTotals.totalIncome,
      previousThreeTotals.totalIncome
    );

    const outcomePercentageChange = calculatePercentageChange(
      lastThreeTotals.totalOutcome,
      previousThreeTotals.totalOutcome
    );

    const savingsPercentageChange = calculatePercentageChange(
      lastThreeTotals.savings,
      previousThreeTotals.savings
    );

    setBalanceIncome(lastThreeTotals.totalIncome || 0);
    setBalanceOutcome(lastThreeTotals.totalOutcome || 0);
    setRawRecords(lastThreeRecords);
    setIncomePercentageChange(incomePercentageChange);
    setOutcomePercentageChange(outcomePercentageChange);
    setSavingPercentageChange(savingsPercentageChange);
    //console.log('Balance Income set to:', lastThreeTotals.totalIncome);
  };

  const fetchAll = async () => {
    await fetchRecords();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAll();
    setIsLoading(false);
  }, []);

  console.log(rawRecords);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          color="#d9e70c"
          size="xl"
          style={{ marginBottom: "20px" }}
        />
        <p>Loading... Please wait</p>
      </div>
    );
  }

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert(errorData.error);
        return;
      }

      const data = await response.json();
      setDataExtrapolated(data)
      showSuccessToast("Dati Inseriti")

    } catch (error) {
      showSuccessToast("Errore: " + error)
    }
  };

  return (
    <Flex justifyContent="center" minHeight="100vh">
      <Box width={"100%"}>
        <Navbar />
        <Box padding={10}>
          <Flex justify="space-between" align="center">
            {/* Left content with CircularProgress */}
            <Box width={"50%"}>
              <CircularProgress
                isIndeterminate={rawRecords == undefined}
                value={
                  rawRecords != undefined && balanceIncome != null
                    ? balanceIncome
                    : undefined
                }
                max={balanceIncome + balanceOutcome}
                color={rawRecords != undefined ? "green.500" : " gray.400"}
                thickness="10px"
                size={200}
              >
                <CircularProgressLabel>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Entrate</StatLabel>
                      <StatNumber>
                        {balanceIncome && balanceIncome.toFixed(2)} €
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {Math.abs(incomePercentageChange).toFixed(2)}%
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </CircularProgressLabel>
              </CircularProgress>
              <CircularProgress
                isIndeterminate={rawRecords == undefined}
                value={
                  rawRecords != undefined && balanceOutcome != null
                    ? balanceOutcome
                    : undefined
                }
                color={rawRecords != undefined ? "red.500" : " gray.400"}
                max={balanceIncome + balanceOutcome}
                thickness="10px"
                size={200}
              >
                <CircularProgressLabel>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Uscite</StatLabel>
                      <StatNumber>
                        {balanceIncome && balanceOutcome.toFixed(2)} €
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type="decrease" />
                        {Math.abs(outcomePercentageChange).toFixed(2)}%
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </CircularProgressLabel>
              </CircularProgress>
              <CircularProgress
                isIndeterminate={rawRecords == undefined}
                value={
                  rawRecords != undefined &&
                  balanceOutcome != null &&
                  balanceIncome != null
                    ? balanceIncome - balanceOutcome
                    : undefined
                }
                color={rawRecords != undefined ? "blue.500" : " gray.400"}
                max={balanceIncome + balanceOutcome}
                thickness="10px"
                size={200}
              >
                <CircularProgressLabel>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Risparmio</StatLabel>
                      <StatNumber>
                        {balanceIncome &&
                          balanceOutcome &&
                          (balanceIncome - balanceOutcome).toFixed(2)}{" "}
                        €
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow
                          type={
                            savingPercentageChange < 0 ? "decrease" : "increase"
                          }
                        />
                        {Math.abs(savingPercentageChange).toFixed(2)}%
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </CircularProgressLabel>
              </CircularProgress>
            </Box>

            {/* Right content */}
            <Box padding={10} width={"50%"}>
              <Button left={"60%"} onClick={() => onOpenAddMonthlyExpence()}>Aggiungi Estratto conto</Button>
            </Box>
          </Flex>
          <Flex justify="space-between" align="center">
            <Box width={"50%"}></Box>

            <Box width="50%" textAlign="right" mr={20}>
              <TableContainer w="50%" ml="auto">
                <Table variant="simple" w="100%" textAlign="center">
                  <Thead>
                    <Tr>
                      <Th textAlign="center">Mese di riferimento inseriti</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rawRecords &&
                      rawRecords.map((item: any) => (
                        <Tr key={Math.floor(Math.random() * 10000)}>
                          <Td textAlign="center">{item.month}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Flex>
        </Box>
      </Box>
      <Modal isOpen={isOpenAddMonthlyExpence} onClose={onCloseAddMonthlyExpence}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aggiungi nuovo Estratto conto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <Box mb={4}>
            <Select placeholder="Seleziona il mese" size="md">
              <option value="january">Gennaio</option>
              <option value="february">Febbraio</option>
              <option value="march">Marzo</option>
              <option value="april">Aprile</option>
              <option value="may">Maggio</option>
              <option value="june">Giugno</option>
              <option value="july">Luglio</option>
              <option value="august">Agosto</option>
              <option value="september">Settembre</option>
              <option value="october">Ottobre</option>
              <option value="november">Novembre</option>
              <option value="december">Dicembre</option>
            </Select>
          </Box>

          {/* File Picker */}
          <Box>
            <Input type="file" size="md" onChange={handleFileChange}/>
          </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleUpload}>
              Aggiungi
            </Button>
            <Button variant="ghost" onClick={onCloseAddMonthlyExpence}>
              Cancella
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Homepage;
