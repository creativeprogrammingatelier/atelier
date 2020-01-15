import * as React from "react";
import { IUser } from "../../../../models/user";
//import { FiUserPlus, FiFilter } from "react-icons/fi";

type AdminControlProps = {}
type AdminControlState = {users: IUser[]}

class AdminControl extends React.Component<AdminControlProps, AdminControlState> {
    
    

    constructor(props: AdminControlProps){
        super(props);
        this.state = {
            users: []
        }
    }

    render() {  
        return (
            <div>
                <div>
                    <ul>
                        <li><button type="button" className="btn"  data-toggle="modal" data-target="#exampleModal" title="Add User"  ><FiUserPlus /></button></li>
                        <li><button  type="button" className="btn" title="Filter User" ><FiFilter /></button></li>
                    </ul>
                </div>
            </div>
        )
    }
} export default AdminControl;