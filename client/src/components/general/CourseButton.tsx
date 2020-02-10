import React from 'react';

interface CourseButtonProperties {
	display: string,
	icon: string
}
export function CourseButton({display, icon}: CourseButtonProperties) {
	return <button>{display}</button>
}