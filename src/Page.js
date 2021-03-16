import React, { useRef, useEffect, useState } from 'react'
import { makeStyles, TextareaAutosize } from '@material-ui/core';
import DraggableImage from './DraggableImage';


export default function Page(props) {

    const divRef = useRef(null);
    const canvasRef = useRef(null);
    useEffect(() => {
        let viewport = props.page.getViewport({ scale: props.scale });
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        divRef.current.style.width = viewport.width + 'px';
        divRef.current.style.height = viewport.height + 'px';
        let renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        props.page.render(renderContext);
    }, []);


    const useStyles = makeStyles(({
        root: { 
            position: 'relative',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 6px 6px rgba(0,0,0,0.2)',
            paddingBottom: '5px',
        }
    }))
    const classes = useStyles();
    return (
        <React.Fragment>
            <div ref={divRef} className={classes.root}>
                <canvas  className={classes.root,"__page"+props.pageNum} ref={canvasRef} />

            </div>
        </React.Fragment>
    )
}
