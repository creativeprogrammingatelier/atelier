import React, {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import {Course} from "../../../../models/api/Course";
import {createCourse, search} from "../../../helpers/APIHelper";
import {courseState} from "../../../../models/enums/courseStateEnum";

interface SearchQueryProperties {
	handleResponse?: (results: string[]) => void
}
export function SearchQuery({handleResponse}: SearchQueryProperties) {
	const [query, setQuery] = useState("");

	// TODO get result from api: determine interface of what comes back from the API
	const getResults = (term: string): any => search(term)
		.then(data => ({
			// TODO Process data
		}));

	async function handleSearch() {
		try {
			const results = ['A result']; // TODO: Actual api call
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
			<InputGroup>
				<div>
					Something for selecting what and where
				</div>
			</InputGroup>
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