import React, {useState, useEffect, Fragment} from "react";
import {Children, Parent} from "../../../helpers/ParentHelper";
import {LoadingIcon} from "./LoadingIcon";

// Disable the warning, it's how you define a generic function in TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoadingFunc<R> = (...args: any[]) => Promise<R>;

export enum LoadingState {
    Unloaded,
    Loading,
    Loaded,
    Error
}

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

    const wrapped = (children: JSX.Element) => wrapper ?
        <Fragment key="wrapped">{wrapper(children)}</Fragment>
        :
        children;

    useEffect(() => {
        (parameters ? promise(...parameters, cache) : promise(cache)).then(res => {
            updateResult(res);
            updateState(LoadingState.Loaded);
        }).catch((err: {error: string, message: string}) => {
            updateError(err);
            updateState(LoadingState.Error);
        });
    }, [parameters]);

    if (state === LoadingState.Loaded && result !== undefined) {
        return Parent.constructChildren(component(result));
    } else if (state === LoadingState.Error && error !== undefined) {
        return wrapped(
            <div>
                An error occurred: {error.message}.
            </div>
        );
    } else if (state === LoadingState.Loading) {
        return wrapped(<LoadingIcon/>);
    } else {
        return wrapped(
            <div>
                Something got confused, the current state is {state}, but there is no result and no error.
                This should not happen.
            </div>
        );
    }
}
