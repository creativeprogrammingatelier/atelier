import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {Button} from 'react-bootstrap';

export function Homepage() {
	return (
		<Frame title="Homepage" user="John Doe" sidebar={true} search={false}>
			<p>Some introduction of sorts?</p>
			<div>
				<PanelButton display="Pearls of Computer Science" location="/course/1" icon=""/>
				<PanelButton display="Software Systems" location="/course/2" icon=""/>
				<PanelButton display="Network Systems" location="/course/3" icon=""/>
				<PanelButton display="Data and Information" location="/course/4" icon=""/>
				<PanelButton display="Computer Systems" location="/course/5" icon=""/>
				<PanelButton display="Intelligent Interaction Design" location="/course/6" icon=""/>
				<PanelButton display="Discrete Structures & Efficient Algorithms" location="/course/7" icon=""/>
				<PanelButton display="Programming Paradigms" location="/course/8" icon=""/>
			</div>
		</Frame>
	)
}