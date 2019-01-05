import React from 'react';
import { createPollUserState, initPollUser, sendPollUserChoice } from '../../poll_api';
import AnswerComponent from "../../components/answer_component/answer_component.jsx";

export class PollInterface extends React.Component {
  constructor() {
    super();
    this.state = createPollUserState();
  }

  componentDidMount() {
    //initPollUser("Fubar", arg => this.setState(Object.assign({}, this.state, arg)));
  }

  registerPollUser(userName) {
    initPollUser(userName, arg => this.setState(Object.assign({}, this.state, arg)));
  }

  render() {
    if (this.state.name.length === 0) {
      return (
        <form name='registerForm' >
          <input
            type='text'
            name='username'
            size={50}
            onKeyDown={(event) => { if (event.keyCode === 13) { event.preventDefault(); }}}
          />
          <input
            type='button'
            name='button'
            value='Register'
            onClick={ () => this.registerPollUser(registerForm.username.value) }
          />
        </form>
      );
    }
    return (
      <div align="center">
        <div>User: { this.state.name }</div>
        <div>Money: { this.state.bank }</div>
        <div> { this.state.warn.length > 0 ? 'Warning: ' + this.state.warn : '' } </div>
        {this.state.answers.map((c, i) => {
          return (
            <AnswerComponent
              qid={this.state.qid}
              answerId={i}
              answerStr={c}
              onClickFunc={() => sendPollUserChoice(this.state.round, this.state.qid, this.state.uid, i)}
              isDisabled={this.state.solution.correct >= 0 || this.state.disabledAnswers[i]}
              isCorrect={this.state.solution.correct === i}
              isChosen={this.state.solution.chosen === i}
            />
          );
        })}
      </div>
    );
  }
}

export default PollInterface;
