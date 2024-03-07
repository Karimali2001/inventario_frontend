import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Grid from '@mui/material/Grid';

function createData(title, date) {
  return { title, date };
}

export default function App() {

  const navigate = useNavigate();

  // const [rows, setRows] = React.useState([
  //   createData('Medicamentos', '2022-01-01'),
  //   createData('Miscelaneos', '2022-01-02'),
  //   createData('Vitrina', '2022-01-03'),
  //   // Add more rows as needed
  // ]);
  const [rows, setRows] = React.useState([]);


  const [selectedRow, setSelectedRow] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // const handleAddRow = () => {
  //   // Add a new row with the entered title and today's date
  //   const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  //   setRows([...rows, createData(title, today)]);
  //   setTitle(''); // Clear the title
  //   handleClose(); // Close the dialog
  // };

  const handleAddRow = () => {
    const today = new Date(); // Get today's date as a Date object
    const newRow = createData(title, today);

    axios.post(process.env.REACT_APP_SERVER_URL + '/inventarios', newRow)
      .then(response => {
        const newRow = {
          ...response.data,
          date: new Date(response.data.date),
        };
        setRows(prevRows => [...prevRows, newRow]); // Append the new row to the existing rows
        setTitle(''); // Clear the title
        handleClose(); // Close the dialog
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  function handleDeleteRow() {
    const id = selectedRow.id;
    // Show a confirmation dialog
    if (window.confirm('¿Estas seguro que deseas borrar este inventario?')) {
      // If the user confirmed, delete the row
      deleteRow(id);
    }
  }

  const handleSelectRow = () => {
    if (selectedRow) {
      const id = selectedRow.id;
      navigate('/menu', { state: { id } });
    }
  };

  const deleteRow = (id) => {
    axios.delete(process.env.REACT_APP_SERVER_URL + '/inventarios/' + id)
      .then(response => {
        setRows(prevRows => prevRows.filter(row => row.id !== id)); // Remove the deleted row from the state
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Fetch data from the server when the component mounts
  useEffect(() => {
    fetch(process.env.REACT_APP_SERVER_URL + '/inventarios')
      .then(response => response.json())
      .then(data => {
        const updatedData = data.map(item => ({
          ...item,
          date: new Date(item.date),
        }));

        setRows(updatedData);
      })
      .catch(error => console.error('Error:', error));
  }, []); // Empty dependency array means this effect runs once on mount


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', margin: '10px' }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', marginBottom: 1, alignItems: 'center' }}>
        <Typography variant='h4'>Lista de Inventarios</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" onClick={handleSelectRow} disabled={!selectedRow}>
              Seleccionar
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="success" onClick={handleOpen} sx={{ marginLeft: 1 }}>
              Crear Inventario
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteRow} disabled={!selectedRow} sx={{ marginLeft: 1 }}>
              Eliminar
            </Button>
          </Grid>
        </Grid>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Titulo</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} selected={row === selectedRow} onClick={() => setSelectedRow(row)}>
                <TableCell component="th" scope="row">
                  {row.title}
                </TableCell>
                <TableCell>{row.date.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Inventario</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Titulo" fullWidth value={title} onChange={e => setTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddRow}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}