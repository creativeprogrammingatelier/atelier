import React, { Component } from "react";
import AuthHelper from "../../helpers/AuthHelper";
import { withRouter, Redirect } from "react-router-dom";

class Login extends Component {
    state: { email: string, password: string, user: any, response: string, redirectToReferrer: boolean };
    props: any;
    constructor(props: any) {
        super(props)
        this.state = {
            email: '',
            password: '',
            user: {},
            response: "",
            redirectToReferrer: false
        };
    }


    handleInputChange = (event: { target: { value: any; name: any; }; }) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        })
    };

    onSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        AuthHelper.login(this.state.email, this.state.password, () => {
            this.props.onLogin('', this.state.email);
            this.setState({
                redirectToReferrer: true
            });
        }
        );

    };

    render() {
        if (this.state.redirectToReferrer) {
            return (
                <Redirect to="/roleview" />
            )
        }
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <h3>Login</h3>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={this.state.email}
                        onChange={this.handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={this.state.password}
                        onChange={this.handleInputChange}
                        required
                    />
                    <p>{this.state.response}</p>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }

}

export default Login;