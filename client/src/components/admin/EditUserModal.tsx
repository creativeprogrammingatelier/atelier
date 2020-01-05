import * as React from "react";
import { IUser } from "../../../../models/user";
import {FormGroup, Button, FormControl, Modal, ModalProps, FormLabel} from "react-bootstrap"
import UserHelper from "../../../helpers/UserHelper";
type EditUserModalProps = ModalProps & {user?: IUser}
type EditUserModalState = {password: any, role: string}
class EditUserModal extends React.Component<EditUserModalProps, EditUserModalState>{

   
    constructor(props: EditUserModalProps){
        super(props)
        this.state = {
            role: (this.props.user)? this.props.user.role : "",
            password: "newPassword123"
        }
    }

    deleteUser = (user: IUser) => {
        console.log(user)
        UserHelper.deleteUser(user._id, ()=> console.log("success"),()=> console.log("failure"))
    }

    render() {
        if(this.props.user){
            return (
                    
                <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                <Modal.Title>Edit User { this.props.user.email}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <form>
                    <FormGroup
                    controlId="formBasicText"
                    >
                    <FormControl
                        type="text"
                        name="role"
                        placeholder="Role"
                        value={this.state.role}
                        onChange={(event: any)=> this.setState({role: event.target.value})}
                    />
                    <FormControl
                        type="text"
                        name="password"
                        placeholder="New Password"                        
                        value={this.state.password}
                        onChange={(event: any)=> this.setState({password: event.target.value})}

                    />
                    <FormControl.Feedback />
                    </FormGroup>
                    <Button type="button" onClick={() => (this.props.user) ? this.deleteUser(this.props.user): null}>Delete User</Button>
                    <Button type="submit">Update User</Button>
                </form>
                </Modal.Body>
            </Modal>
            )
        }
        return (
            ""
        )
    }

} export default EditUserModal;