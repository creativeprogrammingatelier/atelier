import React, {useState, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {Button, Form, InputGroup} from "react-bootstrap";
import {FiX} from "react-icons/all";

import {Course} from "../../../../models/api/Course";
import {SearchResult} from "../../../../models/api/SearchResult";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";
import {Sorting, sortingNames} from "../../../../models/enums/SortingEnum";

import {getCourses, getSubmission, getUser, search} from "../../helpers/api/APIHelper";
import {getEnum} from "../../../../helpers/EnumHelper";
import {ParameterHelper} from "../../helpers/ParameterHelper";

import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";
import {Loading} from "../general/loading/Loading";
import {Tag} from "../general/Tag";
import {LabeledInput} from "../input/LabeledInput";
import {SearchProperties} from "./SearchOverview";
import {getErrorMessage} from "../../../../helpers/ErrorHelper";

interface SearchQueryProperties {
    /** SearchProperties of query*/
    state: SearchProperties,
    /** Functioning on handling changing of courses */
    onCourseChange?: (course?: string) => void,
    /** Function for handling responses. */
    handleResponse?: (results: SearchResult) => void
}
/**
 * Component for handling a search query.
 */
export function SearchQuery({state, onCourseChange, handleResponse}: SearchQueryProperties) {
    const [query, setQuery] = useState(state.query ? state.query : "");
    const [course, setCourse] = useState(state.course);
    const [user, setUser] = useState(state.user);
    const [submission, setSubmission] = useState(state.submission);
    const [sorting, setSorting] = useState(state.sorting ? state.sorting : Sorting.datetime);
    const [error, setError] = useState(false as FeedbackContent);
    const [shift, setShift] = useState(false);
    const history = useHistory();

    useEffect(() => onCourseChange && onCourseChange(course), [course]);

    /**
     * Handles keyDown events, checks whether shift is pressed.
     * If shes then a new lines is added on pressing "Enter",
     * of not the search is performed.
     */
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
    /**
     * Handles keyUp event. Used to check whether "shift" had
     * been de-pressed.
     */
    const handleKeyUp = (event: React.KeyboardEvent) => {
        if (event.key === "Shift") {
            setShift(false);
        }
    };
    /**
     * Executes the search query.
     */
    const handleSearch = async() => {
        setError(false);
        try {
            const parameters = ParameterHelper.createSearchParameters({
                q: query,
                courseID: course,
                userID: user,
                submissionID: submission,
                sorting
            });
            const results = await search(parameters);
            history.push(`/search${parameters}`);
            setQuery("");
            if (handleResponse !== undefined) {
                handleResponse(results);
            }
        } catch (error) {
            setError(`Could not search for '${query}': ${getErrorMessage(error)}`);
        }
    };

    return <Form>
        {
            (user || course) &&
            <Form.Group>
                {
                    user &&
                    <Tag large round theme="primary" click={() => history.push(`/user/${user}`)}>
                        User: <Loading<User> loader={getUser} params={[user]} component={user => user.name}
                            wrapper={() => null}/>
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
                        Submission: <Loading<Submission> loader={getSubmission} params={[submission]}
                            component={submission => submission.name} wrapper={() => null}/>
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
        }
        <LabeledInput label="Course" className="w-50 pr-1">
            <Loading<Course[]>
                loader={getCourses}
                component={courses =>
                    <Form.Control
                        as="select"
                        defaultValue={course}
                        onChange={event => setCourse((event.target as HTMLInputElement).value)}
                    >
                        <option key={"disabled"} disabled>Select a course</option>
                        <option key={""} value="">No course</option>
                        {courses.map(course => <option key={course.ID} value={course.ID}>{course.name}</option>)}
                    </Form.Control>
                }
            />
        </LabeledInput>
        <LabeledInput label="Sorting" className="w-50 pl-1">
            <Form.Control
                as="select"
                defaultValue={Sorting.datetime}
                onChange={event => setSorting(getEnum(Sorting, (event.target as HTMLInputElement).value))}
            >
                {Object.keys(Sorting).map(element => <option key={element} value={element}>{sortingNames[element]}</option>)}
            </Form.Control>
        </LabeledInput>
        <LabeledInput label="Query">
            <Form.Control
                type="text"
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                placeholder="Search"
                value={query}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery((event.target as HTMLInputElement).value)}
            />
            <InputGroup.Append>
                <Button onClick={handleSearch}>Search</Button>
            </InputGroup.Append>
        </LabeledInput>
        <FeedbackError close={setError}>{error}</FeedbackError>
    </Form>;
}
