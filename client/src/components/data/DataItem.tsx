import React from "react";
import {Toast, ToastBody} from "react-bootstrap";

import {HTMLProperties} from "../../helpers/HTMLHelper";
import {OptionalLink} from "../general/OptionalLink";

import {Tag, TagProperties} from "../general/Tag";

interface DataItemProperties extends HTMLProperties {
	transport?: string,
	text: string,
	tags?: TagProperties[]
}
export function DataItem({transport, text, tags, className, id, key, children}: DataItemProperties) {
	return <div className={"dataItem " + className} id={id} key={key}>
		<OptionalLink to={transport ? transport : ""}>
			<Toast>
				<ToastBody>
					<p className="m-0 mr-1 d-inline">{text}</p>
					{tags !== undefined && tags.map((tag) => <Tag {...tag}/>)}
				</ToastBody>
				{children}
			</Toast>
		</OptionalLink>
	</div>;
}