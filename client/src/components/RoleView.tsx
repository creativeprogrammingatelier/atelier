import * as React from "react";
import StudentView from "./StudentView";
import TAView from "./TAView";
import AdminView from "./admin/AdminView";
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
        } else if (this.props.role == 'teacher') {
            correctView = <TAView />
        } else if (this.props.role == 'admin') {
            correctView = <AdminView />
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