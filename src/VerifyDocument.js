import { Box, Grid, Snackbar } from "@material-ui/core";
import axios from "axios";
import { useRef, useState } from "react";
import CONSTS from "./constants";
import CustomButton from "./CustomButton";
import AlertSnackBar from './AlertSnackBar';
import DocumentInfo from "./DocumentInfo";
export default function VerifyDocument() {
    const [file, setFile] = useState(null);
    const [uploaded, setUploaded] = useState(false);
    const inputRef = useRef(null)
    const [open,setOpen] = useState(false); 
    const [originalDocument,setOriginalDocument] = useState(null);
    const [alertState, setAlertState] = useState({
        text: '',
        alert: false,
        severity: 'success',

    })
    const handleAlertClose = () => {
        setAlertState({ ...alertState, alert: false });
    }
    const verify = () => {
        let formData = new FormData();
        formData.append(
            "doc",
            file,
            file.name
        )
        axios.post('api/documents/verify', formData, { withCredentials: true }).then(
            (data) => {
                if (data.data.verified) {
                    setAlertState({ ...alertState, alert: true, text: 'Document is verified to be legitimate', severity: 'success' });
                    setOriginalDocument(data.data.document);
                    
                }
                else {
                    setAlertState({ ...alertState, alert: true, text: 'Document is verified to be Tampered', severity: 'error' });

                }
            }
        )
    }
    const handleClose = ()=>{
        setOpen(false);
    }
    return (
        <div style={{ width: '100%' }}>
          {open && originalDocument ? (
            <DocumentInfo open = {open}  handleClose={handleClose} document={originalDocument}  ></DocumentInfo>

          ):(<></>) }

            <AlertSnackBar text={alertState.text} alert={alertState.alert} handleClose={handleAlertClose} severity={alertState.severity}></AlertSnackBar>
            <Grid container style={{ width: '50vw', height: '50vh', marginLeft: 'auto', marginTop: '20px', marginRight: 'auto', boxShadow: CONSTS.boxShadow,textAlign:'center' }} alignItems='center' justify='center'>
                <Grid item>
                    <input type="file" accept="pdf" onChange={(event) => { setFile(event.target.files[0]); setUploaded(true) }} ref={inputRef} style={{ display: 'none' }}></input>
                    <Box hidden={uploaded}>

                        <CustomButton text="Upload Document" onClick={() => { inputRef.current.click(); }}></CustomButton>
                    </Box>
                    <Box hidden={!uploaded}>

                        <CustomButton text="Verify Document" onClick={verify} style={{margin:'5px'}}></CustomButton>
                       <Box>

                       {originalDocument ?(

                           <CustomButton text="Document details" style={{margin:'5px'}} onClick={()=>{setOpen(true)}}></CustomButton>
                       ):(<></>)}

                        <CustomButton text="Back" style={{margin:'5px'}} onClick={() => { setUploaded(false); setFile(null);setOriginalDocument(null) }} ></CustomButton>
                       </Box>

                    </Box>
                </Grid>

            </Grid>
        </div>
    )
}