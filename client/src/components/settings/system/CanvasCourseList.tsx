import React from "react"
import { Form } from "react-bootstrap"
import { LabeledInput } from "../../input/LabeledInput"


interface IStateCanvasCourseList { 
  options: any
}
export default class CanvasCourseList extends React.Component<any, IStateCanvasCourseList> {

  private mockData: any;
  constructor(props){
    super(props)
    this.mockData = JSON.parse(`[{"id":117,"name":"Atelier test course","account_id":1,"uuid":"KqUMylbMBG9WkG5pj3JksvFEn60R9kmv5RAP10ed","start_at":null,"grading_standard_id":null,"is_public":false,"created_at":"2020-11-30T10:38:34Z","course_code":"Atelier test course","default_view":"modules","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":50000,"is_public_to_auth_users":false,"apply_assignment_group_weights":false,"calendar":{"ics":"https://utwente-dev.instructure.com/feeds/calendars/course_KqUMylbMBG9WkG5pj3JksvFEn60R9kmv5RAP10ed.ics"},"time_zone":"Europe/Amsterdam","blueprint":false,"sis_course_id":null,"integration_id":null,"enrollments":[{"type":"teacher","role":"TeacherEnrollment","role_id":4,"user_id":144,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"unpublished","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""},{"id":103,"name":"Development Guidelines","account_id":1,"uuid":"8P4EYJLKekE6tvyb2l49Z93K68RIs1MeDoYkrIbM","start_at":"2020-08-19T08:34:21Z","grading_standard_id":null,"is_public":true,"created_at":"2020-08-18T15:05:04Z","course_code":"Development Guidelines","default_view":"modules","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":true,"public_syllabus_to_auth":false,"storage_quota_mb":50000,"is_public_to_auth_users":false,"apply_assignment_group_weights":false,"locale":"en-GB","calendar":{"ics":"https://utwente-dev.instructure.com/feeds/calendars/course_8P4EYJLKekE6tvyb2l49Z93K68RIs1MeDoYkrIbM.ics"},"time_zone":"Europe/Amsterdam","blueprint":false,"enrollments":[{"type":"student","role":"StudentEnrollment","role_id":3,"user_id":144,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":true,"workflow_state":"available","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""}]`)
    this.state = { 
      options: null
    }
  }

  componentDidMount(){
    let newOptions = [<option key = {"no-link"} >{"No Link"}</option>]
    for (const course of this.mockData) {
      console.log(course)
      newOptions.push(<option key = {course["id"]} >{course["name"]}</option>) 
    }
    this.setState({
      options: newOptions
    })
  }

  render() {  
    return 	<LabeledInput label ="Canvas Course Link">
    <Form.Control as="select" custom>
      {(this.state.options!= null)? this.state.options : ""}
    </Form.Control>
  </LabeledInput>
  }
}