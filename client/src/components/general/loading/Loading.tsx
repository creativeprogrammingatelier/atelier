import React, {useState, useEffect, Fragment} from "react";
import {Spinner} from "react-bootstrap";

// TODO: Define this locally, as it will be the only place it should be used
import {LoadingState} from "../../../placeholdermodels";
import {LoadingIcon} from "./LoadingIcon";
import {Children, ChildrenConstructor, Parent} from "../../../helpers/ParentHelper";

// Disable the warning, it's how you define a generic function in TypeScript
// tslint:disable-next-line: no-any 
type LoadingFunc<R> = (...args: any[]) => Promise<R>;

interface LoadingProperties<R, F extends LoadingFunc<R>> {
	/** Asynchronous function that takes arguments and returns a Promise of the data */
	loader: F,
	/** Parameters to pass to the function */
	params?: Parameters<F>,
	/** Function taking the loaded data returning the component to render */
	component: (result: R) => Children
	/** An optional component to use to wrap around the loading icon or error message */
	wrapper?: (children: Children) => Children,
	cache?: boolean
}

/**
 * Loading component that shows a loading spinner wile data is loading
 * and gives the data
 */
export function Loading<R, F extends LoadingFunc<R> = LoadingFunc<R>>({loader: promise, params: parameters, component, wrapper, cache}: LoadingProperties<R, F>) {
	const [state, updateState] = useState(LoadingState.Loading);
	const [result, updateResult] = useState(undefined as R | undefined);
	const [error, updateError] = useState(undefined as {error: string, message: string} | undefined);

	const wrapped = (children: JSX.Element) => wrapper ? <Fragment key="wrapped">{wrapper(children)}</Fragment> : children;

	useEffect(() => {
		(parameters ? promise(...parameters, cache) : promise(cache)).then(res => {
			updateResult(res);
			updateState(LoadingState.Loaded);
		}).catch(err => {
			updateError(err);
			updateState(LoadingState.Error);
		});
	}, [parameters]);

	if (state === LoadingState.Loaded) {
		console.log("Loading is rendering a component");
		return Parent.constructChildren(component(result!));
	} else if (state === LoadingState.Error) {
		console.log("Loading had an error");
		return wrapped(
			<div>
				An error occurred: {error!.message}.
			</div>
		);
	} else { // state === LoadingState.Loading
		return wrapped(<LoadingIcon/>);
	}
}