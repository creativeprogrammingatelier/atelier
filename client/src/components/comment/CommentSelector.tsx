import React, {useState} from "react";
import {FiSend, FiTag} from "react-icons/all";
import {Button} from "react-bootstrap";
import {Floater} from "../general/Floater";
import {CommentCreator} from "./CommentCreator";

interface CommentSelectorProperties {

}
export function CommentSelector({}: CommentSelectorProperties) {
	const [selecting, setSelecting] = useState(false);

	return selecting ?
		<Floater bottom={44} left={0} width="-webkit-fill-available" height="3rem" className="m-2">
			<CommentCreator
				placeholder="Make a selection"
				round
				allowRestricted
				sendHandler={(comment, restricted) => {
					console.log("Creating new comment: "+comment+", restricted: "+restricted);
					return new Promise<boolean>(() => true);
				}}
			/>
		</Floater>
		:
		<Floater right={0} bottom={44} width="3rem" height="3rem" className="m-2">
			<Button className="round" onClick={() => setSelecting(true)}><FiTag size={22}/></Button>
		</Floater>
}