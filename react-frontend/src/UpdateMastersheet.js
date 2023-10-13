import React, { useState } from 'react';
import './App.css'; // Import CSS file for styling
import './styles.css'
import Spinner from './Spinner';
// import Alert from '@mui/material/Alert';
import NavBar from './Navbar'
// import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const UpdateMastersheet = () => {
  const [files, setFiles] = useState({
    purchaseMaster: [],
    fbaInventory: [],
    businessReport: [],
    easyopsDamage: [],
    targetFile: [],
    feesPreview: [],
    agingFile: []
  });
  const [error, setError] = useState('')
  const [submitForm, setSubmitForm] = useState(false)
  const [alertPopup, setAlertPopup] = useState('')
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFileUpdated, setIsFileUpdated] = useState(false)
  const [progress, setProgress] = useState(null)
  const handleFileChange = (fieldName, event) => {
    // console.log(event.target.files, 'filesssss');
    if (!files.purchaseMaster) {
      setSubmitForm(false)
      setError('Enter purchase master')
    } else if (!files.fbaInventory) {
      setSubmitForm(false)
      setError('Enter Manage FBA Inventory')
    }
    else if (!files.businessReport) {
      setSubmitForm(false)
      setError('Enter Business Report')
    }
    // else if (!files.qwtt) {
    //   setSubmitForm(false)
    //   setError('Enter QWTT File')
    // }
    else if (!files.targetFile) {
      setSubmitForm(false)
      setError('Enter Master Sheet')
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
      console.log('hi nside', files.purchaseMaster[0]);
      const formData = new FormData();

      Object.entries(files).forEach(([fieldName, fieldFiles]) => {
        for (let i = 0; i < fieldFiles.length; i++) {
          formData.append(fieldName, fieldFiles[i]);
        }
      });

      try {
        console.log('api call', formData)




        //  // get progress
        //         const reader = response.body.getReader();
        //       while (true) {
        //         const { done, value } = await reader.read();
        //         if (done) break;
        //         const progressbar = new TextDecoder().decode(value);
        //         console.log(progressbar, 'progress'); // Update the UI with progress information
        //         if(progressbar === 'MasterSheet.xlsx'){
        //           setFileName(progressbar)
        //           setProgress(100)
        //           setLoading(false)
        //           isFileUpdated(true)
        //         }
        //         else{
        //           setProgress(progressbar)
        //         }
        //       }
        //       // end
        //       // console.log('progressssssssss',progress);
        //       console.log('response', response);
        await fetch('http://206.72.206.254:8000/api/mastersheet/upload', {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          method: 'POST',
          body: formData
        }).then((data) =>
          data.json().then((data) => {
            data?.data?.updatedFile ? setFileName(data?.data?.updatedFile) : setFileName('')
            console.log('response data-', data)


            //end
            if (data.error === true) {
              console.log('error is here');
              setLoading(false)
              setError(data.message)
              setAlertPopup('')
              setIsFileUpdated(false);
              setProgress(null)
            }
            else if (data.success === true) {
              console.log('File successfully uploaded');
              setProgress(100)
              setAlertPopup('Your Download is ready')
              alert('File successfully updated');
              setLoading(false);
              setIsFileUpdated(true);
            }
          }
          )).catch(error => {
            //  Handle other errors
            console.log('errororororor', error);
            setLoading(false)
            setError('Data not updated')
            setAlertPopup('Make sure to close all the files from system')
            setProgress(null)
            console.log('An error occurred:', error.message);
            // reFresh()
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
      setError('Please Enter purchase master, manage fba inventory, matsersheet, business report')
      setProgress(null)
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     let response = await fetch('http://206.72.206.254:8000/api/progress')
  //     const reader = response.body.getReader();

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;

  //       const progress = new TextDecoder().decode(value);
  //       console.log(progress); // Update the UI with progress information
  //     }
  //   };

  //   fetchData();
  // }, []);

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
                  <label htmlFor="purchaseMaster">Purchase Master</label></td>
                <td className="inputDataClass">
                  <input type="file" id="purchaseMaster" required onChange={(e) => handleFileChange('purchaseMaster', e)} />
                </td>
              </tr>

              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="fbaInventory">FBA Inventory</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="fbaInventory" required onChange={(e) => handleFileChange('fbaInventory', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="businessReport">Business Report</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="businessReport" required onChange={(e) => handleFileChange('businessReport', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="easyopsDamage">Easyops Damage</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="easyopsDamage" onChange={(e) => handleFileChange('easyopsDamage', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="inventoryLedger">Inventory Ledger</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="inventoryLedger" required onChange={(e) => handleFileChange('inventoryLedger', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="targetFile">Target File</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="targetFile" required onChange={(e) => handleFileChange('targetFile', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="feesPreview">Fees File</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="feesPreview" onChange={(e) => handleFileChange('feesPreview', e)} />
                </td>
              </tr>
              <tr className="inputDivContainer">
                <td className="labelDataClass">
                  <label htmlFor="agingFile">Aging File</label>
                </td>
                <td className="inputDataClass">
                  <input type="file" id="agingFile" onChange={(e) => handleFileChange('agingFile', e)} />
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
            {/* */}


            {/* disabled={disable} */}
            {/* {
              loading ?
                // <ProgressBar now={progress} label={`${progress}%`} animated /> : ''
            } */}
            {
              isFileUpdated ?
                <a href={`http://206.72.206.254:8000/api/mastersheet/download/xlsxFile=${fileName}`}>
                  <button className='uploadbutton' type="button">Download file</button>
                </a> :
                <button className='uploadbutton' type="submit">{loading ? <Spinner /> : 'Upload file'}</button>
            }


          </div>
        </form>
      </div>
    </>

  );
};

export default UpdateMastersheet;