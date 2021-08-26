import React from "react";
import {Button, Form, FormLabel} from "react-bootstrap";
import { CanvasHelper } from "../../../helpers/CanvasHelper";

interface UserCanvasLinkState {
    enabled: boolean,
    linked: boolean
}

/**
 * Component to link and unlink atelier to user's canvas account.
 */
export default class UserCanvasLink extends React.Component<Record<string, never>, UserCanvasLinkState> {

    constructor(props: Record<string, never>){
        super(props);
        this.state = {
            enabled: false,
            linked: false
        };
        this.checkEnabled();
        this.checkLinkedCanvas();
    }

    private linkCanvas = () => {
        CanvasHelper.createLink().then(res => {
            window.location.href = res.redirect;
            // TODO @andrewjh9 - I'm not sure what the following line was supposed to do.
            // As far as I can tell, the /api/canvas/link enpoint only returns a 'redirect' field,
            // this.setState({ linked: res.linked });
            // I've replaced it with this line for now, as I think it's equivalent to the old behavior:
            this.setState({ linked: false });
        });
    }

    /**
     * Remove Link to canvas
     */
    private unlinkCanvas = () => {
        CanvasHelper.removeLink().then(_ => this.setState({linked: false}));
    }

    /**
     * Check if account has already been linked
     */
    private checkLinkedCanvas() {
        CanvasHelper.getLinked().then(res =>
            this.setState({ linked: res.linked })
        );
    }

    /** Check if Canvas integration is enabled */
    private checkEnabled() {
        CanvasHelper.isEnabled().then(res => this.setState({ enabled: res }));
    }

    render(){
        return (
            this.state.enabled &&
            <Form>
                <FormLabel><p className="label">Canvas Link</p></FormLabel> <br/>
                    Linking Allows Atelier to Access your canvas data.<br/>
                <Button onClick={this.linkCanvas} disabled={this.state.linked} >Link</Button>
                <Button onClick={this.unlinkCanvas} disabled={!this.state.linked}>Unlink</Button>
            </Form>
        );
    }
}

