import React from 'react';

interface RoutingProperties {
	match: {
		params: {
			token: string,
			user: string
		}
	}
}
export function RoutingTest({match:{params:{token, user}}}: RoutingProperties) {
	return <div>
		<p>{token}</p>
		<p>{user}</p>
	</div>
}