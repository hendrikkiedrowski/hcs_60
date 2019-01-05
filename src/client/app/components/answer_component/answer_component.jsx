import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import {theme} from '../website_styles/general'
import './answerComponent.css';
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";


export default class AnswerComponent extends React.Component {
  render() {
    const classes = classNames({
      btn: false,
      'btn-block': true,
      selectedAnswer: this.props.isChosen,
      correctAnswer: this.props.isCorrect
    });
    return (
      <MuiThemeProvider theme={theme}>
        <div className="col-6 ac-item" key={this.props.answerId}>
          <Button variant={"contained"} color={"secondary"}
                  className={classes}
                  onClick={this.props.onClickFunc}
                  disabled={this.props.isDisabled}
          >
            {this.props.answerStr}
          </Button>
        </div>
      </MuiThemeProvider>
    );
  }
}

AnswerComponent.propTypes = {
  onClickFunc: PropTypes.func.isRequired,
  isChosen: PropTypes.bool.isRequired,
  isCorrect: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  answerStr: PropTypes.string.isRequired
};
