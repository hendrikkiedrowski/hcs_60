import React from 'react';
import PropTypes from 'prop-types';
import fiftyJoker from './fiftyJoker.png';
import phoneJoker from './phoneJoker.png';
import pubJoker from './pubJoker.png';

export function JokerComponent(props) {
  return (
    <div className="jokerComp component">
      <div className="row jc">
        <div className="col-12">
          <ul className="list-unstyled list-inline">
            <li className="list-inline-item">
              <button
                className="jokerButton"
                onClick={props.fiftyJokerFunc}
                disabled={!props.fiftyJokerIsActive}
              >
                <img src={fiftyJoker} alt="" />
              </button>
            </li>
            <li className="list-inline-item">
              <button
                className="jokerButton"
                onClick={props.telephoneJokerFunc}
                disabled={!props.telephoneJokerIsActive}
              >
                <img src={phoneJoker} alt="" />
              </button>
            </li>
            <li className="list-inline-item">
              <button
                className="jokerButton"
                onClick={props.audienceJokerFunc}
                disabled={!props.audienceJokerIsActive}
              >
                <img src={pubJoker} alt="" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
