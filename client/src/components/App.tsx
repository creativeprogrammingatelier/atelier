import * as React from 'react';
import {Route, Switch, Link, Redirect} from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Login from './Login';
import TAView from './TAView';
import StudentView from './StudentView';
import RoleView from './RoleView';
import Nav from './Nav';
import Logout from './Logout';
import Register from './Register';
import AuthHelper from '../../helpers/AuthHelper';
import roleEnum from '../../../enums/roleEnum';
import {SubmissionOverview} from './submission/SubmissionOverview';
import {CommentThread} from './commentthread/CommentThread';
import {SearchOverview} from './search/SearchOverview';
import {CourseOverview} from './course/CourseOverview';
import { UserOverview } from './user/UserOverview';
import {Homepage} from './Homepage';
import {Frame} from './frame/Frame';

import '../styles/app.scss';
import '../styles/base.scss';
import {AuthenticatedRoute} from './AuthenticatedRoute';


/**
 *
 */
const EMAILLOCALSTORAGEKEY = 'email';
type AppState = {loggedIn: boolean, email: string, role: roleEnum};
type AppProps = {};

class App extends React.Component<AppProps, AppState> {

	constructor(props: AppProps) {
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

        const successTimeOut =  55*60*60*1000;
        function refreshToken() {
            AuthHelper.refresh(
                () => setTimeout(refreshToken, successTimeOut),
                () => setTimeout(refreshToken, 1*60*60*1000)
            )
        }
        setTimeout(refreshToken, successTimeOut);
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
		return (
			<Switch>
				<Route path='/register' render={(props) => <Register {...props} onLogin={this.handleLogin}/>}/>
				<Route path='/login' render={(props) => <Login {...props} onLogin={this.handleLogin}/>}/>
				<PrivateRoute exact path='/ta' component={TAView} roles={['teacher']}/>
				<PrivateRoute exact path='/student' component={StudentView} roles={['student']}/>
				<PrivateRoute exact path='/roleview' component={(props: any) => <RoleView {...props} role={this.state.role}/>} roles={['teacher', 'student']}/>
				<PrivateRoute path='/logout' component={Logout}/>
				<AuthenticatedRoute path='/submissions/:submissionId/search' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/submissions/:submissionId/comments/:fileId' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/submissions/:submissionId/comments' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/submissions/:submissionId/code/:fileId' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/submissions/:submissionId/share' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/submissions/:submissionId' component={SubmissionOverview}/>
				<AuthenticatedRoute path='/user/:userId/search' component={SearchOverview} roles={['student', 'test/user/search']}/>
				<AuthenticatedRoute path='/user/:userId' component={UserOverview} roles={['student', 'test/user']}/>
				<AuthenticatedRoute path='/course/:courseId/user/:userId' component={UserOverview} roles={['student', 'test/course/user']}/>
				<AuthenticatedRoute path='/course/:courseId/search' component={SearchOverview} roles={['student', 'test/course/search']}/>
				<AuthenticatedRoute path='/course/:courseId' component={CourseOverview} roles={['student', 'test/course']}/>
				<AuthenticatedRoute path='/' component={Homepage} roles={['student', 'test/']}/>
			</Switch>
		);
	}
}
export default App;