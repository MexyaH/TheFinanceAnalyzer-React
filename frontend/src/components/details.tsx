import React, { useState } from "react";
import Navbar from "./navbar";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const Details: React.FC = () => {
  // const { _showErrorToast, showSuccessToast } = useCustomToast();
  const { category } = useParams(); // Access the "category" from the URL
  const [selectedCategory] = useState<any>(category);

  console.log(selectedCategory);

  return (
    <Flex justifyContent="center" minHeight="100vh">
      <Box width={"100%"}>
        <Navbar />
      </Box>
    </Flex>
  );
};

export default Details;
