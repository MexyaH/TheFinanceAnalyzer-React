import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";

interface RatingProps {
  value: number;
  onClick: (value: number) => void;
  isSelected: boolean;
}

const Rating: React.FC<RatingProps> = ({ value, onClick, isSelected }) => {
  return (
    <Box
      border="2px"
      borderRadius="50%"
      width="30px"
      height="30px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={() => onClick(value)}
      cursor="pointer"
      m={1}
      bg={isSelected ? "#dee70e" : ""}
      color={isSelected ? "#231f20" : ""}
      _hover={{ bg: "#dee70e", color: "#231f20" }} // Add a hover effect
    >
      {value}
    </Box>
  );
};

interface RatingsProps {
  count: number;
  onClick: (value: number) => void;
}

const Ratings: React.FC<RatingsProps> = ({ count, onClick }) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleClick = (value: number) => {
    setSelectedValue(value);
    onClick(value);
  };

  return (
    // <Flex justifyContent="center">
    <Flex justifyContent="center" alignItems="center" >
      {Array.from({ length: count }, (_, i) => (
        <Rating
          key={i}
          value={i + 1}
          onClick={handleClick}
          isSelected={selectedValue === i + 1}
        />
      ))}
      </Flex>
    // </Flex>
  );
};

export { Rating, Ratings };