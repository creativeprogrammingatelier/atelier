import React, {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import {FiSend} from "react-icons/all";

interface CommentCreatorProperties {
	sendHandler: (comment: string) => Promise<boolean>
}
export function CommentCreator({sendHandler}: CommentCreatorProperties) {
	const [comment, setComment] = useState("");
	const [sending, setSending] = useState(false);
	const [shift, setShift] = useState(false);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		console.log("Pressed a key: "+event.key);
		if (event.key === "Shift") {
			setShift(true);
		}
		if (event.key === "Enter") {
			// Pressing enter by default does some weird redirect thing, cancel that
			event.preventDefault();
			if (shift) {
				// Instead, we want it to add a new line to the input if shift is held
				// TODO: However, only textarea's accept new lines, so fix that at some point
				setComment(comment => comment + "\n");
			} else if (event.key === "Enter") {
				// Or submit the comment if not. There is an undefined promise resolve to make warnings go away
				handleCommentSubmit().then(undefined);
			}
		}
	};
	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key === "Shift") {
			setShift(false);
		}
	};
	const handleCommentChange = (event: React.FormEvent<HTMLInputElement>)  => setComment((event.target as HTMLInputElement).value);
	const handleCommentSubmit = async() => {
		if (!sending) {
			setSending(true);

			if (await sendHandler(comment)) {
				setComment("");
			}

			setSending(false);
		}
	};

	return <Form>
		<Form.Group>
			<InputGroup className="bg-transparent">
				<Form.Control type="text" placeholder="Reply..." className="bg-transparent" value={comment} onChange={handleCommentChange} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}/>
				<InputGroup.Append>
					<Button onClick={handleCommentSubmit} disabled={sending}><FiSend size={14} color="#FFFFFF"/></Button>
				</InputGroup.Append>
			</InputGroup>
		</Form.Group>
	</Form>
}