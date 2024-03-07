import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useLocation } from 'react-router-dom';
import MUIDataTable from "mui-datatables";

function Resultados() {
    let { state } = useLocation();
    let id = state?.id;
    const [data, setData] = useState([]);

    console.log(data);


    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER_URL + `/resultados/${id}`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);



    const columns = ["Código de Barra", "Descripción", "Sistema", "Físico", "Diferencia"];


      const options = {
        selectableRows: 'none',
      };


    const formatedData = data.map(item => [item.barcode, item.description,item.systemvalue, item.countedvalue, item.countedvalue-item.systemvalue]);
    return (
        <>

            <MUIDataTable
                title={"Resultados"}
                data={formatedData}
                columns={columns}
                options={options}
            />
        </>
    );
}

export default Resultados;