import React, {useState, useEffect} from 'react';
import {Jumbotron} from 'react-bootstrap';
import {FiMessageSquare, FiCompass, FiPackage} from 'react-icons/all';

import {User} from '../../../../models/api/User';

import {getUser} from '../../helpers/api/APIHelper';

import {Frame} from '../frame/Frame';
import {Loading} from '../general/loading/Loading';
import {ErrorBoundary} from '../general/ErrorBoundary';
import {TabBar} from '../tab/TabBar';
import {CommentTab} from './CommentTab';
import {CourseTab} from './CourseTab';
import {SubmissionTab} from './SubmissionTab';

interface UserOverviewProperties {
	match: {
		params: {
			/** User ID within database */
			userId: string,
			/** Current active tab */
			tab: string
		}
	}
}
/**
 * Component for retrieving user information for the current active tab
 */
export function UserOverview({match: {params: {userId, tab}}}: UserOverviewProperties) {
  const [activeTab, setActiveTab] = useState(tab);
  const userPath = '/user/' + userId;

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);
  useEffect(() => {
    if (activeTab === undefined) {
      setActiveTab('courses');
    }
  });

  /**
	 * Render the contents of the tab based on the user given.
	 *
	 * @param user User to be queried.
	 */
  const renderTabContents = (user: User) => {
    if (activeTab === 'courses') {
      return <CourseTab user={user}/>;
    } else if (activeTab === 'submissions') {
      return <SubmissionTab user={user}/>;
    } else if (activeTab === 'comments') {
      return <CommentTab user={user}/>;
    }
    // TODO: Better error
    return <div><h1>Tab not found!</h1></div>;
  };

  return <Loading<User>
    loader={getUser}
    params={[userId]}
    component={(user) =>
      <Frame title={user.name} sidebar search={{user: user.name}}>
        <Jumbotron>
          <h1>{user.name}</h1>
          <p>Welcome back here! :D</p>
        </Jumbotron>
        <ErrorBoundary>
          {renderTabContents(user)}
        </ErrorBoundary>
        <TabBar
          tabs={[{
            id: 'courses',
            icon: FiCompass,
            text: 'Courses',
            location: userPath + '/courses',
          }, {
            id: 'submissions',
            icon: FiPackage,
            text: 'Submissions',
            location: userPath + '/submissions',
          }, {
            id: 'comments',
            icon: FiMessageSquare,
            text: 'Comments',
            location: userPath + '/comments',
          }]}
          active={activeTab}
        />
      </Frame>
    }
  />;
}
