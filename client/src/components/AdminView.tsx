import * as React from "react";
import UserHelper from "../../helpers/UserHelper";
import FileViewer from "./FileViewer";
import FileHelper from "../../helpers/FileHelper";
import User, { IUser } from "../../../models/user";
import { IFile } from "../../../models/file";
import axios from "axios";
import AuthHelper from "../../helpers/AuthHelper";
import AdminControl from "./AdminControl";
type AdminViewProps = {}
type AdminViewState = {users: IUser[]}

class AdminView extends React.Component<AdminViewProps, AdminViewState> {
    
    

    constructor(props: AdminViewProps){
        super(props);
        this.state = {
            users: []
        }
    }

    componentDidMount(){
      UserHelper.getUsers((users:any )=>this.setState({users: users}),(error: Error)=>alert("Failed to get users"))
    }

    populateUsers(): any[]{
        let userRows = []
        for (const user of this.state.users) {
            userRows.push(
                <tr>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>Edit</td>
                    <td>Delete</td>
                </tr>
            )
        }
        return userRows
    }

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
                <th></th>
              </tr>
            </thead>
            <tbody>
                {this.populateUsers()}
            </tbody>
          </table>
        </div>
        )
    }
} export default AdminView;