import * as React from "react";
import { Navbar, ListGroup, ListGroupItem } from "react-bootstrap";
import NotificationCard from "./NotificationCard";
import "../../styles/sidebar.scss"

export default class SidebarContent extends React.Component {
    render() {
        return (
            <div className="sidebarContentWrapper" >
                <div className="sidebarContentHeader">
                </div>
                <div className="sidebarContent">
                    <NotificationCard commenter="@Ansgar" comment="@Margot, You should not use globals for this"></NotificationCard>
                    <NotificationCard commenter="@Carmen" comment="@Margot, I like trains"></NotificationCard>
                    <NotificationCard commenter="@Angelika" comment="Please make the Ball class more colorful, @Margot"></NotificationCard>
                </div>
            </div>
        )
    }
}