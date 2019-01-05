import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css';
import UserInterface from './app/sites/user_interface/user_interface.jsx';
import AdminInterface from './app/sites/admin_interface/admin_interface.jsx';
import PollInterface from './app/sites/poll_interface/poll_interface.jsx';
import Switch from "react-router-dom/es/Switch";

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/" exact component={UserInterface} />
        <Route path="/admin/" component={AdminInterface} />
        <Route path="/poll/" component={PollInterface} />
      </Switch>
    );
  }
}
export default App;
