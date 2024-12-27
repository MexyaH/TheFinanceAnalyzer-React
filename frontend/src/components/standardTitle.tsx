import { Flex, Text } from "@chakra-ui/react";

const FieldTitle = ({ title }: { title: string }) => (
  <Flex justifyContent="center" alignItems="center" mb={2}>
    <Text fontWeight="bold" textAlign="center">
      {title}
    </Text>
  </Flex>
);

export default FieldTitle