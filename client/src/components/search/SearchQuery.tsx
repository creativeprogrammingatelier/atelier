import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {Button, Form, InputGroup} from "react-bootstrap";
import {FiX} from "react-icons/all";
import {Course} from "../../../../models/api/Course";
import {SearchResult} from "../../../../models/api/SearchResult";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";
import {getCourses, getSubmission, getUser, search} from "../../../helpers/APIHelper";
import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import {Loading} from "../general/loading/Loading";
import {Tag} from "../general/Tag";
import {SearchProperties} from "./SearchOverview";

interface SearchQueryProperties {
	state: SearchProperties,
	handleResponse?: (results: SearchResult) => void
}
export function SearchQuery({state, handleResponse}: SearchQueryProperties) {
	const [query, setQuery] = useState("");
	const [course, setCourse] = useState("");
	const [user, setUser] = useState(state.user as string | undefined);
	const [submission, setSubmission] = useState(state.submission as string | undefined);
	const [error, setError] = useState(false as FeedbackContent);
	const history = useHistory();

	async function handleSearch() {
		setError(false);
		try {
			const results = await search({
				query,
				courseID: course,
				userID: user,
				submissionID: submission
			});
			setQuery("");
			if (handleResponse !== undefined) {
				handleResponse(results);
			}
		} catch (error) {
			setError(`Could not search for '${query}': ${error}`);
		}
	}

	return <Form>
		<Form.Group>
			{
				user &&
					<Tag large round theme="primary" click={() => history.push(`/user/${user}`)}>
						User: <Loading<User> loader={getUser} params={[user]} component={user => user.name} wrapper={() => null}/>
						<Button className="ml-1" onClick={(event: React.MouseEvent<HTMLElement>) => {
							setUser(undefined);
							event.stopPropagation();
							event.nativeEvent.stopImmediatePropagation();
						}}>
							<FiX/>
						</Button>
					</Tag>
			}
			{
				submission &&
					<Tag large round theme="primary" click={() => history.push(`/submission/${submission}`)}>
						Submission: <Loading<Submission> loader={getSubmission} params={[submission]} component={submission => submission.name} wrapper={() => null}/>
						<Button className="ml-1" onClick={(event: React.MouseEvent<HTMLElement>) => {
							setSubmission(undefined);
							event.stopPropagation();
							event.nativeEvent.stopImmediatePropagation();
						}}>
							<FiX/>
						</Button>
					</Tag>
			}
		</Form.Group>
		<Form.Group>
			<Form.Control as="select" onChange={event => setCourse((event.target as HTMLInputElement).value)}>
				<option disabled>Select a course</option>
				<option value="">No course</option>
				<Loading<Course[]>
					loader={getCourses}
					component={courses => courses.map(course => <option value={course.ID} selected={state && state.course === course.ID}>{course.name}</option>)}
				/>
			</Form.Control>
		</Form.Group>
		<Form.Group>
			<InputGroup>
				<Form.Control type="text" placeholder="Search" value={query} onChange={(event: React.FormEvent<HTMLInputElement>) => setQuery((event.target as HTMLInputElement).value)}/>
				<InputGroup.Append>
					<Button onClick={handleSearch}>Search</Button>
				</InputGroup.Append>
			</InputGroup>
		</Form.Group>
		<FeedbackError show={error} close={setError}>{error}</FeedbackError>
	</Form>;
}