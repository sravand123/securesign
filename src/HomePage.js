import { Button, Card, CardContent, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import React, { Component, useEffect } from 'react';
import BackupIcon from '@material-ui/icons/Backup';
import axios from "axios";
import CONSTS from "./constants";
import CustomButton from "./CustomButton";
import Signature from './sig.png'
export default function HomePage() {

    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            alignContent: 'flex-start',
            alignItems: 'center',
            justifyItems: 'flex-start',
            flexWrap: 'wrap'
        },

        items: {
            '&:hover': {
                boxShadow: CONSTS.boxShadow
            },
            width: 'auto',
            [theme.breakpoints.down('sm')]: {
                width: '40%'
            },
            [theme.breakpoints.down('xs')]: {
                width: '80%'
            },
            minWidth: '25%',
            height: 'auto',
            margin: '10px',
            transition: 'all 0.3s'
        },
        itemHeading: {
            fontFamily: CONSTS.fontFamily,
            fontWeight: '900',
            color: 'white',
            fontSize: '1.5rem',
            textAlign: 'left',
            padding: '10px',



        },
        itemTxt: {
            fontFamily: CONSTS.fontFamily,
            fontWeight: '900',
            color: 'white',
            fontSize: '2rem',
            textAlign: 'left',
            marginLeft: '10px',
        },
        outerBox: {
            width: '90vw',
            height: '60vh',
            boxSizing: 'border-box',
            marginTop: '30px',
            backgroundColor: 'white',
            boxShadow: CONSTS.boxShadow,
            marginLeft: 'auto', marginRight: 'auto',
            fontFamily: 'poppins',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        innerBox: {
            width: '80vw',
            height: '50vh',
            border: '2px dashed grey',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        thirdItem: {
            '&:hover': {
                boxShadow: CONSTS.boxShadow
            },
            [theme.breakpoints.down('sm')]: {
                width: '80%'
            },
            transition: 'all 0.3s'

        }
    }))

    const classes = useStyles();
    return (
        <React.Fragment>

            {/* <div className={classes.root} >
                <div className={classes.items} style={{
                    backgroundColor: '#fbb034',
                    backgroundImage: 'linear-gradient(315deg, #fbb034 0%, #ffdd00 74%)'
                }}>
                    <p className={classes.itemHeading}>Active Documents</p>

                    <p className={classes.itemTxt}>12</p>

                </div>
                <div className={classes.items} style={{
                    backgroundColor: '#f5d020',
                    backgroundImage: 'linear-gradient(315deg, #f5d020 0%, #f53803 74%)'
                }}>
                    <p className={classes.itemHeading}>Expiring Soon</p>
                    <p className={classes.itemTxt}>09</p>

                </div>
                <div className={classes.items} className={classes.thirdItem} style={{

                    backgroundColor: '#3bb78f',
                    backgroundImage: 'linear-gradient(to right, #11998e, #38ef7d)'
                }}>
                    <p className={classes.itemHeading}>Completed Documents</p>
                    <p className={classes.itemTxt}>500</p>
                </div>


            </div> */}
            <Grid container justify='space-around' style={{ justifyContent: 'center' }}  >
                <Grid  onClick={()=>{window.location.replace('/sig')}} item xs={10} sm={4} md={2} style={{
                    backgroundColor: '#6b5b95', margin: '5px', color: 'white', fontFamily: 'poppins',cursor:'pointer'
                }}>
                    <div style={{ height: '15vh' }}>

                        <Typography variant='h5' style={{ padding: '15px',fontFamily: 'poppins',fontWeight:'bold' }}>Manage Your</Typography>
                    </div>
                    <div>

                        <Typography variant='h5' style={{ padding: '15px',fontFamily: 'Dancing Script ,cursive',fontWeight:'bold' }} >Signature</Typography>
                    </div>

                </Grid>
                <Grid item xs={10} sm={4} md={2} style={{
                    backgroundColor: '#feb236', margin: '5px', color: 'white', fontFamily: 'poppins'
                }}>
                    <div style={{ height: '15vh' }}>

                        <Typography variant='h5' style={{ padding: '15px' ,fontFamily: 'poppins',fontWeight:'bold'}}>Expiring Soon</Typography>
                    </div>
                    <div>

                        <Typography variant='h5' style={{ padding: '15px' }} >20</Typography>
                    </div>
                </Grid>
                <Grid item xs={10} sm={4} md={2} style={{
                    backgroundColor: '#d64161', margin: '5px', color: 'white', fontFamily: 'poppins'
                }}>
                    <div style={{ height: '15vh' }}>

                        <Typography variant='h5' style={{ padding: '15px',fontFamily: 'poppins',fontWeight:'bold' }}>Completed</Typography>
                    </div>
                    <div>

                        <Typography variant='h5' style={{ padding: '15px', marginBottom: '0px' }} >20</Typography>
                    </div>

                </Grid>
                <Grid item xs={10} sm={4} md={2} style={{
                    backgroundColor: '#ff7b25', margin: '5px', color: 'white', fontFamily: 'poppins'
                }}>
                    <div style={{ height: '15vh' }}>

                        <Typography variant='h5' style={{ padding: '15px',fontFamily:'poppins',fontWeight:'bold' }}>Drafts</Typography>
                    </div>
                    <div>

                        <Typography variant='h5' style={{ padding: '15px',fontFamily: 'poppins', marginBottom: '0px' }} >20</Typography>
                    </div>
                </Grid>
            </Grid>
            <div className={classes.outerBox}  >
                <div className={classes.innerBox} >
                    <CustomButton text=" Add Document" onClick={() => { window.location.replace('/add/new') }} icon={BackupIcon}></CustomButton>

                </div>
            </div>
        </React.Fragment>

    )
}
