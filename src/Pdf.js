import React, { useEffect, useState } from 'react';
import Page from './Page';
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { grey } from '@material-ui/core/colors';
import { AppBar, Grid, makeStyles, Toolbar, Typography } from '@material-ui/core';
import CONSTS from './constants';
import { Link } from 'react-router-dom';
import CustomButton from './CustomButton';
import { Button } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import CreateIcon from '@material-ui/icons/Create';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import Comments from './Comments';
import axios from 'axios';
export default function Pdf(props) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const [state, _setState] = useState({
        scale: 1.3,
        pages: [],
        name: null,
        pdf: null,
        open: false
    })
    const setState = (data) => {
        _setState({ ...state, ...data });
    }

    useEffect(() => {

        setState({ pdf: props.pdf });

        let pdfPages = [];
        const loadingTask = pdfjsLib.getDocument(props.pdf);

        loadingTask.promise.then(function (pdf) {
            for (let i = 0; i < pdf.numPages; i++) {
                pdf.getPage(i + 1).then(page => {
                    pdfPages = [...pdfPages, page]
                    if (pdfPages.length === pdf.numPages) {
                        setState({ pages: pdfPages });
                    }
                })
            }
        });



    }, [props]);
    const useStyles = makeStyles(({
        root: {
            height: '88vh',
            maxHeight: '88vh',
            overflowX: 'scroll',
            backgroundColor: grey[100]
        },
        title: {
            fontFamily: 'poppins',
            fontWeight: 600
        }
    }))
    const generatePages = () => {
        return state.pages.map((page, index) => {
            return (
                <Page
                    key={`page_${index + 1}`}
                    page={page}
                    scale={state.scale}
                    pageNum={index}

                />
            );
        })
    }
    const handleSign = ()=>{
        axios.post('/api/documents/'+localStorage.getItem('current_id')+'/sign',{},{withCredentials:true}).then(
            (data)=>{

            }
        )
    }
    const handleReject = ()=>{
        axios.post('/api/documents/'+localStorage.getItem('current_id')+'/reject',{},{withCredentials:true}).then(
            (data)=>{

            }
        )
    }
    const classes = useStyles();
    return (

        <React.Fragment  >
            <AppBar position="static" style={{ backgroundImage: CONSTS.backgroundImage }}>
                <Toolbar>
                    <Typography variant="body1" className={classes.title}>
                        <PictureAsPdfIcon style={{ position: 'relative', top: '5px' }}></PictureAsPdfIcon> <span>{props.name}</span>
                    </Typography>
                    <div style={{ marginLeft: 'auto' }}>
                        <Button color="inherit" onClick={() => { setState({ open: true }) }}><CommentIcon></CommentIcon></Button>
                        <Button color="inherit" onClick={() => { setState({ open: false }) }} ><CreateIcon></CreateIcon></Button>

                    </div>


                </Toolbar>
            </AppBar>

            <Grid container>
                <Grid item xs={9}>
                    <div className={classes.root}>
                        {generatePages()}
                    </div>
                </Grid>
                {state.open ? (<Grid item xs={3}>
                    <Comments open={state.open} setState={setState}></Comments>
                </Grid>) : (<Grid item xs={3} justify='center' alignItems='center'>
                    <Grid container style={{width:'100%',height:'100%'}} justify='center' alignItems='center'>

                            <div >

                            <CustomButton text="Sign" onClick={handleSign} style={{width:'80%',margin:'10px'}} ></CustomButton>
                      

                            <CustomButton text="Reject" onClick={handleReject} style={{width:'80%',margin:'10px'}}></CustomButton>
                            </div>
                        </Grid>
                </Grid>)}


            </Grid>
        </React.Fragment>

    );
}