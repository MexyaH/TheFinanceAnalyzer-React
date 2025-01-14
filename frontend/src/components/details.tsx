import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import { Box, CircularProgress, CircularProgressLabel, Flex, Select, Stat, StatGroup, StatLabel, StatNumber, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
  label: string;
  last3M: number;
  prev3M: number;
}

interface ChartProp {
  selectedLabel: string;
  last3MData: any;
  prev3MData: any;
  last3MTotal: any;
  prev3MTotal: any;
}

const Details: React.FC = () => {
  const { category } = useParams(); // Access the "category" from the URL
  const [selectedCategory] = useState<string | undefined>(category); // Ensure category is a string
  const [last3MData, setLast3MData] = useState([]);
  const [prev3MData, setPrev3MData] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>("");
  const [selectedAmountOfMonths, setSelectedAmountOfMonths] = useState(0);

  useEffect(() => {
    const savedLast3MExpenses = localStorage.getItem("Last3MExpences");
    const savedPrev3MExpenses = localStorage.getItem("Prev3MExpences");
    if (savedLast3MExpenses && savedPrev3MExpenses) {
      setLast3MData(JSON.parse(savedLast3MExpenses));
      setPrev3MData(JSON.parse(savedPrev3MExpenses));
    } else {
      setLast3MData([]); // Default to an empty array if no data is found
      setPrev3MData([]);
    }
  }, []);

  const filteredData = last3MData.slice(0, selectedAmountOfMonths);

  // Further filter expenses by selected category
  const filteredExpenses = filteredData.flatMap((item: any) => item.outcome.filter((expense: any) => expense.category === selectedCategory));

  // Filter expenses by label for both last 3 months and previous 3 months
  const last3MLabelExpenses = filteredExpenses.filter((expense) => expense.label === selectedLabel);
  const prev3MLabelExpenses = prev3MData.flatMap((item: any) => item.outcome.filter((expense: any) => expense.category === selectedCategory)).filter((expense) => expense.label === selectedLabel);

  // Calculate total spending for the label
  const last3MTotal = last3MLabelExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const prev3MTotal = prev3MLabelExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Flex justifyContent="center" minHeight="100vh">
      <Box width={"100%"}>
        <Navbar />
        <Box>
          <Flex justifyContent="center">
            <Select value={selectedAmountOfMonths} onChange={(e) => setSelectedAmountOfMonths(parseInt(e.target.value))} width={400} textAlign={"center"}>
              <option value={0} disabled>
                Seleziona il numero di mesi da visualizzare
              </option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </Select>
          </Flex>
          <Flex mt={10} justify="space-between" align="center" p={5}>
            <Box width="50%">
              <Box>
                <Flex wrap="wrap" gap={2}>
                  {[...new Set(filteredExpenses.map((expense: any) => expense.label))].map((uniqueLabel, index) => (
                    <Box key={index} p={2} bg={selectedLabel === uniqueLabel ? "blue.500" : "gray.600"} borderRadius="md" boxShadow="sm" fontSize="sm" minWidth="100px" textAlign="center" cursor="pointer" onClick={() => setSelectedLabel(uniqueLabel)}>
                      {uniqueLabel}
                    </Box>
                  ))}
                </Flex>
                {selectedLabel && (
                  <Flex mt={6} gap={10} justifyContent="center">
                    {/* Last 3 Months Progress */}
                    <Box textAlign="center" mt={20}>
                      <CircularProgress value={Math.abs(last3MTotal)} max={Math.max(Math.abs(last3MTotal), Math.abs(prev3MTotal))} color={last3MTotal > prev3MTotal ? "red" : "green"} size="190px">
                        <CircularProgressLabel>
                          <StatGroup>
                            <Stat>
                              <StatLabel>Ultimi 3 Mesi</StatLabel>
                              <StatNumber fontSize={20}>{Math.abs(last3MTotal).toFixed(2)} €</StatNumber>
                            </Stat>
                          </StatGroup>
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Box>

                    {/* Previous 3 Months Progress */}
                    <Box textAlign="center" mt={20}>
                      <CircularProgress value={Math.abs(prev3MTotal)} max={Math.max(Math.abs(last3MTotal), Math.abs(prev3MTotal))} color={last3MTotal > prev3MTotal ? "green" : "red"} size="190px">
                        <CircularProgressLabel>
                          <StatGroup>
                            <Stat>
                              <StatLabel>Precedenti 3 Mesi</StatLabel>
                              <StatNumber fontSize={20}>{Math.abs(prev3MTotal).toFixed(2)} €</StatNumber>
                            </Stat>
                          </StatGroup>
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Box>
                    <ChartComponent last3MData={last3MData} prev3MData={prev3MData} selectedLabel={selectedLabel} last3MTotal={last3MTotal} prev3MTotal={prev3MTotal}/>
                  </Flex>
                )}
              </Box>
            </Box>
            <Box width="50%">
              <TableContainer w="100%" maxHeight={500} overflowY={"auto"}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th textAlign="center">Categoria: {selectedCategory}</Th>
                      <Th textAlign="center">Importo</Th>
                      <Th textAlign="center">Esercente</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredExpenses.map((expense: any, index: number) => (
                      <Tr key={index}>
                        <Td textAlign="center">{format(new Date(expense.date), "dd/MM/yyyy")}</Td>
                        <Td textAlign="center">{expense.amount} €</Td>
                        <Td textAlign="center">{expense.label}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

const ChartComponent: React.FC<ChartProp> = ({ last3MData, prev3MData, selectedLabel, last3MTotal, prev3MTotal }) => {
  const [chartData, setChartData] = useState([]);

  const processDataForBarChart = (last3MData: any[], prev3MData: any[], selectedLabel: string | null): ChartData[] => {
    console.log(last3MData, prev3MData);
    if (!Array.isArray(last3MData) || !Array.isArray(prev3MData)) {
      return [];
    }

    if (!selectedLabel) return [];

    const labelTotals: ChartData = { label: selectedLabel, last3M: 0, prev3M: 0 };

    last3MData.forEach((item) => {
      item.outcome.forEach((expense: any) => {
        if (expense.label === selectedLabel) {
          labelTotals.last3M += expense.amount;
        }
      });
    });

    prev3MData.forEach((item) => {
      item.outcome.forEach((expense: any) => {
        if (expense.label === selectedLabel) {
          labelTotals.prev3M += expense.amount;
        }
      });
    });

    return [labelTotals];
  };

  useEffect(() => {
    const processedData: any = processDataForBarChart(last3MData, prev3MData, selectedLabel);
    setChartData(processedData);
  }, [last3MData, prev3MData, selectedLabel]);

  if (!Array.isArray(last3MData) || !Array.isArray(prev3MData)) {
    return <div>Loading data...</div>;
  }

  return (
    <ResponsiveContainer width="30%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="last3M" fill={last3MTotal > prev3MTotal ? "red" : "green"} name="Ultimi 3 Mesi" />
        <Bar dataKey="prev3M" fill={last3MTotal > prev3MTotal ? "green" : "red"} name="Precedenti 3 Mesi" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Details;
