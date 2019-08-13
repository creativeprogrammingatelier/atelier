import React, { Component } from "react";

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: ''
        };
    }


    handleInputChange = (event) => {
        const { value, name } = event.target;
        this.state({
            [name]: value
        })
    };

    onSubmit = (event) => {
        event.preventDefault();
        //Coming soon
    };

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <h1>Login</h1>
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
                <input type="submit" value="Submit" />
            </form>
        );
    }

}

export default Login;
