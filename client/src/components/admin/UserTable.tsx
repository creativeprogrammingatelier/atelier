import * as React from "react";
import { IUser } from "../../../../models/user";
import { FiUserPlus, FiFilter } from "react-icons/fi";
import { Button, Table, Card } from "react-bootstrap"
import EditUserModal from "./EditUserModal";
import Octicon, { Pencil } from "@primer/octicons-react";

type UserTableProps = { users: IUser[], openEditModal: any }
type UserTableState = { users: IUser[] }

class UserTable extends React.Component<UserTableProps, UserTableState> {

    constructor(props: UserTableProps) {
        super(props);
        this.state = {
            users: []
        }
    }

    populateUsers(): any[] {
        let userRows = []
        for (const user of this.props.users) {
            userRows.push(
                <tr>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td><Button onClick={() => this.props.openEditModal(user)}><Octicon icon={Pencil} /></Button></td>
                </tr>
            )
        }
        return userRows;
    }


    render() {
        return (
                <Table striped hover variant="dark" className="table" id="userTable">
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
                </Table>
        )
    }
} export default UserTable;