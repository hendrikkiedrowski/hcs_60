import React from 'react';
import piggyBank from './piggyBank.png';
import {Spring, Transition} from "react-spring";

export function MoneyComponent({bank, oldBank, price}) {
  price = price + " $";
  return (
    <div className="moneyComp component">
      <div className="row mc">
        <div className="col-5 offset-7">
          <div className="row">
            <div className="col-12"><h3 className="text-center">
              <Spring
                from={{number: oldBank}}
                to={{number: bank}}
                config={{tension: 120, friction: 80, precision: 0.1}}
                decimalPrecision="0">
                {props => <div>{Math.round(props.number)} $</div>}
              </Spring>
            </h3></div>
            <div className="col-12 text-center">
              <img src={piggyBank} alt="LittlePiggy" className="bankSymbol"/>
            </div>
            <div className="col-12 text-center">
              <Spring from={{transform: 'translate(0, -40px)', opacity: 0}}
                      to={{transform: 'translate(0, 0px)', opacity: 1}}>
                {props => <div className={"questionValue"} style={props}>{price}</div>}
              </Spring>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
