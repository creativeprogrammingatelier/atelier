import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Nav from "./Nav";

class Home extends React.Component {

    render() {
        return (
            < div >
                <h1>Welcome Home (Login required to arrive here)</h1>
            </div>
        )
    }
} export default Home;