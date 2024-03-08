import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useLocation } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVER_URL); // replace with your server URL

function Recontar() {
    let { state } = useLocation();
    let id = state?.id;

    useEffect(() => {

        const handleCountedValueUpdated = ({ id, countedvalue }) => {
            countedvalue = isNaN(countedvalue) ? 0 : countedvalue; // default to 0 if countedvalue is NaN
            setData(prevData => prevData.map(item => item.id === id ? { ...item, countedvalue } : item));
        };

        socket.on('countedValueUpdated', handleCountedValueUpdated);

        return () => {
            socket.off('countedValueUpdated', handleCountedValueUpdated);
        };

    }, []);

    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER_URL + `/recontar/${id}`)
            .then(response => {
                console.log(response.data)
                setData(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    


    function update() {
        const updateData = data
            .filter(({ countedvalue }) => countedvalue !== -1)
            .map(({ id, countedvalue }) => ({ id, countedvalue }));

        updateData.forEach(({ id, countedvalue }) => {
            axios.put(process.env.REACT_APP_SERVER_URL + `/productos/${id}`, { countedvalue })
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        });


    }
    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#1976d2' }}>
                        <TableRow>
                            <TableCell>Código de Barra</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Físico</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.barcode}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={row.countedvalue}
                                        sx={{ minWidth: 60 }} 
                                        inputProps={{ min: -1, inputMode: 'numeric' }}
                                        onChange={(event) => {
                                            const newValue = parseInt(event.target.value);
                                            setData(data.map(item => item.id === row.id ? { ...item, countedvalue: newValue } : item));

                                            // Emit an event to the server with the updated countedValue
                                            socket.emit('countedValueChange', { id: row.id, countedvalue: newValue });
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Box sx={{ m: 1 }}>
                    <Button variant='contained' onClick={update}>
                        Guardar
                    </Button>
                </Box>
            </TableContainer>

        </>
    );
}

export default Recontar;