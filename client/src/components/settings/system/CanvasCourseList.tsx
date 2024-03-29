import React, {ChangeEvent} from "react";
import {Form} from "react-bootstrap";
import {Fetch} from "../../../helpers/api/FetchHelper";
import {CanvasHelper} from "../../../helpers/CanvasHelper";
import {LabeledInput} from "../../input/LabeledInput";

interface CanvasCourse {
    id: string,
    name: string
}

interface IStateCanvasCourseList {
    enabled: boolean,
    data: CanvasCourse[] | null,
    onLinkCanvasCourse: (selectedCourseId: string) => void,
    selectedCourseId: string
}

interface IPropsCanvasCourseList {
    onLinkCanvasCourse: (selectedCourseId: string) => void
}

export default class CanvasCourseList extends React.Component<IPropsCanvasCourseList, IStateCanvasCourseList> {

    constructor(props: IPropsCanvasCourseList) {
        super(props);
        this.state = {
            enabled: false,
            data: null,
            selectedCourseId: "",
            onLinkCanvasCourse: props.onLinkCanvasCourse
        };
        this.checkEnabled();
    }

    loadCourses() {
        if (this.state.enabled) {
            Fetch.fetch("/api/canvas/courses")
                .then(async res => await res.json() as CanvasCourse[])
                .then(res => this.setState({data: res}));
        }
    }

    componentDidMount() {
        this.loadCourses();
    }

    componentDidUpdate() {
        this.state.onLinkCanvasCourse(this.state.selectedCourseId);
        if (this.state.data === null) {
            this.loadCourses();
        }

    }
    handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({selectedCourseId: event.target.value});
    };

    getOptions() {
        if (this.state.data != null) {
            const newOptions = [<option key={""} value={""} >No Canvas Link</option>];
            for (const course of this.state.data) {
                newOptions.push(<option key={course["id"]} value={course["id"]} >{course["name"]}</option>);
            }
            // Ensuring default is sent to out component
            this.state.onLinkCanvasCourse("");
            return newOptions;
        } else {
            return [<option key={"no-link"} >{"You have not linked Atelier to your canvas please do so the setting page."}</option>];
        }
    }

    /** Check if Canvas integration is enabled */
    private checkEnabled() {
        CanvasHelper.isEnabled().then(res => this.setState({enabled: res}));
    }

    render() {
        return (
            this.state.enabled &&
            <LabeledInput label="Canvas Course Link">
                <Form.Control as="select" custom onChange={this.handleSelect}>
                    {this.getOptions()}
                </Form.Control>
            </LabeledInput>
        );
    }
}
