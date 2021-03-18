import { Grid } from "@material-ui/core";
import { Backup } from "@material-ui/icons";
import axios from "axios";
import React, { useRef, useState } from "react";
import CONSTS from "./constants";
import CustomButton from "./CustomButton";
import Sig from './sig.png';
export default function SignatureImage(props){
    const [uploaded,setUploaded] = useState(false);
    const inputRef = useRef(null);
    const [image,setImage] = useState(null);
    const [imageFile,setImageFile] = useState(null);

    const handleChange = (event)=>{
        setImageFile(event.target.files[0]);
        setImage(URL.createObjectURL(event.target.files[0]));
        setUploaded(true);   
    }
    const handleSave  = async ()=>{
       
        let file = imageFile;
        let formData = new FormData();
        formData.append(
           "doc",
           file,
           'signature.png'
         );
         formData.append('type','image')

        axios.post('/api/users/uploadsignature',formData,{withCredentials:true}).then(
            (data) => {props.loadSignatures()},
            (err)=>{console.log(err)}
        )
       }
    return(
        <React.Fragment>
            <div style={{textAlign:'center',width:'100%'}}>

            <Grid  container style={{height:'40vh',marginTop:'20px',marginLeft:'auto',marginRight:'auto',width:'50%',boxShadow:CONSTS.boxShadow}} justify='center' alignItems='center' >
             {!uploaded ?
             (
                <Grid item  >
                <input type="file" accept="image/png, image/jpeg" onChange={handleChange} ref={inputRef} style={{display:'none'}} ></input>
                <CustomButton text="Upload Image" icon={Backup} onClick={()=>{inputRef.current.click()}}></CustomButton>
                </Grid> 
             ):
             (
                 <>
                <Grid item xs={4} >
                <img style={{width:'100%',padding:'10px'}} src={image}></img>
                 </Grid>
                  <Grid item xs={6}>
                  <CustomButton text="Save" style={{margin:'10px'}} onClick={handleSave}></CustomButton>
                  <CustomButton text="Back" onClick={()=>{setUploaded(false);setImage(null)}}></CustomButton>

              </Grid>
              </>
             )
                }
            
            
            
            </Grid>
            </div>

        </React.Fragment>
    )
}