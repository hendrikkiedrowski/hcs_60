import React from 'react'
import Typography from "@material-ui/core/Typography/Typography";
import "./question_component.css"


export function QuestionComponent(props) {
  let imageRender;
  if (props.img) {
    imageRender = <div className="row">
      <div className="col-12"><img className="questionImage" src={props.img} alt="This schould be a Image"/></div>
      <div className="col-12"><Typography variant={"h4"} color={"inherit"}
                                          className="questionCaps">{props.content}</Typography></div>
    </div>
  } else {
    imageRender = <Typography variant={"h3"} color={'inherit'}>{props.content}</Typography>
  }
  return (
    <div className="questioncomp component">
      <div className="col-12 qc">
        <div className="row">
          <div className="col-8 offset-2">{imageRender}</div>
        </div>
      </div>
    </div>
  );
}
