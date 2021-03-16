import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import SideBar from './SideBar';
import Axios from 'axios';
import Cookies from 'js-cookie';
import Loader from './Loader';
import Files from './Files';
import DocumentInfo from './DocumentInfo';

export default function Status(props) {
    const [state, setState] = useState({
        status: "ALL_DOCUMENTS",
        ALL_DOCUMENTS: null,
        WAITING_FOR_OTHERS: [],
        FAILED: [],
        EXPIRING_SOON: [],
        DRAFTS: [],
        STARRED: [],
        ACTION_REQUIRED: [],
        FAILED: [],
        COMPLETED: [],
        MY_DOCUMENTS: [],
        SHARED_DOCUMENTS: [],
        clicked: false,
        selectedFile: null,
        open: false
    });
    useEffect(() => {
        Axios.get("api/documents", { withCredentials: true }).then(
            data => {
                console.log(data.data);
                seggregate(data.data);
            },
            error => { console.error(error) }
        )
    }, []);

    const seggregate = (documents) => {
        let MY_DOCUMENTS = documents.ownedDocuments;
        let SHARED_DOCUMENTS = documents.sharedDocuments;
        let ALL_DOCUMENTS = [...MY_DOCUMENTS, ...SHARED_DOCUMENTS];
        let WAITING_FOR_OTHERS = [];
        let FAILED = [];
        let DRAFTS = [];
        let COMPLETED = [];
        let ACTION_REQUIRED = [];
        let EXPIRING_SOON = [];
        let STARRED = [];
        MY_DOCUMENTS.forEach((document, index1) => {
            if (document.status === 'sent') {

                let rejected = false;
                let waiting = false;
                let expired = false;
                document.signers.forEach((signer, inex2) => {
                    if (signer.status === 'rejected') rejected = true;
                    if (signer.status === 'waiting') waiting = true;
                    if (Date.now() - new Date(signer.deadline) > 0 && signer.status !== 'signed' && signer.status !== 'rejected') expired = true;

                })
                if (rejected || expired) FAILED.push(document);
                else if (waiting) WAITING_FOR_OTHERS.push(document);
                else COMPLETED.push(document);
            }
            else {
                DRAFTS.push(document);
            }
            if (document.starred) STARRED.push(document);
        })
        SHARED_DOCUMENTS.forEach((document, index1) => {
            let signer = document.signers.filter((signer) =>
                signer.email === Cookies.get('email')
            )[0];
            if (signer) {

                if (signer.status === 'signed') COMPLETED.push(document);
                else if (signer.status === 'rejected') FAILED.push(document);
                else if (new Date(signer.deadline) - Date.now() < 0) FAILED.push(document);
                else if (new Date(signer.deadline) - Date.now() < 86_400_000) {
                    EXPIRING_SOON.push(document);
                    ACTION_REQUIRED.push(document);
                }
                else {
                    ACTION_REQUIRED.push(document);
                }
                if (document.starred) STARRED.push(document);
            }

        })
        setState({
            ...state, ALL_DOCUMENTS: ALL_DOCUMENTS, WAITING_FOR_OTHERS: WAITING_FOR_OTHERS,
            FAILED: FAILED, DRAFTS: DRAFTS, STARRED: STARRED, ACTION_REQUIRED: ACTION_REQUIRED,
            COMPLETED: COMPLETED, MY_DOCUMENTS: MY_DOCUMENTS, SHARED_DOCUMENTS: SHARED_DOCUMENTS,
            EXPIRING_SOON: EXPIRING_SOON
        });
    }

    const setStatus = (status) => {
        setState({ ...state, status: status, selectedFile: null });
    }
    const handleSelect = (event) => {

        for (let index = 0; index < state.ALL_DOCUMENTS.length; index++) {
            if (state.ALL_DOCUMENTS[index]._id === event.currentTarget.id) {
                console.log(state.ALL_DOCUMENTS[index]);
                setState({ ...state, selectedFile: state.ALL_DOCUMENTS[index], open: true });
                break;
            }
        }
    }
    const getDocuments = () => {
        return state[state.status];
    }

    const handleClose = () => {
        setState({ ...state, open: false });
    }
    return (
        <Grid container >
            {state.open ? (<DocumentInfo handleClose={handleClose} document={state.selectedFile} open={state.open}></DocumentInfo>
            ) : (<></>)}
            <Grid item xs={6} sm={4} md={3}  >
                <SideBar setStatus={setStatus}></SideBar>
            </Grid>
            <Grid item xs={6} sm={8} md={9} style={{
            }} >
                {state.ALL_DOCUMENTS  ? (
                    <Files handleSelect={handleSelect} documents={getDocuments()}></Files>
                ) : (
                    <Loader open={true}></Loader>
                )}
            </Grid>

        </Grid>
    );
}
