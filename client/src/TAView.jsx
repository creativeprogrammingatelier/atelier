import React, { Component } from "react";
import axios from 'axios';


class TAView extends Component {
    constructor() {
        super()
        axios.get('/secret').then(function (response) {
            console.log(response);
        });
    }
    componentWillMount() {
        axios.get('/secret').then(function (response) {
            console.log(response);
        });
    }
    render() {
        return (
            <div>
                <h2>Welcome, TA</h2>
            </div>
        )
    }
}

export default TAView;