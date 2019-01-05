import React from 'react'
import Typography from "@material-ui/core/Typography";

export function OverlayComponent(props) {
  return(
    <div>
      <div className="row">
        <div className="col-8 offset-2"><Typography variant={"h1"} color={"inherit"}>{props.data.txt}</Typography></div>
      </div>
      <div className="row">
        <div className="col-12"><img src={props.data.img} alt="Einleitungs_Bild"/></div>
      </div>
    </div>
  )
}