import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Nav from "./Nav";

class Home extends React.Component {

    render() {
        return (
            < div >
                <h3>Welcome</h3>
            </div>
        )
    }
} export default Home;