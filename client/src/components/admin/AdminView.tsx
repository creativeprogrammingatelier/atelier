import * as React from 'react';
import UserHelper from '../../../helpers/UserHelper';
import FileViewer from '../FileViewer';
import FileHelper from '../../../helpers/FileHelper';
import {User} from '../../../../models/User';
import {File} from '../../../../models/File';
import axios from 'axios';
import AuthHelper from '../../../helpers/AuthHelper';
import AdminControl from './AdminControl';
import EditUserModal from './EditUserModal';
import {Button} from 'react-bootstrap';
import Octicon, {Pencil} from '@primer/octicons-react';

type AdminViewProps = {}
type AdminViewState = {users: User[], viewedUser?: User, deleteUserModalOpen: boolean, editUserModalOpen: boolean}

class AdminView extends React.Component<AdminViewProps, AdminViewState> {


	constructor(props: AdminViewProps) {
		super(props);
		this.state = {
			users: [],
			deleteUserModalOpen: false,
			editUserModalOpen: false
		};
	}

	componentDidMount() {
		UserHelper.getUsers((users: any) => this.setState({users: users}), (error: Error) => alert('Failed to get users'));
	}

	populateUsers(): any[] {
		let userRows = [];
		for (const user of this.state.users) {
			userRows.push(
				<tr>
					<td>{user.email}</td>
					<td>{user.role}</td>
					<td><Button onClick={() => this.openEditModal(user)}><Octicon icon={Pencil}/></Button></td>
				</tr>
			);
		}
		return userRows;
	}
	openEditModal = (user: User) => {
		this.setState({
			editUserModalOpen: true,
			viewedUser: user
		});
	};

	closeEditModal = () => {
		this.setState({
			editUserModalOpen: false
		});
	};

	render() {
		return (
			<div>
				<AdminControl/>
				<table className="table">
					<thead>
					<tr>
						<th>Email</th>
						<th>Role</th>
						<th></th>
					</tr>
					</thead>
					<tbody>
					{this.populateUsers()}
					</tbody>
				</table>
				<div>
				</div>
				{
					(this.state.viewedUser != undefined) ?
						<div id="editUserModal">
							<EditUserModal
								show={this.state.editUserModalOpen}
								onHide={this.closeEditModal}
								user={this.state.viewedUser}>
							</EditUserModal>
						</div> : null
				}
			</div>
		);
	}
}
export default AdminView;