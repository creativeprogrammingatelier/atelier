import * as React from "react";
import UserHelper from "../../../helpers/UserHelper";
import FileViewer from "../FileViewer";
import FileHelper from "../../../helpers/FileHelper";
import UserTable from "./UserTable"
import { IUser } from "../../../../models/user";
import { IFile } from "../../../../models/file";
import axios from "axios";
import AuthHelper from "../../../helpers/AuthHelper";
import AdminControl from "./AdminControl";
import EditUserModal from "./EditUserModal";
import { Button, Container, Row, Col, Nav, ListGroup, Card } from "react-bootstrap"
import { runInThisContext } from "vm";
import "../../styles/admin.scss"


type AdminViewProps = {}
type AdminViewState = { users: IUser[], viewedUser?: IUser, deleteUserModalOpen: boolean, editUserModalOpen: boolean }

class AdminView extends React.Component<AdminViewProps, AdminViewState> {

  constructor(props: AdminViewProps) {
    super(props);
    this.state = {
      users: [],
      deleteUserModalOpen: false,
      editUserModalOpen: false,
    }
  }

  componentDidMount() {
    UserHelper.getUsers((users: any) => this.setState({ users: users }), (error: Error) => alert("Failed to get users"))
  }

  openEditModal = (user: IUser) => {
    this.setState({
      editUserModalOpen: true,
      viewedUser: user
    })
  }

  closeEditModal = () => {
    this.setState({
      editUserModalOpen: false
    })
  }

  render() {
    return (
      <Container id="adminContainer">
        <Row>
          <Col id="sidebarCol">
            <div className="colHeader">
              <h2>Admin</h2>
            </div>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>Edit users</ListGroup.Item>
                <ListGroup.Item>Edit courses</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col xs={6} id="userTableCol">
            <div className="colHeader">
              <AdminControl />
            </div>
            <UserTable users={this.state.users} openEditModal={this.openEditModal} />
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
          </Col>
          <Col>
            <span></span>
          </Col>
        </Row>
      </Container>
    )
  }
} export default AdminView;