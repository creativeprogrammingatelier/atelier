import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';

export function Homepage() {
	return (
		<Frame title="Homepage" user="John Doe" sidebar={true} search={false}>
			<p>Some introduction of sorts?</p>
			<PanelButton display="Pearls of Computer Science" location="/courseOverview" icon=""/>
			<PanelButton display="Software Systems" location="/courseOverview" icon=""/>
			<PanelButton display="Network Systems" location="/courseOverview" icon=""/>
			<PanelButton display="Data and Information" location="/courseOverview" icon=""/>
			<PanelButton display="Computer Systems" location="/courseOverview" icon=""/>
			<PanelButton display="Intelligent Interaction Design" location="/courseOverview" icon=""/>
			<PanelButton display="Discrete Structures & Efficient Algorithms" location="/courseOverview" icon=""/>
			<PanelButton display="Programming Paradigms" location="/courseOverview" icon=""/>
		</Frame>
	)
}