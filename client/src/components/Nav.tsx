import * as React from "react";
import { Route, Switch, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import "../styles/nav.scss"
class Nav extends React.Component {

    props: any;
    constructor(props: any) {
        super(props);
    }

    render() {

        return (
            < div >
                <div className="mx-auto" style={{ width: "200px" }}>
                    <FontAwesomeIcon size={"4x"} icon={faPalette} />
                    <h2 className="title">Atelier</h2>
                </div>
                <ul className="nav">
                    {this.props.loggedIn ?
                        <React.Fragment>
                            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/student">Student</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/ta">Teaching Assisant</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/logout" onClick={this.props.onLogout}>Logout</Link></li>
                        </React.Fragment> :
                        <React.Fragment>
                            <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                        </React.Fragment>
                    }

                </ul>
            </div>
        )
    }
} export default Nav;