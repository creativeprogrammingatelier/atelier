import * as React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Login from "./Login";
import UserHelper from "../../helpers/UserHelper";
import FileViewer from "./FileViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import FileHelper from "../../helpers/FileHelper";

class TAView extends React.Component {
    state: { students: any }

    constructor(props:any){
        super(props);
        this.state={ students: []};
        this.getStudents();
    }
    getStudents() {
        UserHelper.getStudents((e: any) => this.setState({students:e} ), (e: any) => console.log(e))
    }

    populateTable(){
        let rows = [];
        if(this.state.students != []){
            for (let student of this.state.students) {

                rows.push(


                <div className="card">
                    <div className="card-header" id="headingOne">
                    <h2 className="mb-0">
                        <button className="btn btn-link"  onClick={()  =>this.viewStudentFiles(student._id)} type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        {student.email}
                        </button>
                    </h2>
                    </div>
                    <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                    <div className="card-body">
                        {(student.files != null)?<FileViewer files={student.files}></FileViewer>:null}
                   </div>
                    </div>
                </div>
                  );
          
            }
        }
        return rows;
    
    }
     viewStudentFiles(studentId: String){
         FileHelper.getStudentsFiles(studentId, (result:any ) => {
             let students: any = this.state.students;
             for (const student of students) {
                 if(student._id = studentId){
                        student.files = result;
                        break;
                 }
             }
             this.setState({
                 students: students
             })
         }, (error: any) => console.log("Failure not implemented"))
     }
    render() {  
        return (
            <div className="accordion" id="accordionExample">
                {this.populateTable()}
            </div>
        )
    }
} export default TAView;