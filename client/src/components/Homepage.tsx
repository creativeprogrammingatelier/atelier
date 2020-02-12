import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './general/Frame';

export function Homepage() {
	return (
		<Frame title="Homepage" user="John Doe" sidebar={true} search={false}>
			<p>Some introduction of sorts?</p>
			<PanelButton display="Pearls of Computer Science" icon=""/>
			<PanelButton display="Software Systems" icon=""/>
			<PanelButton display="Network Systems" icon=""/>
			<PanelButton display="Data and Information" icon=""/>
			<PanelButton display="Computer Systems" icon=""/>
			<PanelButton display="Intelligent Interaction Design" icon=""/>
			<PanelButton display="Discrete Structures & Efficient Algorithms" icon=""/>
			<PanelButton display="Programming Paradigms" icon=""/>
		</Frame>
	)
}