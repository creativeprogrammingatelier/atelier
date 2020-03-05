import * as React from 'react';
import {Route, Switch, Link, Redirect} from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import {Login} from './Login';
import TAView from './TAView';
import StudentView from './StudentView';
import RoleView from './RoleView';
import Nav from './Nav';
import Logout from './Logout';
import Register from './Register';
import AuthHelper from '../../helpers/AuthHelper';
import roleEnum from '../../../enums/roleEnum';
import {AuthenticatedRoute} from './AuthenticatedRoute';
import {SubmissionOverview} from './submission/SubmissionOverview';
import {FileOverview} from './submission/FileOverview';
import {CommentThread} from './submission/comment/CommentThread';
import {SearchOverview} from './search/SearchOverview';
import {CourseOverview} from './course/CourseOverview';
import {UserOverview } from './user/UserOverview';
import {Homepage} from './Homepage';

import '../styles/app.scss';
import '../styles/base.scss';
import {SubmissionShare} from './submission/SubmissionShare';
import {Bootstrap} from "./Bootstrap";


/**
 *
 */
const EMAILLOCALSTORAGEKEY = 'email';
type AppState = {loggedIn: boolean, email: string, role: roleEnum};
type AppProps = {};

class App extends React.Component<AppProps, AppState> {

	constructor(props: AppProps) {
		console.log("app created");
		super(props);
		this.state = {
			loggedIn: false,
			email: localStorage.getItem(EMAILLOCALSTORAGEKEY) || '',
			role: roleEnum.None
		};
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
	}

	componentDidMount() {
		this.getAndSetRole();
	}

	handleLogin(email: string) {
		this.setState({
			loggedIn: true,
			email: email
		});
		localStorage.setItem(EMAILLOCALSTORAGEKEY, email);
        this.getAndSetRole();
	}

	handleLogout() {
		this.setState({
			loggedIn: false,
			email: '',
			role: roleEnum.None
		});
	}

	getAndSetRole() {
		AuthHelper.getRole().then((response: Response) => {
			response.json().then((json: any) => {
				let userRole = json.role;
				if (response.status == 200) {
					this.setState({
						role: userRole,
						loggedIn: true
					});
				}
			});
		});
	}

	render() {
		console.log("rendering app");
		return (
			< Switch>
				<Route path='/register' render={(props) => <Register {...props} onLogin={this.handleLogin}/>}/>
				<Route path='/login' render={(props) => <Login onLogin={this.handleLogin}/>}/>
				{/*<Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin}/>}/>*/}
				<PrivateRoute exact path='/ta' component={TAView} roles={['teacher']}/>
				<PrivateRoute exact path='/student' component={StudentView} roles={['student']}/>
				<PrivateRoute exact path='/roleview' component={(props: any) => <RoleView {...props} role={this.state.role}/>} roles={['teacher', 'student']}/>
				<PrivateRoute path='/logout' component={Logout}/>
				<AuthenticatedRoute path='/submission/:submissionId/search' component={SearchOverview}/>
				<AuthenticatedRoute path='/submission/:submissionId/share' component={SubmissionShare}/>
				<AuthenticatedRoute path='/submission/:submissionId/:fileId/:tab' component={FileOverview}/>
				<AuthenticatedRoute path='/submission/:submissionId' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/user/:userId/search' component={SearchOverview}/>
				<AuthenticatedRoute path='/user/:userId' component={UserOverview}/>
				<AuthenticatedRoute path='/course/:courseId/user/:userId' component={UserOverview}/>
				<AuthenticatedRoute path='/course/:courseId/search' component={SearchOverview}/>
				<AuthenticatedRoute path='/course/:courseId' component={CourseOverview}/>
				<AuthenticatedRoute path='/search' component={SearchOverview}/>
				<AuthenticatedRoute path='/bootstrap' component={Bootstrap}/>
				<AuthenticatedRoute path='/' component={Homepage}/>
			</Switch>
		);
	}
}
export default App;