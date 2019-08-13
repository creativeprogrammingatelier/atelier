import React, { Component } from "react";

class Logout extends Component {

    constructor(props) {
        super(props)
    }

    onSubmit = (event) => {
        localStorage.clear();
        fetch('/logout', {
            method: 'GET'
        }).then(res => {
            if (res.status === 200) {
                alert("Logged out")
            }
            else {

            }
        }).catch(err => {
            console.error(err);
            alert('Error logging in please try again');
        });
    };

    render() {
        return (
            <form onSubmit={this.onSubmit} >
                <input type="submit" value="Logout" />
            </form>
        );
    }

}

export default Logout;
