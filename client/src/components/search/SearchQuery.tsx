import React, {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import {Course} from "../../../../models/api/Course";
import {createCourse, getCourses, search} from "../../../helpers/APIHelper";
import {courseState} from "../../../../models/enums/courseStateEnum";
import {Loading} from "../general/loading/Loading";
import {SearchResult} from "../../../../models/api/SearchResult";
import {SearchProperties} from "./SearchOverview";

interface SearchQueryProperties {
	state: SearchProperties,
	handleResponse?: (results: SearchResult) => void
}
export function SearchQuery({state, handleResponse}: SearchQueryProperties) {
	const [query, setQuery] = useState("");
	const [course, setCourse] = useState("");

	async function handleSearch() {
		try {
			const results = await search({query,courseID:course}); // TODO: Add course selection
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
	</Form>
}