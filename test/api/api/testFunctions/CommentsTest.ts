import {expect} from 'chai';
import {assert} from 'console';

import {Comment} from '../../../../models/api/Comment';

import {instanceOfComment} from '../../../InstanceOf';
import {
  getCommentsUser,
  USER_ID,
  getCommentsByUserAndCourse,
  COURSE_ID,
  putComment,
  adminRegisterCourse,
} from '../APIRequestHelper';

export function commentTest() {
  /**
	 * GET requests:
	 * /api/comment/user/:userID
	 * - response should be Comment[]
	 * - comments should belong to userID
	 * /api/comment/course/:courseID/user/:userID
	 * - response should be Comment[]
	 * - comments should belong to userID and courseID
	 */
  describe('Comments', async () => {
    it('Should be possible to get user comments', async () => {
      const response = await getCommentsUser();
      expect(response).to.have.status(200);
      console.log('??????', response.body);
      assert(response.body.every((comment: Comment) =>
        instanceOfComment(comment) &&
				comment.user.ID === USER_ID,
      ));
    });

    it('Should be possible to get user comments in a course', async () => {
      const response = await getCommentsByUserAndCourse();
      expect(response).to.have.status(200);
      assert(response.body.every((comment: Comment) =>
        instanceOfComment(comment) &&
				comment.references.courseID === COURSE_ID &&
				comment.user.ID === USER_ID,
      ));
    });

    it('Should be possible to post a comment', async () => {
      await adminRegisterCourse();
      const response = await putComment();
      expect(response).to.have.status(200);
      const comment = response.body;
      assert(instanceOfComment(comment), 'Body should be comment, but was' + comment);
    });
  });
}
