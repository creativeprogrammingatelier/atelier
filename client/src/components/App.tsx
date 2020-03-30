import React from "react";
import {Route, Switch} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import {Login} from "./Login";
import Logout from "./Logout";
import Register from "./Register";
import {AuthenticatedRoute} from "./AuthenticatedRoute";
import {SubmissionOverview} from "./submission/SubmissionOverview";
import {FileOverview} from "./submission/FileOverview";
import {SearchOverview} from "./search/SearchOverview";
import {CourseOverview} from "./course/CourseOverview";
import {UserOverview} from "./user/UserOverview";
import {Homepage} from "./Homepage";

import "../styles/app.scss";
import "../styles/base.scss";
import {SubmissionShare} from "./submission/SubmissionShare";
import {Bootstrap} from "./Bootstrap";
import {CourseUserOverview} from "./user/CourseUserOverview";
import {Settings} from "./settings/Settings";
import {Activity} from "./Activity";
import {CourseSettings} from "./settings/course/CourseSettings";
import {MessagingProvider} from "./feedback/MessagingProvider";
import {CacheProvider} from "./general/loading/CacheProvider";

export function App() {
	return (
		<MessagingProvider>
			<CacheProvider>
				<Switch>
					<Route path='/register' render={(props) => <Register {...props} />}/>
					<Route path='/login' render={() => <Login/>}/>
					<PrivateRoute path='/logout' component={Logout}/>
					<AuthenticatedRoute path='/submission/:submissionId/share' component={SubmissionShare}/>
					<AuthenticatedRoute path='/submission/:submissionId/:fileId/:tab' component={FileOverview}/>
					<AuthenticatedRoute path='/submission/:submissionId' component={SubmissionOverview}/>
					<AuthenticatedRoute path='/user/:userId/:tab' component={UserOverview}/>
					<AuthenticatedRoute path='/user/:userId' component={UserOverview}/>
					<AuthenticatedRoute path='/course/:courseId/user/:userId/:tab' component={CourseUserOverview}/>
					<AuthenticatedRoute path='/course/:courseId/user/:userId' component={CourseUserOverview}/>
					<AuthenticatedRoute path='/course/:courseId/search' component={SearchOverview}/>
					<AuthenticatedRoute path='/course/:courseId/settings' component={CourseSettings}/>
					<AuthenticatedRoute path='/course/:courseId' component={CourseOverview}/>
					<AuthenticatedRoute path='/search' component={SearchOverview}/>
					<AuthenticatedRoute path='/settings' component={Settings}/>
					<AuthenticatedRoute path='/activity' component={Activity}/>
					<AuthenticatedRoute path='/bootstrap' component={Bootstrap}/>
					<AuthenticatedRoute path='/' component={Homepage}/>
				</Switch>
			</CacheProvider>
		</MessagingProvider>
	);
}