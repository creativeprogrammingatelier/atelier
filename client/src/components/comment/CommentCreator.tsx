import React, {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import {FiSend} from "react-icons/all";

interface CommentCreatorProperties {
	sendHandler: (comment: string) => Promise<boolean>
}
export function CommentCreator({sendHandler}: CommentCreatorProperties) {
	const [comment, setComment] = useState("");
	const [sending, setSending] = useState(false);

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
				<Form.Control type="text" placeholder="Reply..." className="bg-transparent" value={comment} onChange={handleCommentChange}/>
				<InputGroup.Append>
					<Button onClick={handleCommentSubmit} disabled={sending}><FiSend size={14} color="#FFFFFF"/></Button>
				</InputGroup.Append>
			</InputGroup>
		</Form.Group>
	</Form>
}