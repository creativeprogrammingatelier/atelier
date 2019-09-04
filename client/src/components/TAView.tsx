import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import UserHelper from "../../helpers/UserHelper";

class TAView extends React.Component {

    getStudents() {
        UserHelper.getStudents((e: any) => console.log(e), (e: any) => console.log(e))
    }
    render() {
        this.getStudents();
        return (
            < div >



            </div>
        )
    }
} export default TAView;