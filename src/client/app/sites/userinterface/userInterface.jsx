import React from 'react';
import {JokerComponent} from '../../components/joker_component/joker_component.jsx';
import {MoneyComponent} from '../../components/money_component/money_component.jsx';
import {QuestionComponent} from '../../components/question_component/question_component.jsx';
import {createUserState, initUser} from '../../api';
import {AnswerComponent} from "../../components/answer_component/answer_component.jsx";

class userInterface extends React.Component {
  constructor() {
    super();
    this.state = createUserState()
  }
  
  componentDidMount() {
    initUser((vars) => this.setState(vars), this.state)
  }
  
  render() {
    return (
      
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center hcsHead">Hans - Christian wird (vielleicht) Millionär</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-6 text-center">
            <JokerComponent/>
          </div>
          
          <div className="col-6">
            <MoneyComponent bank={this.state.bank} oldBank={this.state.oldBank}/>
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-center">
            <div className="row">
              <QuestionComponent question={this.state.question.content} price={this.state.price}/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="answers">
              <div className="row justify-content-center ac">
                {this.state.question.answers.map((c, i) => {
                  return <AnswerComponent answer={c} index={i} key={c.txt} qid={this.state.question.qid}
                                          correctAnswer={this.state.correctAnswer}/>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default userInterface;
