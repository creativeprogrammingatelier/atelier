import * as React from "react";
import { IUser } from "../../../../models/user";

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
                        <li><button type="button" className="btn btn-primary"  data-toggle="modal" data-target="#exampleModal" >Create User</button></li>
                        <li><button  type="button" className="btn btn-primary" >Filter</button></li>
                    </ul>
                </div>
                <div className="modal fade" id="exampleModal" >
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ...
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
} export default AdminControl;