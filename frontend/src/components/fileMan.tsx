import React, { useEffect, useState } from 'react';
import 'devextreme/dist/css/dx.dark.css';
import FileManager, { Upload } from 'devextreme-react/file-manager';
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { Permissions } from 'devextreme-react/file-manager';
import { useCustomToast } from './showToast';
import axios from 'axios';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from './navbar';

const FilesManager = () => {
    const { showErrorToast, showSuccessToast } = useCustomToast();
    const [fileItems, setFileItems] = useState<any[]>([]);

    const apriFileBrowser = async () => {
        try {
            const url = new URL(window.location.origin);
            url.port = '3005';
            const response = await axios.get(`${url.toString()}elencofile`);
            setFileItems(response.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showErrorToast("Error" + error.response?.data.error);
            } else if (error instanceof Error) {
                showErrorToast("Error" + error.message);
            }
        }
    };

    

    useEffect(() => {    
        apriFileBrowser();
    }, []);

    return (
        <Flex justifyContent="center" minHeight="50vh">
            <Box >
                <Navbar />
                <FileManager fileSystemProvider={fileItems}>
                    <Permissions
                        create={true}
                        copy={true}
                        move={true}
                        delete={true}
                        rename={true}
                        upload={true}
                        download={true}
                    />
                    <Upload 
                    chunkSize={500000} 
                    maxFileSize={1000000}
                />
                </FileManager>
            </Box>
        </Flex>
    );
}

export default FilesManager;
