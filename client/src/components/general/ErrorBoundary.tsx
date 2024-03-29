import React, {ErrorInfo} from "react";
import {ParentalProperties} from "../../helpers/ParentHelper";

import {FeedbackContent} from "../feedback/Feedback";
import {FeedbackError} from "../feedback/FeedbackError";

type ErrorBoundaryProperties = ParentalProperties
interface ErrorBoundaryState {
    error: FeedbackContent
}

/** This component will catch any React errors and display a FeedbackError */
// This is a class-based component, because that is the only way
// React currently supports to create an error boundary
export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProperties) {
        super(props);
        this.state = {error: false};
    }

    static getDerivedStateFromError(error: Error) {
        return {
            error: `An unexpected error occured: ${error.message}`
        };
    }

    componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        // TODO: log this somewhere
    }

    render() {
        if (this.state.error) {
            return <FeedbackError close={error => this.setState({error})}>{this.state.error}</FeedbackError>;
        } else {
            return this.props.children;
        }
    }
}
