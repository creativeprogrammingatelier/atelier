import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";

class App extends React.Component {

    render() {
        return (
            < div >
                < Switch >
                    <PrivateRoute exact path='/' component={Home} />
                    <Route path='/' component={Login} />
                </Switch >
            </div>
        )
    }
} export default App;