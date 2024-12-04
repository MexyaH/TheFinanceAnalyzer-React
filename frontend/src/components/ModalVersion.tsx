import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Heading, Box, Text, Image, IconButton, Flex } from '@chakra-ui/react'
import { FaTag } from 'react-icons/fa'
import logo from "../assets/autotecnica_botti_logo_completo_nosfondo_bianco.png";


const ModalVersion = () => {
    const { isOpen: isOpenModalVersion, onOpen: onOpenModalVersion, onClose: onCloseModalVersion } = useDisclosure()
    const developer = import.meta.env.VITE_DEVELOPER;

    return (
        <>
            <IconButton variant="outline" colorScheme="red" marginLeft={4} icon={<FaTag />} onClick={onOpenModalVersion} aria-label={''} />
            
			<Modal isOpen={isOpenModalVersion} onClose={onCloseModalVersion} size={"3xl"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>ℹ️ Info</ModalHeader>
                    <ModalBody>
                        <Box textAlign="center">
                            
                            <Flex alignItems="center" justifyContent="center">
                                <Image src={logo} maxWidth="150px" mr={4} />
                                <Heading size="lg">Assistance</Heading>
                            </Flex>
                            <Box marginTop={10}>
                                <Heading size="md" marginTop={5}>Versione</Heading>
                                <Text>0.1</Text>
                                <Heading size="md" marginTop={5}>Ultima Modifica</Heading>
                                <Text>12/11/2024</Text>
                                <Heading size="md" marginTop={5}>Sviluppatore</Heading>
                                <Text>{developer}</Text>
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onCloseModalVersion}>
                            Chiudi
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ModalVersion
