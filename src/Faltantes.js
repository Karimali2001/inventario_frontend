import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useLocation } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


function Faltantes() {
    let { state } = useLocation();
    let id = state?.id;
    const [data, setData] = useState([]);
    const [selectedOption, setSelectedOption] = useState('faltantes');

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER_URL + `/resultados/${id}`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    const formatedData = data
        .filter(item => item.countedvalue !== -1)
        .filter(item => item.systemvalue !== item.countedvalue)
        .filter(item => selectedOption === 'faltantes' ? (item.countedvalue - item.systemvalue) < 0 : (item.countedvalue - item.systemvalue) > 0)
        .map(item => [item.barcode, item.description, item.cost, item.systemvalue, item.countedvalue, item.countedvalue - item.systemvalue]);

    const columns = ["Código de Barra", "Descripción", "Costo", "Sistema", "Físico", "Diferencia"];

    const totalCost = formatedData.reduce((total, row) => total + Math.abs(row[4] - row[3]) * row[2], 0);

    const options = {
        selectableRows: 'none',
        customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
            return (
                <tfoot>
                    <tr>
                        <td colSpan={6} style={{ textAlign: 'right', padding: '24px' }}>
                            Costo Total: {totalCost}
                        </td>
                    </tr>
                </tfoot>
            );
        },
    };

    return (
        <>

            <MUIDataTable
                title={<Select value={selectedOption} onChange={handleChange}>
                    <MenuItem value={'faltantes'}>Faltantes</MenuItem>
                    <MenuItem value={'sobrante'}>Sobrante</MenuItem>
                </Select>}
                data={formatedData}
                columns={columns}
                options={options}
            />
        </>
    );
}

export default Faltantes;