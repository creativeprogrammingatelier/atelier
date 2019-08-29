import React, { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
import { withRouter, Redirect } from "react-router-dom";

class Register extends Component {

    state: { email: string, password: string, passwordConfirmation: string, role: string, user: any, response: string, redirectToReferrer: boolean };
    props: any;
    constructor(props: any) {
        super(props)
        this.state = {
            email: '',
            password: '',
            passwordConfirmation: '',
            role: 'student',
            user: {},
            response: "",
            redirectToReferrer: false
        };
    }

    validateForm() {
        return (
          this.state.email.length > 0 &&
          this.state.password.length > 0 &&
          this.state.password === this.state.passwordConfirmation
        );
      }

    onSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        AuthHelper.register(this.state.email, this.state.password, this.state.role, () => {
            this.setState({
                redirectToReferrer: true
            });
        });
    };

    handleChange = (event: { target: { value: any; name: any; }; }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };


    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <h3>Sign up</h3>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    required
                />
                <input
                    type="passwordConfirmation"
                    name="passwordConfirmation"
                    placeholder="Confirm password"
                    value={this.state.passwordConfirmation}
                    onChange={this.handleChange}
                    required
                />
                <select name="role" value={this.state.role} onChange={this.handleChange}>
                    <option value="student">Student</option>
                    <option value="ta">Teaching Assistant</option>
                </select>                
                <p>{this.state.response}</p>
                <input type="submit" value="Submit" />
            </form>
        )
    }
}

export default Register;