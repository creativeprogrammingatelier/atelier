import React from 'react';

interface LinkProperties {
	children: string,
	location: string
}
export function Link({children, location}: LinkProperties) {
	return <div className="link">
		<a href={location}>{children}</a>
	</div>
}