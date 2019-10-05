import * as React from "react";
import StudentView from "./StudentView";
import TAView from "./TAView";
/**
 * Yet to be implemeneted 
 */
class RoleView extends React.Component {

    props: any;
    constructor(props: any) {
        super(props)
    }

    render() {

        let correctView;
        if (this.props.role == 'student') {
            correctView = <StudentView />
        } else if (this.props.role == 'ta') {
            correctView = <TAView />
        } else {
            correctView = '';
        }

        return (
            <div>
                {correctView}
            </div>
        )



    }
} export default RoleView;