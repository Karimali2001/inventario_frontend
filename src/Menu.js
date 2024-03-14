import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import { read, utils } from 'xlsx';
import axios from 'axios';

import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';

function HomePage() {

  let { state } = useLocation();
  let id = state?.id;

  const [bandera, setBandera] = useState("");

  const inputFile = useRef(null);

  const navigate = useNavigate();

  const handleButtonClick = (bandera) => {
    setBandera(bandera);
    // // Simulate a click on the file input
    inputFile.current.click();
  };


  const handleContarClick = () => {
    navigate('/contar', { state: { id } });
  };

  const handleRecontarClick = () => {
    navigate('/recontar', { state: { id } });
  };

  const handleResultadosClick = () => {
    navigate('/resultados', { state: { id } });
  };

  const handleFaltantesClick = () => {
    navigate('/faltantes', { state: { id } });
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    // Log the name of the file
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });

        // Assuming the data is on the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert the worksheet to JSON
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

        const inventario = []; // Create an array to store the rows

        // Log every row as an object
        jsonData.forEach((row, rowIndex) => {

          const [barCode, description, systemValue, cost] = row;
          const item = { barCode, description, systemValue, cost, countedValue: -1 };

          inventario.push(item); // Add the item to the inventario array
        });


        if (bandera === "ingresar") {
          // Make a POST request with axios
          axios.post(process.env.REACT_APP_SERVER_URL + `/inventario/${id}`, inventario)
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              console.error(error);
            });
          }else if (bandera === "actualizar") {
          // First, get the current inventory
          axios.get(process.env.REACT_APP_SERVER_URL + `/resultados/${id}`)
            .then(response => {
              const currentInventory = response.data;

              currentInventory.forEach(inventoryItem => {
                const { barcode, systemvalue } = inventoryItem; // Use lowercase property names

                // Check if the item is in the new inventory
                const itemInNewInventory = inventario.some(item => item.barCode === barcode);

                if (itemInNewInventory) {
                  // If the item is in the new inventory, update it
                  const newSystemValue = inventario.find(item => item.barCode === barcode).systemValue;
                  axios.put(process.env.REACT_APP_SERVER_URL + `/cantsistema/${barcode}`, { systemValue: newSystemValue })
                    .then(response => {
                      console.log(response);
                    })
                    .catch(error => {
                      console.error('There was an error!', error);
                    });
                } else {
                  // If the item is not in the new inventory, set its systemValue to 0
                  axios.put(process.env.REACT_APP_SERVER_URL + `/cantsistema/${barcode}`, { systemValue: 0 })
                    .then(response => {
                      console.log(response);
                    })
                    .catch(error => {
                      console.error('There was an error!', error);
                    });
                }
              });
            })
            .catch(error => {
              console.error('There was an error!', error);
            });
        }


        // Reset the file input value
        inputFile.current.value = null;


      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Box sx={{ m: 2 }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} onClick={handleContarClick} variant="contained" fullWidth>
            Contar
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} variant="contained" fullWidth onClick={handleRecontarClick}>
            Recontar 
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} variant="contained" fullWidth onClick={() => handleButtonClick("ingresar")}>
            Ingresar cantidades
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} variant="contained" fullWidth onClick={() => handleButtonClick("actualizar")}>
            Actualizar cantidades
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} variant="contained" fullWidth onClick={handleResultadosClick}>
            Resultados
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button sx={{ height: 120 }} variant="contained" fullWidth onClick={handleFaltantesClick}>
            Faltantes / Sobrantes
          </Button>
        </Grid>
      </Grid>
      <input type="file" ref={inputFile} style={{ display: 'none' }} accept=".xlsx,.xls" onChange={handleFileUpload} />
    </Box>
  );
}

export default HomePage;