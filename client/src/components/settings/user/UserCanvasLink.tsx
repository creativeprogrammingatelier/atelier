import React from "react";
import {Button, Form, FormLabel} from "react-bootstrap";
import { CanvasHelper } from "../../../helpers/CanvasHelper";

interface PermissionDisplay {
    [key: string]: string
}
interface PermissionState {
    [key: string]: boolean
}
interface UserSettingsPermissionsProperties {
    courseID?: string
}
interface UserSettingsPermissionsSectionProperties {
    header: string,
    display: PermissionDisplay,
    state: PermissionState,
    setState: (permission: string, state: boolean) => void
}
/**
 * Component to link and unlink atelier to user's canvas account.
 */
export default class UserCanvasLink extends React.Component<any, any> {

    constructor(props: any){
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
            this.setState({linked: res.linked	});


        });
    }

    /**
     * Remove Link to canvas
     */
    private unlinkCanvas = () => {
        CanvasHelper.removeLink().then(res => this.setState({linked: false}));
    }

    /**
     * Check if account has already been linked
     */
    private checkLinkedCanvas() {
        CanvasHelper.getLinked().then(res =>
            this.setState({linked: res.linked})
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

