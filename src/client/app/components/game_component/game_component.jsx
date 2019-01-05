import React from "react"
import {JokerComponent} from "../joker_component/joker_component.jsx";
import {sendAudienceJoker, sendFiftyJoker, sendMsgChoice, sendTelephoneJoker} from "../../user_api";
import {MoneyComponent} from "../money_component/money_component.jsx";
import {QuestionComponent} from "../question_component/question_component.jsx";
import AnswerComponent from "../answer_component/answer_component.jsx";


export function GameComponent(props) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-6 text-center">
          <JokerComponent
            audienceJokerFunc={() => sendAudienceJoker(props.data.round, props.data.qid)}
            audienceJokerIsActive={props.data.jokers['audience']['active']}
            audienceJokerIsInUse={props.data.jokers['audience']['used']}
            fiftyJokerFunc={() => sendFiftyJoker(props.data.round, props.data.qid)}
            fiftyJokerIsActive={props.data.jokers['fifty']['active']}
            fiftyJokerIsInUse={props.data.jokers['fifty']['used']}
            telephoneJokerFunc={() => sendTelephoneJoker(props.data.round, props.data.qid)}
            telephoneJokerIsActive={props.data.jokers['telephone']['active']}
            telephoneJokerIsInUse={props.data.jokers['telephone']['used']}
          />
        </div>
        <div className="col-6">
          <MoneyComponent
            bank={props.data.bank}
            oldBank={props.data.oldBank}
            price={props.data.price}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 text-center">
          <div className="row">
            <QuestionComponent
              content={props.data.question.txt}
            />
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="col-12">
          <div className="answers">
            <div className="row justify-content-center">
              {props.data.answers.map((c, i) => {
                return (
                  <AnswerComponent
                    qid={props.data.qid}
                    answerId={i}
                    answerStr={c}
                    onClickFunc={() => sendMsgChoice(props.data.round, props.data.qid, i)}
                    isDisabled={props.data.solution.correct >= 0 || props.data.disabledAnswers[i]}
                    isCorrect={props.data.solution.correct === i}
                    isChosen={props.data.solution.chosen === i}
                  />);
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}