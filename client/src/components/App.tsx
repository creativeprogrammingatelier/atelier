import React from "react";
import {Route, Switch} from "react-router-dom";

import {ErrorBoundary} from "./general/ErrorBoundary";
import {CacheProvider} from "./general/loading/CacheProvider";
import {TimeProvider} from "./data/TimeProvider";
import {AuthenticatedRoute} from "./AuthenticatedRoute";

import Register from "./Register";
import {Logout} from "./Logout";
import {Login} from "./Login";

import {Homepage} from "./Homepage";
import {Activity} from "./Activity";
import {Bootstrap} from "./Bootstrap";
import {Invite} from "./share/Invite";
import {CourseOverview} from "./CourseOverview";
import {SearchOverview} from "./search/SearchOverview";
import {CourseSettings} from "./settings/course/CourseSettings";
import {SystemSettings} from "./settings/system/SystemSettings";
import {UserSettings} from "./settings/user/UserSettings";
import {FileOverview} from "./submission/FileOverview";
import {SubmissionShare} from "./submission/SubmissionShare";
import {SubmissionOverview} from "./submission/SubmissionOverview";
import {UserOverview} from "./user/UserOverview";
import {UserCourseOverview} from "./user/UserCourseOverview";

import "../styles/base.scss";

export function App() {
    return (
        <ErrorBoundary>
            <TimeProvider>
                <CacheProvider>
                    <Switch>
                        <Route path='/register' render={props => <Register {...props} />}/>
                        <Route path='/login' render={() => <Login/>}/>
                        <AuthenticatedRoute path='/logout' component={Logout}/>
                        <AuthenticatedRoute path='/submission/:submissionId/share' component={SubmissionShare}/>
                        <AuthenticatedRoute path='/submission/:submissionId/:fileId/:tab' component={FileOverview}/>
                        <AuthenticatedRoute path='/submission/:submissionId' component={SubmissionOverview}/>
                        <AuthenticatedRoute path='/user/:userId/:tab' component={UserOverview}/>
                        <AuthenticatedRoute path='/user/:userId' component={UserOverview}/>
                        <AuthenticatedRoute path='/invite/:inviteId' component={Invite}/>
                        <AuthenticatedRoute path='/course/:courseId/user/:userId/:tab' component={UserCourseOverview}/>
                        <AuthenticatedRoute path='/course/:courseId/user/:userId' component={UserCourseOverview}/>
                        <AuthenticatedRoute path='/course/:courseId/search' component={SearchOverview}/>
                        <AuthenticatedRoute path='/course/:courseId/settings' component={CourseSettings}/>
                        <AuthenticatedRoute path='/course/:courseId/:tab' component={CourseOverview}/>
                        <AuthenticatedRoute path='/course/:courseId/' component={CourseOverview}/>
                        <AuthenticatedRoute path='/search' component={SearchOverview}/>
                        <AuthenticatedRoute path='/account' component={UserSettings}/>
                        <AuthenticatedRoute path='/activity' component={Activity}/>
                        <AuthenticatedRoute path='/admin/settings' component={SystemSettings}/>
                        <AuthenticatedRoute path='/bootstrap' component={Bootstrap}/>
                        <AuthenticatedRoute path='/' component={Homepage}/>
                    </Switch>
                </CacheProvider>
            </TimeProvider>
        </ErrorBoundary>
    );
}
