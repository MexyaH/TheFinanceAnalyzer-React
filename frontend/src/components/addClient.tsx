import React, { useState, useEffect } from 'react';
import {
    Box, Button, Select, Grid,
    Flex, Input,
    Heading,
    Checkbox,
    Spinner,
} from '@chakra-ui/react';
import { useCustomToast } from './showToast';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase'; // import auth from your firebase configuration file
import { setDoc, doc} from 'firebase/firestore';
import Provinces from '../assets/provices.json';

const addClient: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const [isLoading, setIsLoading] = useState(false);
    const [provinces] = useState(Provinces);
    const [nomeCliente, setNomeCliente] = useState('');
    const [indirizzoCliente, setIndirizzoCliente] = useState('');
    const [telefonoCliente, setTelefonoCliente] = useState('');
    const [emailCliente, setEmailCliente] = useState('');
    const [pivaCliente, setPivaCliente] = useState('');
    const [ ncivicoCliente, setNcivicoCliente] = useState('');
    const [capCliente, setCapCliente] = useState('');
    const [cittaCliente, setCittaCliente] = useState('');
    const [provinciaCliente, setProvinciaCliente] = useState('');
    const [statoCliente, setStatoCliente] = useState('');
    const [isAzienda, setIsAzienda] = useState(false);



    useEffect(() => {
        console.log('provinces', provinces);
    }, []);

    // #endregion

    // #region handleChanges

    const resetForm = () => {
        setNomeCliente('');
        setIndirizzoCliente('');
        setTelefonoCliente('');
        setEmailCliente('');
        setPivaCliente('');
        setNcivicoCliente('');
        setCapCliente('');
        setCittaCliente('');
        setProvinciaCliente('');
        setStatoCliente('');
        setIsAzienda(false);
    };


    const handleSubmit = async (event: React.FormEvent) => {

        event.preventDefault();
        setIsLoading(true);
        const formData = {
            nomeCompleto: nomeCliente,
            indirizzo: indirizzoCliente + ', ' + ncivicoCliente + ', ' + capCliente + ' ' + cittaCliente + ' ' + provinciaCliente + ', ' + statoCliente,
            telefono: telefonoCliente,
            email: emailCliente,
            piva: pivaCliente,
            isAzienda: isAzienda,
        }

        await setDoc(doc(firestore, 'clienti', nomeCliente), formData).then(() => {
            showSuccessToast("Cliente aggiunto!");
            resetForm();
            navigate('/');
        }).catch(() => {
            showErrorToast("Qualcosa é andato storto, riprova!");
        })
        setIsLoading(false);
        
    };
    // #endregion

    return (
        <div>

            <Flex justifyContent="center" minHeight="100vh">
                <Box maxWidth="1000px">
                    <Navbar />
                    <Box border="1px solid grey" p={4} borderRadius="md" width='100%'>
                        <Flex justifyContent="center" alignItems="center" mb={3}>
                            <Heading size="lg">Nuovo Cliente</Heading>
                        </Flex>
                        <form onSubmit={handleSubmit}>
                            <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]} gap={6} mt={10}>
                                <Input textAlign="center" value={nomeCliente} onChange={event => setNomeCliente(event.target.value)} placeholder="Nome Cliente" required/>
                                <Input 
                                    textAlign="center" 
                                    value={telefonoCliente} 
                                    onChange={event => {
                                        const value = event.target.value;
                                        // Only allow numeric characters
                                        if (/^\d*$/.test(value)) {
                                        setTelefonoCliente(value);
                                        }
                                    }} 
                                    placeholder="Telefono" 
                                    required 
                                    type="tel"
                                />
                                <Input textAlign="center" value={emailCliente} onChange={event => setEmailCliente(event.target.value)} placeholder="Mail Cliente" required/>
                            </Grid>
                            <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]} gap={6} mt={5}>
                                <Input textAlign="center" value={indirizzoCliente} onChange={event => setIndirizzoCliente(event.target.value)} placeholder="Via/Viale" required/>
                                <Input textAlign="center" value={statoCliente} onChange={event => setStatoCliente(event.target.value)} placeholder="Stato" required />
                            </Grid>
                            <Grid templateColumns={["repeat(1, 1fr)", "repeat(4, 1fr)"]} gap={6} mt={5}>
                                <Input 
                                    textAlign="center" 
                                    value={ncivicoCliente} 
                                    onChange={event => {
                                        const value = event.target.value;
                                        // Only allow numeric characters
                                        if (/^\d*$/.test(value)) {
                                        setNcivicoCliente(value);
                                        }
                                    }} 
                                    placeholder="n. Civico" 
                                    required 
                                    type="tel"
                                />
                                <Input 
                                    textAlign="center" 
                                    value={capCliente} 
                                    onChange={event => {
                                        const value = event.target.value;
                                        // Only allow numeric characters
                                        if (/^\d*$/.test(value)) {
                                        setCapCliente(value);
                                        }
                                    }} 
                                    placeholder="CAP" 
                                    required 
                                    type="tel"
                                />
                                <Input textAlign="center" value={cittaCliente} onChange={event => setCittaCliente(event.target.value)} placeholder="Cittá Cliente" required/>
                                <Select textAlign="center" value={provinciaCliente} onChange={event => setProvinciaCliente(event.target.value)} required>
                                    <option value="" disabled>Provincia</option>
                                    {provinces.map((province, index) => (
                                        <option key={index} value={province.code}>{province.code} - {province.name}</option>
                                    ))}
                                </Select>      
                            </Grid>
                            <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]} gap={6} mt={5}>
                                <Input textAlign="center" value={pivaCliente} onChange={event => setPivaCliente(event.target.value)} placeholder="Partita IVA" required mt={5}/>
                                <Checkbox isChecked={isAzienda} onChange={event => setIsAzienda(event.target.checked)} mt={5}>Azienda</Checkbox>
                            </Grid>
                            <Flex justifyContent="center" mt={10}>
                                <Button type="submit" colorScheme="red">{isLoading ? <Spinner/> : 'Submit'}</Button>
                            </Flex>
                        </form>
                    </Box>
                </Box>
            </Flex>
        </div>
    );
};

export default addClient;


