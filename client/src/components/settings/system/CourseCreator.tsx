import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';

import {CourseState} from '../../../../../models/enums/CourseStateEnum';
import {FeedbackContent} from '../../feedback/Feedback';

import {useCourses} from '../../../helpers/api/APIHooks';
import {FeedbackError} from '../../feedback/FeedbackError';
import {LabeledInput} from '../../input/LabeledInput';
import CanvasCourseList from './CanvasCourseList';


/**
 * Component for creating courses.
 */
export function CourseCreator() {
  const [courseName, setCourseName] = useState('');
  const [canvasCourseId, setCanvasCourseId] = useState('');
  const [error, setError] = useState(false as FeedbackContent);
  const courses = useCourses();
  const history = useHistory();

  /**
	 * Function for creating a course given the course name.
	 *
	 * @param courseName Course name of the given course.
	 * @throws Error when new course has failed to be created.
	 */
  async function handleSubmission(courseName: string, canvasCourseId: string) {
    try {
      const course = await courses.create({
        name: courseName,
        state: CourseState.open,
        canvasCourseId: canvasCourseId,
      });
      setCourseName('');
      history.push(`/course/${course.ID}/settings`);
    } catch (error) {
      setError(`Failed to create new course: ${error}`);
    }
  }

  function linkCanvasCourse(courseId: string) {
    setCanvasCourseId(courseId);
  }

  return <Form>
    <LabeledInput label="Course name">
      <Form.Control
        type="text"
        placeholder="Course name"
        value={courseName}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCourseName((event.target as HTMLInputElement).value)}
      />
      <Button onClick={() => handleSubmission(courseName, canvasCourseId)}>Create Course</Button>
    </LabeledInput>
    <FeedbackError close={setError}>{error}</FeedbackError>
    <CanvasCourseList onLinkCanvasCourse = {linkCanvasCourse}	/>
  </Form>;
}
