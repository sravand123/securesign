import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  makeStyles,
  Grid,
  Divider
} from "@material-ui/core";
import BasicTimeline from "./TimeLine";
import CustomButton from "./CustomButton";
import CONSTS from "./constants";
import SignersTable from './SignersTable';
export default function DocumentInfo(props) {

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const completeFlow = ()=>{
    window.location.replace('../../add/'+props.document._id);
  }
  const useStyles = makeStyles(() => ({
    tabItem: {
      fontFamily: 'Poppins',
      fontWeight: 'bold', fontFamily: 'poppins',
      textTransform: 'capitalize'
    }
  }));
  const classes = useStyles();
  return (
    <div >
      <Dialog fullScreen
        open={props.open}
        onClose={props.handleClose}
        fullWidth={true}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent style={{ padding: '0px' }}>
          <Paper square >
            <Tabs
              value={value}
              indicatorColor="secondary"

              style={{ backgroundImage: CONSTS.backgroundImage, color: 'white' }}
              onChange={handleChange}
              centered
            >

              <Tab className={classes.tabItem} label="Info" />
              <Tab className={classes.tabItem} label="Signers" />
            </Tabs>
          </Paper>
          <Grid container justify='center' alignItems='center'  >
            <Grid item xs={10} sm={6} hidden={value !== 0} style={{ margin: '20px' }}>

              <div style={{ boxShadow: CONSTS.boxShadow, padding: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <DescriptionIcon style={{ fontSize: 30, position: 'relative', top: '5px' }}></DescriptionIcon>
                  <span style={{ fontSize: 20, fontWeight: 'bold' }}> Document Info</span>
                </div>
                <Divider></Divider>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', }}>
                  Title
                    </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  {props.document.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', }}>
                  Description
                    </Typography>
                <Typography variant="subtitle2" gutterBottom >
                  {props.document.description !== 'null' ? props.document.description : "No description is provided"}
                </Typography>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', }}>
                  Creation Date
                    </Typography>
                <Typography variant="subtitle2" gutterBottom >
                  {props.document.createdTime}
                </Typography>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', }}>
                  Last Modified Date
                    </Typography>
                <Typography variant="subtitle2" gutterBottom >
                  {props.document.lastModifiedTime}
                </Typography>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', }}>
                  Owner
                    </Typography>
                <Typography variant="subtitle2" gutterBottom >
                  {props.document.owner}
                </Typography>
              </div>

            </Grid>

            <Grid hidden={value !== 1} item xs={12} sm={8}   >
              <div style={{ boxShadow: CONSTS.boxShadow, padding: '20px', margin: '20px' }}>

                <SignersTable signers={props.document.signers}></SignersTable>
              </div>
            </Grid>
            <Grid item xs={10} sm={4} hidden={value !== 0} style={{maxHeight:'80vh',overflowY:'scroll'}}>
              <BasicTimeline timeline={props.document.timeline}></BasicTimeline>
            </Grid>
          </Grid>



        </DialogContent>
        <DialogActions>
          {
          props.document.status!=='sent' ? ( <CustomButton text="Complete Flow" onClick={completeFlow} >
          </CustomButton>):(
            <></>
          )
          }
       
          <CustomButton text="Cancel" onClick={props.handleClose} >
            Cancel
          </CustomButton>
          <CustomButton text="Open Document" onClick={() => { window.location.replace('/doc/' + props.document._id) }}  >
            Open Document
          </CustomButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
