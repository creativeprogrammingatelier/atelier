import { FetchError } from "node-fetch";
import React from "react"
import { Button, Form } from "react-bootstrap"
import { Fetch } from "../../../helpers/api/FetchHelper";
import { LabeledInput } from "../../input/LabeledInput"


interface IStateCanvasCourseList { 
  data: any
  onLinkCanvasCourse: Function,
  selectedCourseId: string
}

interface IPropsCanvasCourseList { 
  onLinkCanvasCourse: Function
}
export default class CanvasCourseList extends React.Component<IPropsCanvasCourseList, IStateCanvasCourseList> {

  constructor(props :IPropsCanvasCourseList){
    super(props)
    this.state = { 
      data: null,
      selectedCourseId: "",
      onLinkCanvasCourse: props.onLinkCanvasCourse
    }
  }

  componentDidMount(){
    Fetch.fetch("/api/canvas/courses").then(res =>  res.json().then(res =>  this.setState({data:  res})))
  }

  componentDidUpdate(){
    this.state.onLinkCanvasCourse(this.state.selectedCourseId)

  }
  handleSelect = (event : any) => {
   this.setState({selectedCourseId: event.target.value})
  }

  getOptions(){
    if (this.state.data != null) {
      let newOptions = [<option key = {""} value = {""} >No Canvas Link</option>]
      for (const course of this.state.data) {
        newOptions.push(<option key = {course["id"]} value = {course["id"]} >{course["name"]}</option>) 
      }
      // Ensuring default is sent to out component
      this.state.onLinkCanvasCourse("")
      return newOptions;
    } else { 
      return [<option key = {"no-link"} >{"You have not linked Atelier to your canvas please do so the setting page."}</option>]
    }
  }


  
  render() {  
    return 	<LabeledInput label ="Canvas Course Link">
    <Form.Control as="select" custom  onChange={this.handleSelect}> 
      {this.getOptions()}
    </Form.Control>
  </LabeledInput>

  }
}