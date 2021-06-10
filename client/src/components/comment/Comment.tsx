import React, {useState, Fragment} from 'react';
import {Button} from 'react-bootstrap';
import {FiClipboard, FiTrash} from 'react-icons/all';

import {Comment} from '../../../../models/api/Comment';

import {useComments, useCurrentUser} from '../../helpers/api/APIHooks';
import {CopyHelper} from '../../helpers/CopyHelper';
import {TimeHelper} from '../../helpers/TimeHelper';

import {ButtonBar} from '../input/button/ButtonBar';
import {ButtonMultistate} from '../input/button/ButtonMultistate';
import {FeedbackContent} from '../feedback/Feedback';
import {FeedbackError} from '../feedback/FeedbackError';
import {Cached} from '../general/loading/Cached';
import {Tag} from '../general/Tag';


/**
 * Interface defining the properties of a comment.
 */
interface CommentProperties {
	comment: Comment
}
/**
 * Function that constructs a Comment based on the CommentProperties supplied, returning the component
 * at the end.
 *
 * @param comment Comment representation of the comment object.
 */
export function Comment({comment}: CommentProperties) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false as FeedbackContent);
  const comments = useComments(comment.references.commentThreadID);
  const user = useCurrentUser();

  let timer: NodeJS.Timeout;

  const handleDown = () => {
    if (menuOpen) {
      setMenuOpen(false);
    } else {
      timer = setTimeout(() => {
        setMenuOpen(true);
      }, 1000);
    }
  };
  const handleUp = () => {
    window.clearTimeout(timer);
  };
  const handleCopy = () => {
    CopyHelper.copy(comment.text);
    setMenuOpen(false);
  };
  const handleDelete = () => {
    comments.delete(comment.ID)
        .then(() => setMenuOpen(false))
        .catch((error) => setDeleteError(error.message));
  };

  return <Fragment>
    <div className="comment px-2 py-1" onMouseDown={handleDown} onMouseUp={handleUp} onTouchStart={handleDown} onTouchEnd={handleUp}>
      <small><span>{comment.user.name}</span> at <span>{TimeHelper.toDateTimeString(TimeHelper.fromString(comment.created))}</span></small>
      <div style={comment.text === 'This comment was deleted' ? {fontStyle: 'italic'} : {}}>
        {comment.text.split(' ').map((text) => text[0] == '#' ? <Tag key={text} large round theme="primary">{text}</Tag>: text + ' ')
        }
      </div>
    </div>
    {
      menuOpen &&
			<ButtonBar transparent align="left">
			  <Button className="m-2" onClick={handleCopy}>Copy <FiClipboard/></Button>
			  <Cached cache={user}>
			    {(user) => user.ID === comment.user.ID &&
						<ButtonMultistate variant="danger" className="mt-2 mb-2" states={[
						  <Fragment>Delete <FiTrash/></Fragment>,
						  <Fragment>Confirm <FiTrash/></Fragment>,
						]} finish={handleDelete}/>
			    }
			  </Cached>
			  <FeedbackError close={setDeleteError}>{deleteError}</FeedbackError>
			</ButtonBar>
    }
  </Fragment>;
}
