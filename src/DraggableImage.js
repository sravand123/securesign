import React, { useRef, useEffect, useState } from 'react'
import { Rnd } from "react-rnd";
import signature from './sig.png';
import Popover from '@material-ui/core/Popover';
import { TextareaAutosize } from '@material-ui/core';

const DraggableImage = props => {

  const imgRef = useRef(null);
  const [state,_setState] = useState({
      x:300,
      y:100,
      imagewidth:200,
      imageheight:150,
      mouseX:null,
      mouseY:null
  });
  const RndRef = useRef(null);

  const setState = (data)=>{
      _setState({...state,...data});
  }
 
  return (
    <React.Fragment>


      <Rnd 
        size={{ width: state.imagewidth+2,  height: state.imageheight+2}}
        style={{ border: '1px  solid black ' }}
        position={{ x: state.x, y: state.y }}
        bounds={".__page"+props.pageNum}
        onDragStop={(e, d) => {
          console.log(d);
          setState({x:d.x,y:d.y});
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          setState({x:position.x,y:position.y,imagewidth:state.imagewidth+delta.width,imageheight:state.imageheight+delta.height})
        }}
      >
    
          <img ref={imgRef} width={state.imagewidth} height={state.imageheight} draggable="false" src={signature}></img>
      
      </Rnd>
     
    </React.Fragment>
  )
}

export default DraggableImage