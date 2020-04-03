import React, {useState, useEffect} from "react";
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
import { Sorting } from "../../../../models/enums/SortingEnum";
import { getEnum } from "../../../../models/enums/enumHelper";

interface SearchQueryProperties {
	state: SearchProperties,
	handleResponse?: (results: SearchResult) => void
}
export function SearchQuery({state, handleResponse}: SearchQueryProperties) {
	const [query, setQuery] = useState("");
	const [course, setCourse] = useState(state.course as string | undefined);
	const [user, setUser] = useState(state.user as string | undefined);
	const [submission, setSubmission] = useState(state.submission as string | undefined);
	const [sorting, setSorting] = useState(Sorting.datetime);
	const [error, setError] = useState(false as FeedbackContent);

	const [shift, setShift] = useState(false);

	const history = useHistory();

	async function handleSearch() {
		setError(false);
		try {
			const results = await search({
				query,
				courseID: course,
				userID: user,
				submissionID: submission,
				sorting
			});
			setQuery("");
			if (handleResponse !== undefined) {
				handleResponse(results);
			}
		} catch (error) {
			setError(`Could not search for '${query}': ${error}`);
		}
	}
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Shift") {
			setShift(true);
		}
		if (event.key === "Enter") {
			// Pressing enter by default does some weird redirect thing, cancel that
			event.preventDefault();
			if (shift) {
				// Instead, we want it to add a new line to the input if shift is held
				// TODO: However, only textarea's accept new lines, so fix that at some point
				setQuery(query => query + "\n");
			} else if (event.key === "Enter") {
				// Or submit the comment if not. There is an undefined promise resolve to make warnings go away
				handleSearch().then(undefined);
			}
		}
	};
	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key === "Shift") {
			setShift(false);
		}
	};

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
		<Form.Label> Course:
			<Form.Group>
				<Loading<Course[]>
							loader={getCourses}
							component={courses =>
								<Form.Control as="select" defaultValue={course} onChange={event => setCourse((event.target as HTMLInputElement).value)}>
									<option key={"disabled"} disabled>Select a course</option>
									<option key={""} value="">No course</option>
									{courses.map(course => <option key={course.ID} value={course.ID}>{course.name}</option>
									)}

								</Form.Control>
							}
						/>
			</Form.Group>
		</Form.Label>
		<Form.Label>Ordering
			<Form.Group>
				<Form.Control as="select" defaultValue={Sorting.datetime} onChange={event => setSorting(getEnum(Sorting, (event.target as HTMLInputElement).value))}>
					{Object.keys(Sorting).map(element => <option key={element} value={element}>{element}</option>)}
				</Form.Control>
			</Form.Group>
		</Form.Label>

		<Form.Group>
			<InputGroup>
				<Form.Control type="text" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} placeholder="Search" value={query} onChange={(event: React.FormEvent<HTMLInputElement>) => setQuery((event.target as HTMLInputElement).value)}/>
				<InputGroup.Append>
					<Button onClick={handleSearch}>Search</Button>
				</InputGroup.Append>
			</InputGroup>
		</Form.Group>
		<FeedbackError close={setError}>{error}</FeedbackError>
	</Form>;
}