import React from 'react';
import {createUserState, initUser} from '../../user_api';
import {GameComponent} from '../../components/game_component/game_component.jsx'
import {OverlayComponent} from "../../components/overlay_component/overlay_component.jsx";

class UserInterface extends React.Component {
  constructor() {
    super();
    this.state = createUserState();
  }
  
  componentDidMount() {
    initUser(arg => this.setState(Object.assign({}, this.state, arg)));
  }
  
  
  render() {
    let intro;
      if(this.state.overlay.disable){
        intro = <GameComponent data={this.state}/>
      }
      else{
        return <OverlayComponent data={this.state.overlay}/>
      }
    
    console.log(this.props);
    return (
      <div className="container-fluid content">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center hcsHead">Hans - Christian wird (vielleicht) Millionär</h1>
          </div>
          {intro}
        </div>
        <div> {this.state.warn} </div>
        <div> {this.state.overlay.disable ? '' : this.state.overlay.txt } </div>
      </div>
    );
  }
}

export default UserInterface;
