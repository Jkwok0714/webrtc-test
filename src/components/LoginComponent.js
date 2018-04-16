import React, { Component } from "react";

export default class LoginComponent extends Component {
    state = {
        ownPeer: '',
        otherPeer: ''
    }
    
    render () {
        return (
            <div className='login-form'>
            Here is the login form
            </div>
        );
    }
}