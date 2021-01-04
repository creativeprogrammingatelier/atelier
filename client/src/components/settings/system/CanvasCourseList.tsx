import { FetchError } from "node-fetch";
import React from "react"
import { Button, Form } from "react-bootstrap"
import { Fetch } from "../../../helpers/api/FetchHelper";
import { LabeledInput } from "../../input/LabeledInput"


interface IStateCanvasCourseList { 
  data: any
}
export default class CanvasCourseList extends React.Component<any, IStateCanvasCourseList> {

  constructor(props :any){
    super(props)
    this.state = { 
      data: null
    }
  }

  componentDidMount(){
    Fetch.fetch("/api/canvas/courses").then(res =>  res.json().then(res =>  this.setState({data:  res})))
  }

  getOptions(){
    if (this.state.data != null) {
      let newOptions = []
      for (const course of this.state.data) {
        newOptions.push(<option key = {course["id"]} >{course["name"]}</option>) 
      }
      return newOptions;
    } else { 
      return [<option key = {"no-link"} >{"You have not linked Atelier to your canvas please do so the setting page."}</option>]
    }
  }


  
  render() {  
    return 	<LabeledInput label ="Canvas Course Link">
    <Form.Control as="select" custom>
      {this.getOptions()}
    </Form.Control>
  </LabeledInput>

  }
}