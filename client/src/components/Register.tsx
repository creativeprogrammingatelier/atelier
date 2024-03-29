import React, {Component} from "react";
import {Redirect, Link} from "react-router-dom";
import {User} from "../../../models/api/User";
import {Form} from "react-bootstrap";

/**
 * Register class to handler registration of new users.
 */
class Register extends Component {

    state: {email: string, password: string, passwordConfirmation: string, role: string, user: User | null, response: string, redirectToReferrer: boolean};

    /**
     * Constructor initializes all state variables.
     */
    constructor(props: Record<string, never>) {
        super(props);
        this.state = {
            email: "",
            password: "",
            passwordConfirmation: "",
            role: "student",
            user: null,
            response: "",
            redirectToReferrer: false
        };
    }

    /**
    * Validation for the user input; Email length,
    * password length and password confirmation
    */
    validateForm() {
        return (
            this.state.email.length > 0 &&
            this.state.password.length > 0 &&
            this.state.password === this.state.passwordConfirmation
        );
    }

    /**
     * Method handling submission of new registration, if the input is valid registration goes through
     * if not then method is cut prematurely.
     */
    onSubmit = (event: {preventDefault: () => void;}) => {
        event.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        // TODO: Built-in authentication is not supported at the moment
        // AuthHelper.register(this.state.email, this.state.password, this.state.role, () => {
        //     this.setState({
        //         redirectToReferrer: true
        //     });
        //     this.props.onLogin(this.state.email);
        // }, () => alert('Registeration has failed, Do you already have an account ? '));
    };

    /**
     * Handle change within the input field.
     */
    handleChange = (event: {target: {value: string; name: string;};}) => {
        const {value, name} = event.target;
        this.setState({
            [name]: value
        });
    };

    /**
     * Renders registration form.
     */
    render() {
        if (this.state.redirectToReferrer) {
            return (
                <Redirect to="/roleview"/>
            );
        }
        return (
            <div className="center-form-container">
                <h3>Registration form</h3>
                <div className="form-container">
                    <Form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={this.state.email}
                                onChange={this.handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={this.state.password}
                                onChange={this.handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="password"
                                name="passwordConfirmation"
                                placeholder="Confirm password"
                                value={this.state.passwordConfirmation}
                                onChange={this.handleChange}
                                required
                            />
                        </div>
                        <p>{this.state.response}</p>
                        <div className="form-submit">
                            <ul>
                                <li>
                                    <input className="btn btn-primary" type="submit" value="Register"/>
                                </li>
                                <li>
                                    <React.Fragment>
                                        <li className="nav-item"><Link className="nav-link" to="/login">Login</Link>
                                        </li>
                                    </React.Fragment>
                                </li>
                            </ul>
                        </div>
                    </Form>
                </div>
            </div>
        // <div>
        //     <div className="row justify-content-md-center">
        //         <div className="col col-md-8 offset-md-2">
        //             <form onSubmit={this.onSubmit}>
        //                 <div className="form-group">
        //                     <input
        //                         className="form-control"
        //                         type="email"
        //                         name="email"
        //                         placeholder="Email"
        //                         value={this.state.email}
        //                         onChange={this.handleChange}
        //                         required
        //                     />
        //                 </div>
        //                 <div className="form-group">
        //                     <input
        //                         className="form-control"
        //                         type="password"
        //                         name="password"
        //                         placeholder="Password"
        //                         value={this.state.password}
        //                         onChange={this.handleChange}
        //                         required
        //                     />
        //                 </div>
        //                 <div className="form-group">
        //                     <input
        //                         className="form-control"
        //                         type="password"
        //                         name="passwordConfirmation"
        //                         placeholder="Confirm password"
        //                         value={this.state.passwordConfirmation}
        //                         onChange={this.handleChange}
        //                         required
        //                     />
        //                 </div>
        //                 <div className="form-group">
        //                     <select className="form-control" name="role" value={this.state.role} onChange={this.handleChange}>
        //                         <option value="student">Student</option>
        //                         <option value="teacher">Teaching Assistant</option>
        //                     </select>
        //                 </div>
        //                 <p>{this.state.response}</p>
        //                 <div className="form-submit">
        //                         <ul>
        //                             <li>
        //                                 <input className="btn btn-primary" type="submit" value="Register" />
        //                             </li>
        //                             <li>
        //                                 <React.Fragment>
        //                                     <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
        //                                 </React.Fragment>
        //                             </li>
        //                         </ul>
        //                     </div>
        //             </form>
        //         </div>
        //     </div>
        // </div>
        );
    }
}

export default Register;
