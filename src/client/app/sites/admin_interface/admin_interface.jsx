import React from 'react';
import { createAdminState, initAdmin, sendNext, sendAccept, sendPrev, sendLockIn, sendUnlock } from '../../admin_api';

class AdminInterface extends React.Component {
  constructor() {
    super();
    this.state = createAdminState();
  }

  componentDidMount() {
    initAdmin(arg => this.setState(Object.assign({}, this.state, arg)));
  }

  render() {
    return (
      <div className="App">
        <div className="container-fluid">
          <div>
            <h1>AdminInterface</h1>
            <div>
              Question: {this.state.qid} -- {this.state.question.txt}
            </div><br/>
            <div>
              Chosen: {this.state.solution.chosen >= 0 ? this.state.answers[this.state.solution.chosen] : "-"}
            </div><br/>
            <div>
              Correct: {this.state.solution.correct >= 0 ? this.state.answers[this.state.solution.correct] : "-"}
            </div><br/>
            <div align="center">
              Message: { this.state.warn }
            </div>
            <button className="btn btn-outline-primary btn-block" onClick={()=>sendLockIn(this.state.round, this.state.qid, this.state.solution.chosen)}>Lock</button>
            <button className="btn btn-outline-primary btn-block" onClick={()=>sendAccept(this.state.round, this.state.qid)}>Accept</button><br/><br/>
            <button className="btn btn-outline-primary btn-block" onClick={()=>sendNext(this.state.round, this.state.qid)}>(DEBUG!) Next</button>
            <button className="btn btn-outline-primary btn-block" onClick={()=>sendPrev(this.state.round, this.state.qid)}>(DEBUG!) Previous</button>
            <button className="btn btn-outline-primary btn-block" onClick={()=>sendUnlock(this.state.round, this.state.qid)}>(DEBUG!) Unlock</button>
          </div>
        </div>
      </div>
    );
  }
}
export default AdminInterface;
