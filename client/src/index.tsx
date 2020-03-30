import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './components/App';
// import './styles/base.scss';
// import 'bootstrap/scss/bootstrap.scss';

//Changes to commit changes more 123
ReactDOM.render((
	<BrowserRouter>
		<App/>
	</BrowserRouter>
), document.getElementById('root'));