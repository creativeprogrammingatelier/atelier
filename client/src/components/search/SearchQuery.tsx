import React, {useState} from "react";
import {Badge, Button, Form, InputGroup} from "react-bootstrap";
import {Course} from "../../../../models/api/Course";
import {createCourse, getCourses, search} from "../../../helpers/APIHelper";
import {courseState} from "../../../../models/enums/courseStateEnum";
import {Loading} from "../general/loading/Loading";
import {SearchResult} from "../../../../models/api/SearchResult";
import {SearchProperties} from "./SearchOverview";
import {FiX} from "react-icons/all";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";
import {Tag} from "../general/Tag";

interface SearchQueryProperties {
	state: SearchProperties,
	handleResponse?: (results: SearchResult) => void
}
export function SearchQuery({state, handleResponse}: SearchQueryProperties) {
	const [query, setQuery] = useState("");
	const [course, setCourse] = useState("");
	const [user, setUser] = useState(state.user as User | undefined);
	const [submission, setSubmission] = useState(state.submission as Submission | undefined);

	async function handleSearch() {
		try {
			const results = await search(query, course, user ? user.ID : "", submission ? submission.ID : "");
			setQuery("");
			if (handleResponse !== undefined) {
				handleResponse(results);
			}
		} catch (err) {
			// TODO: handle error for the user
			console.log(err);
		}
	}

	return <Form>
		<Form.Group>
			{user && <Tag large round theme="primary">User: {user.name} <FiX onClick={() => setUser(undefined)}/></Tag>}
			{submission && <Tag large round theme="primary">Submission: {submission.name} <FiX onClick={() => setSubmission(undefined)}/></Tag>}
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
	</Form>;
}