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

    populateNavbar = () => {
        let links = []

        if (this.props.loggedIn) {

            if (this.props.role == 'admin') {
                links.push(this.formattedLink('/admin', null, 'Admin'))
            }

            if (this.props.role == ('admin' || 'teacher' || 'ta' || 'teaching assistant')) {
                links.push(this.formattedLink('/ta', faFolder, 'All submissions'))
            }

            if (this.props.role == ('student' || 'students')) {
                links.push(this.formattedLink('/student', faFolder, 'My submissions'))
            }

            links.push(
                <Navbar.Text>
                    Signed in as: <a href="#login">{this.props.email}</a>
                </Navbar.Text>
            )

            links.push(this.formattedLink('/logout', faSignOutAlt, ''))

        }

        return (
            <React.Fragment>
                {links}
            </React.Fragment>
        )
    }

    formattedLink = (path: any, icon: any, linkText: string) => {
        return (
            <Navbar.Text>
                <Link className="nav-link" to={path}> <FontAwesomeIcon icon={icon}></FontAwesomeIcon> {linkText} </Link>
            </Navbar.Text>
        )
    }

    render() {
        return (
            <div>
                <Navbar bg="dark" variant="dark" fixed="top" id="main-nav">
                    <Navbar.Brand href="#home">
                        <FontAwesomeIcon size={"2x"} icon={faPalette} /> {' '}
                        <h2 className="title">Atelier</h2>
                    </Navbar.Brand>
                    <React.Fragment>
                        <Navbar.Collapse className="justify-content-end">
                            {this.populateNavbar()}
                        </Navbar.Collapse>
                    </React.Fragment>
                </Navbar>
            </div>
        )
    }

} export default Nav;