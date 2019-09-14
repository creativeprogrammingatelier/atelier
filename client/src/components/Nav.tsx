import * as React from "react";
import { Link } from "react-router-dom";
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
            <div>
                <div className="mx-auto" style={{ width: "200px" }}>
                    <FontAwesomeIcon size={"4x"} icon={faPalette} />
                    <h2 className="title">Atelier</h2>
                </div>
                <div className="nav-bar">
                    <ul className="nav menu-left">
                        {this.props.loggedIn ?
                            <React.Fragment>
                                <li className="nav-item"><Link className="nav-link" to="/roleview">Submissions</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/logout" onClick={this.props.onLogout}>Logout</Link></li>
                            </React.Fragment> :
                            <React.Fragment>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                            </React.Fragment>
                        }
                    </ul>
                    <div className="menu-right" id="user">
                        Logged in as {this.props.role}: {this.props.email}
                    </div>
                </div>
            </div>
        )
    }

} export default Nav;