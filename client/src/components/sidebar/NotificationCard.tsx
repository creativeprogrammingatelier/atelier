import * as React from "react";
import "../../styles/sidebar.scss";
import { Card } from "react-bootstrap";

interface ICardProps {
    commenter: String;
    comment: String;
}

interface ICardState {
}

export default class NotificationCard extends React.Component<ICardProps, ICardState>  {

    state: { visible: boolean }

    constructor(props: { commenter: String, comment: String }) {
        super(props);
        this.state = {
            visible: true,
        }
    }

    render() {
        return (
            <div className="notificationCard">
                <Card>
                    <Card.Body>
                        <Card.Text>
                            <b>{this.props.commenter}</b> mentioned you in a comment: 
                            <br></br>
                            <i>{this.props.comment}</i>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}