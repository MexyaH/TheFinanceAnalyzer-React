import { useToast } from "@chakra-ui/react";
import { Alert, AlertIcon, Box } from "@chakra-ui/react";

export function useCustomToast() {
  const toast = useToast();

  function showErrorToast(message: string) {
    return toast({
      render: () => (
        <Alert status="error" color="white" p={3} bg="#c53030" borderRadius="lg" width="auto">
          <AlertIcon color="white"/>
          <Box flex="1">
            <strong>{message}</strong>
          </Box>
        </Alert>
      ),
      position: 'top',
    });
  }

  function showSuccessToast(message: string) {
    return toast({
      render: () => (
        <Alert status="success" color="white" p={3} bg="#2f855a" borderRadius="lg" width="auto">
          <AlertIcon color="white"/>
          <Box flex="1">
            <strong>{message}</strong>
          </Box>
        </Alert>
      ),
      position: 'top',
    });
  }

  return { showErrorToast, showSuccessToast };
}