import React, { Component, useEffect, useRef, useState } from 'react';
import signaturePad from 'signature_pad';
import * as  fileDownload from 'js-file-download';
import { Button, Grid, makeStyles } from '@material-ui/core';
import axios from 'axios';
import trimCanvas from 'trim-canvas'


export default function SignatureBox(props) {
    const [signature_pad, setSignaturePad] = useState(null);
    const canvasRef = useRef(null);
    const parentRef = useRef(null);
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(0);
    const [sig, setSig] = useState(null);
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        console.log(parentRef.current.getBoundingClientRect().width);
        setWidth(parentRef.current.getBoundingClientRect().width);

        let _signature_pad = new signaturePad(canvasRef.current, { penColor: 'black' });
        setSignaturePad(_signature_pad);
        _signature_pad.on();
    },[props])
    
    const  cloneCanvas=(oldCanvas)=> {

        let newCanvas = document.createElement('canvas');
        let context = newCanvas.getContext('2d');
    
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
    
        context.drawImage(oldCanvas, 0, 0);
    
        return newCanvas;
    }
    const handleSave  = async ()=>{
         let canvas = cloneCanvas(canvasRef.current);
         trimCanvas(canvas);
         console.log(canvas.toDataURL());
        var buf = Buffer.from(canvas.toDataURL().split(',')[1], 'base64');
        //let buf  =  ctx.getImageData(0,0,canvas.width,canvas.height).data;
        console.log(buf);
        let file = new File([buf],'signature.png');
    
         let formData = new FormData();
         formData.append(
            "doc",
            file,
            'signature.png'
          );
          formData.append('type','handwritten')

         axios.post('/api/users/uploadsignature',formData,{withCredentials:true}).then(
             (data) => {props.loadSignatures()},
             (err)=>{console.log(err)}
         )
        }
    useEffect(() => {
        setWidth(parentRef.current.getBoundingClientRect().width);
    }, [flag])
    const clear = () => {
        console.log(signature_pad);
        if (signature_pad) {

            signature_pad.clear();
            console.log("clear");
        }
    }
    return (
        <Grid container alignItems='center' justify='center' style={{ textAlign: 'center',width:'100%', marginTop: '10px', marginLeft: '0px', paddingLeft: '0px' }} >

            <Grid item xs={10} sm={8} lg={8} >
                
                <div ref={parentRef} style={{ width: '100%' }}>

                    <canvas width={width} height={250} style={{
                        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
                    }} ref={canvasRef} ></canvas>
                </div>
            </Grid>
            <Grid item xs={8} style={{ textAlign: 'center', margin: '10px' }}>

                <Button variant="contained" color="primary" style={{
                    margin: '5px', backgroundImage:
                        'linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)', fontFamily: 'poppins'
                }} onClick={handleSave} >save or Replace</Button>

                <Button variant="contained" color="primary" style={{
                    margin: '5px', backgroundImage:
                        'linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)', fontFamily: 'poppins'
                }} onClick={clear} >Clear</Button>
            </Grid>

        </Grid>
    )
}
