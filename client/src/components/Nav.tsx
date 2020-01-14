import * as React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faSignOutAlt, faFolder } from "@fortawesome/free-solid-svg-icons";
import "../styles/nav.scss"
import { Navbar } from "react-bootstrap";
class Nav extends React.Component {

    props: any;
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <Navbar bg="dark" variant="dark" fixed="top" id="main-nav">
                    <Navbar.Brand href="#home">
                        <FontAwesomeIcon size={"2x"} icon={faPalette} /> {' '}
                        <h2 className="title">Atelier</h2>
                    </Navbar.Brand>
                    {this.props.loggedIn ?
                        <React.Fragment>
                            <Navbar.Collapse className="justify-content-end">
                                <Navbar.Text>
                                    <Link className="nav-link" to="/roleview">Submissions <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon></Link>
                                </Navbar.Text>

                                <Navbar.Text>
                                    Signed in as: <a href="#login">{this.props.email}</a>
                                </Navbar.Text>
                                <Navbar.Text>
                                    <Link className="nav-link" to="/logout" onClick={this.props.onLogout}><FontAwesomeIcon icon={faSignOutAlt}></FontAwesomeIcon></Link>
                                </Navbar.Text>
                            </Navbar.Collapse>
                        </React.Fragment> : null
                    }

                </Navbar>
            </div>
        )
    }

} export default Nav;