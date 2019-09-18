import * as React from "react";
import UserHelper from "../../helpers/UserHelper";
import FileViewer from "./FileViewer";
import FileHelper from "../../helpers/FileHelper";

class TAView extends React.Component {
    state: { students: any, currentStudent: any }

    constructor(props:any){
        super(props);
        this.state={ students: [], currentStudent: null};
        this.getStudents();
    }
    getStudents() {
        UserHelper.getStudents((students: any) => this.setState({students: students} ), (e: any) => console.log(e))
    }

    populateTable(){
        let rows = [];
        if(this.state.students != []){
            for (let student of this.state.students) {
                rows.push(
                <div className="card" key={student._id}>
                    <div className="card-header" id={`student-card-header-${student._id}`}>
                    <h2 className="mb-0">
                        <button className="btn btn-link"  onClick={(element)  =>this.viewStudentFiles(element, student._id,)} 
                            type="button" data-toggle="collapse" data-target={`student-card-collapse-${student._id}`} 
                            aria-controls={`student-card-collapse-${student._id}`}>
                        {student.email}
                        </button>
                    </h2>
                    </div>
                    <div id={`student-card-collapse-${student._id}`}  className={`collapse ${(student.files != null && student == this.state.currentStudent)?"show":null}`} aria-labelledby={`student-card-collapse-${student._id}`} data-parent="#accordionStudentFiles">
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
    viewStudentFiles(element:any, studentId: String){
        FileHelper.getStudentsFiles(studentId, (result:any ) => {
            let students: any = this.state.students;
            let currentStudent;
            for (const student of students) {
                if(student._id == studentId){
                    currentStudent = student;
                    student.files = result;
                    break;
                }
            }
            this.setState({
                students: students,
                currentStudent: (this.state.currentStudent == currentStudent) ? null : currentStudent
            })
        }, (error: any) => alert("Failed to find student's files"))
    }
    render() {  
        return (
            <div className="accordion" id="accordionStudentFiles">
                {this.populateTable()}
            </div>
        )
    }
} export default TAView;