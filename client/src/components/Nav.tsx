import * as React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faSignOutAlt, faFolder } from "@fortawesome/free-solid-svg-icons";
import "../styles/nav.scss"
class Nav extends React.Component {

    props: any;
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className  ="alert alert-warning" role="alert">
                    Atelier is currently in version 0.1 of development.
                </div>
                <div className="mx-auto" style={{ width: "200px" }}>
                    <FontAwesomeIcon size={"4x"} icon={faPalette} />
                    <h2 className="title">Atelier</h2>
                </div>
                <div className="nav-bar">
                    <ul className="nav menu-left">
                        {this.props.loggedIn ?
                            <React.Fragment>
                                <li className="nav-item"><Link className="nav-link" to="/roleview">Submissions <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon></Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/logout" onClick={this.props.onLogout}><FontAwesomeIcon icon={faSignOutAlt}></FontAwesomeIcon></Link></li>
                            </React.Fragment> : null
                        }
                    </ul>
                    <div className="menu-right" id="user">
                        {this.props.loggedIn && <div>  {this.props.email} </div> }
                    </div>
                </div>
            </div>
        )
    }

} export default Nav;