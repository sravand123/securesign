import { Box, Grid, List, ListItem } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Sig from './sig.png';
import CustomButton from "./CustomButton";
import CONSTS from "./constants";
export default function MySignatures(props){
    const [default_,setDefault] = useState(0);
    useEffect(()=>{
        setDefault(props.signatures.default)
    },[props])

    return (
        <React.Fragment>
            <Grid container>
                {props.signatures && props.signatures.signature ? 
                (
                    <Grid container item xs={10} sm={7} style={{margin:'20px',marginLeft:'auto',marginRight:'auto',boxShadow:CONSTS.boxShadow}} justify='center' alignItems='center'>
                    <Grid item xs={11} sm={6}>
                        
                    <img src={props.signatures.signature} style={{width:'60%',padding:'20px'}}></img>
                    </Grid>
                    <Grid item xs={11} sm={6}>
                       <CustomButton text="Replace" style={{margin:'5px'}} onClick = {()=>props.setValue(1)} ></CustomButton> 
                       <Box hidden={default_===0 }>

                       <CustomButton text={default_===0 ?  'default signature' : 'set as default'} style={{margin:'5px'}} onClick={()=>props.changeDefaultSignature(0)} ></CustomButton> 
                       </Box>
                    </Grid>
                </Grid>
                )    : 
                (<></>)
            
            }
           
           {props.signatures && props.signatures.imageSignature ? 
                (
                    <Grid container item xs={10} sm={7} style={{margin:'20px',marginLeft:'auto',marginRight:'auto',boxShadow:CONSTS.boxShadow}} justify='center' alignItems='center'>
                    <Grid item xs={11} sm={6}>
                        
                    <img src={props.signatures.imageSignature} style={{width:'60%',padding:'20px'}}></img>
                    </Grid>
                    <Grid item xs={11} sm={6}>
                       <CustomButton text="Replace" style={{margin:'5px'}} onClick = {()=>props.setValue(2)} ></CustomButton> 
                       <Box hidden={default_===1 }>

                       <CustomButton text={default_===1 ? 'default signature' : 'set as default'} style={{margin:'5px'}} onClick={()=>props.changeDefaultSignature(1)} ></CustomButton> 
</Box>
                    </Grid>
                </Grid>
                )    :
                (<></>)
            
            }
            </Grid>

        </React.Fragment>
    )
}