import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import 'antd/dist/antd.css';
import './App.less';
import RouterView from './routes/Router';

function App() {
  return (
    <div className="App">
      <Router basename={"/mr-web3d"}>
        <RouterView></RouterView>
      </Router>
    </div>
  );
}

export default App;