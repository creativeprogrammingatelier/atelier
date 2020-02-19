import React, {MouseEvent} from 'react';
import {User} from '../../../../models/User';
import {FormGroup, Button, FormControl, Modal, ModalProps, FormLabel, Form} from 'react-bootstrap';
import UserHelper from '../../../helpers/UserHelper';
import {FiUserX, FiTrash2} from 'react-icons/fi';

type EditUserModalProps = ModalProps & {user?: User}
type EditUserModalState = {password: any, role: string, updated: boolean}
class EditUserModal extends React.Component<EditUserModalProps, EditUserModalState> {


	constructor(props: EditUserModalProps) {
		super(props);
		this.state = {
			role: (this.props.user) ? this.props.user.role! : '',
			password: 'newPassword123',
			updated: false
		};
	}

	deleteUser = (e: MouseEvent, user: User) => {
		e.preventDefault();
		UserHelper.deleteUser(user.userID, () => (this.props && this.props.onHide) ? this.props.onHide() : null, () => console.log('delete failed'));
	};

	updateUser = (e: MouseEvent, user: User) => {
		e.preventDefault();
		if (this.props.user) {
			UserHelper.updateUser({
				email: this.props.user.email,
				password: this.state.password,
				role: this.state.role
			}, () => (this.props && this.props.onHide) ? this.props.onHide() : null, () => console.log('failure'));
		}
	};

	render() {
		if (this.props.user) {
			return (
				<Modal show={this.props.show} onHide={this.props.onHide}>
					<Modal.Header closeButton>
						<Modal.Title>Edit User {this.props.user.email}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<FormGroup
								controlId="UpdateUser"
							>
								<Form.Control as="select" value={this.state.role} onChange={(event: any) => this.setState({role: event.target.value})}>
									<option>Student</option>
									<option>Teacher</option>
									<option>Admin</option>
								</Form.Control>
								<FormControl
									type="text"
									name="password"
									placeholder="New Password"
									value={this.state.password}
									onChange={(event: any) => this.setState({password: event.target.value})}

								/>
								<FormControl.Feedback/>
							</FormGroup>
							<Button type="button" onClick={(e: MouseEvent) => (this.props.user) ? this.deleteUser(e, this.props.user) : e.preventDefault()}><FiUserX/></Button>
							<Button type="submit" onClick={(e: MouseEvent) => (this.props.user) ? this.updateUser(e, this.props.user) : e.preventDefault()}><FiTrash2/></Button>

						</form>
					</Modal.Body>
				</Modal>
			);
		}
	}

}
export default EditUserModal;