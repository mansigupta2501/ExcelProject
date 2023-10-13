import React, { useState } from 'react';
import './App.css'; // Import CSS file for styling
import './styles.css'
import Spinner from './Spinner';
// import Alert from '@mui/material/Alert';
import NavBar from './Navbar'
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ProfitAndLoss = () => {
    const [files, setFiles] = useState({
        pnlPurchaseMaster: [],
        pnlFbaInventory: [],
        paymentReport: []
    });
    const [error, setError] = useState('')
    const [submitForm, setSubmitForm] = useState(false)
    const [alertPopup, setAlertPopup] = useState('')
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFileUpdated, setIsFileUpdated] = useState(false)
    const [progress, setProgress] = useState(null)
    const [downloadLink, setDownloadLink] = useState('');

    const handleFileChange = (fieldName, event) => {
        // console.log(event.target.files, 'filesssss');
        if (!files.pnlPurchaseMaster) {
            setSubmitForm(false)
            setError('Enter purchase master')
        } else if (!files.pnlFbaInventory) {
            setSubmitForm(false)
            setError('Enter Manage FBA Inventory')
        }
        else if (!files.paymentReport) {
            setSubmitForm(false)
            setError('Enter finance report Report')
        } else {
            const updatedFiles = { ...files };
            updatedFiles[fieldName] = event.target.files;
            setFiles(updatedFiles);
            setSubmitForm(true)
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitForm) {
            setError('')
            setLoading(true);
            setAlertPopup('')
            // setAlertPopup('Updating Files')
            setProgress(10)
            console.log('hi nside', files.pnlPurchaseMaster[0]);
            const formData = new FormData();

            Object.entries(files).forEach(([fieldName, fieldFiles]) => {
                for (let i = 0; i < fieldFiles.length; i++) {
                    formData.append(fieldName, fieldFiles[i]);
                }
            });

            try {
                console.log('api call', formData)
                await fetch('http://localhost:8000/api/profitLoss/upload', {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    },
                    method: 'POST',
                    body: formData
                }).then((response) => {
                    const data = response.json();
                    console.log('data', data);
                    data.then((result) => {
                        console.log('result',result?.data?.updatedSummary)
                        result?.data?.updatedSummary ? setFileName(result?.data?.updatedSummary) : setFileName('')
                        setAlertPopup('Your Download is ready')
                        alert('File successfully updated');
                        setLoading(false);
                        setIsFileUpdated(true)
                        // updatedSummary
                }).catch((err)=> console.log('error while resolving promise',err))
                    setAlertPopup(data.message)
                }).catch((error) => {
                        console.error('Error downloading file:', error)
                        setLoading(false)
                        setError('Data not updated')
                        setAlertPopup('Make sure to close all the files from system')
                        setProgress(null)
                    });
                // console.log('response',response);
            } catch (error) {
                // Handle network or other errors
                console.log('Error uploading files', error);
                setLoading(false)
                setProgress(null)
                setError(error.message)
            }
        } else {
            setError('Please Enter purchase master, manage fba inventory, finance report')
            setProgress(null)
            setLoading(false);
        }
    };

    const reFresh = () => {
        setTimeout(() => {
            window.location.reload();
        }, 100); // Adjust the delay as needed
    };

    return (
        <>
            <div className='mainDiv'>
                <NavBar />
                {/* <h3 style={{ textAlign: 'center' }}>File Uploader</h3> */}
                <form onSubmit={handleSubmit} className='formContainer'>
                    <table>
                        <tbody className="file-inputs">
                            <tr className="inputDivContainer">
                                <td className="labelDataClass">
                                    <label htmlFor="pnlPurchaseMaster">Purchase Master</label></td>
                                <td className="inputDataClass">
                                    <input type="file" id="pnlPurchaseMaster" required onChange={(e) => handleFileChange('pnlPurchaseMaster', e)} />
                                </td>
                            </tr>

                            <tr className="inputDivContainer">
                                <td className="labelDataClass">
                                    <label htmlFor="pnlFbaInventory">FBA Inventory</label>
                                </td>
                                <td className="inputDataClass">
                                    <input type="file" id="pnlFbaInventory" required onChange={(e) => handleFileChange('pnlFbaInventory', e)} />
                                </td>
                            </tr>
                            <tr className="inputDivContainer">
                                <td className="labelDataClass">
                                    <label htmlFor="paymentReport">Payment Report</label>
                                </td>
                                <td className="inputDataClass">
                                    <input type="file" id="paymentReport" required onChange={(e) => handleFileChange('paymentReport', e)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {error &&
                        <div className='error'>
                            {error}
                        </div>
                    }
                    {alertPopup &&
                        <div className='alertPopup'>
                            {alertPopup}
                        </div>
                    }
                    <div className='containerBtn'>
                    {
              isFileUpdated ?
                <a href={`http://localhost:8000/api/profitLoss/download/xlsxFile=${fileName}`}>
                  <button className='uploadbutton' type="button">Download P&L Report</button>
                </a> :
                <div>
                    <button className='uploadbutton' id='dailyPnlReport' type="submit">{loading ? <Spinner /> : 'Generate P&L Report'}</button>
                </div>
                }
                        {/* <button onClick={handleSubmit}>Download Excel File</button> */}

                    </div>
                </form>
            </div>
        </>

    );
};

export default ProfitAndLoss;