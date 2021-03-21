import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Loader from './Loader';
import Pdf from './Pdf';

export default function Document(props) {
    const [document, setDocument] = useState(null);
    const [comments, setComments] = useState([]);
    const [name,setName]= useState('');
    let params = useParams();
    const loadPdf = ()=>{
        axios.get('/api/documents/' + params.fileId, { withCredentials: 'true' }).then(
            resp => {
                setDocument(resp.data.buffer);
                setComments(resp.data.comments);
                setName(resp.data.name);
                localStorage.setItem('current_id',params.fileId);

            },
            (err) => console.log(err)
        )
    }
    useEffect(() => {
        loadPdf();

    }, [])

    return (
        <React.Fragment>
            {document != null ?
                (<Pdf pdf={document} loadPdf = {loadPdf} comments={comments} name={name}></Pdf>) :
                (<Loader open={true}></Loader>)
            }
        </React.Fragment>

    )
}