import React, { Component } from "react";
import { PORT_NUMBER } from '../constants/index.js';

const iceConfig = {
    iceServers: [{ url: 'stun:stun.1.google.com:19302' }]
};

let webkitRTCPeerConnection;

export default class LoginComponent extends Component {

    state = {
        ownPeer: '',
        otherPeer: '',
        connectedUser: null,
        ownConnection: null
    };
    connection = null;

    componentDidMount () {
        const socketUrl = `ws://localhost:${PORT_NUMBER}`;
        console.log('connecting socket address', socketUrl);
        this.connection = new WebSocket(socketUrl);

        this.applyListenersToSocket(this.connection);
    }

    applyListenersToSocket (connection) {
        connection.onmessage = (message) => {
            console.log('Socket got message', message.data);
            let data;
            
            try {
                data = JSON.parse(message.data);
            } catch (e) {
                console.error('Invalid JSON:', message.data);
                data = {};
            }

            switch (data.type) {
                case 'login':
                    this.onLogin(data.success);
                    break;
                case 'offer':
                    this.onOffer(data.offer, data.name);
                    break;
                case 'answer':
                    this.onAnswer(data.answer);
                    break;
                case 'candidate':
                    this.onCandidate(data.candidate);
                    break;
                default:
                    console.error('You lose.');
                    break;
            }
        };

        connection.onopen = () => {
            console.log('%cConnected socket', 'color: green');
        }

        connection.onerror = (err) => {
            console.log('%cError on socket connection', 'color: red');
        }
    }

    changeValue = (value, e) => {
        // e.target.value;
        this.setState({ [value]: e.target.value });
    }

    handleLogin = () => {
        const { ownPeer } = this.state;

        if (ownPeer.trim().length > 0) {
            this.send({
                type: 'login',
                name: ownPeer
            })
        }
    }

    handleConnect = () => {

    }

    send = (message) => {
        if (this.state.connectedUser) {
            message.name = this.state.connectedUser;
        }

        this.connection.send(JSON.stringify(message));
    }

    onLogin (success) {
        if (!success) {
            window.alert('Username login failed.');
            return;
        }

        let rtcConnection = new webkitRTCPeerConnection(iceConfig);
        console.log('Created peer connection object', rtcConnection);

        //Configure ICE handling and inform other connections when it's found
        rtcConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this.send({
                    type: 'candidate',
                    candidate: e.candidate
                });
            }
        };
    }

    render () {
        const { ownPeer, otherPeer } = this.state;

        return <div className="login-form">
            <div className="login-field">
              <input onChange={e => this.changeValue("ownPeer", e)} value={ownPeer} type="text" />
              <button onClick={this.handleLogin}>Login</button>
            </div>
            <div className="login-field">
              <input onChange={e => this.changeValue("otherPeer", e)} value={otherPeer} type="text" />
              <button onClick={this.handleConnect}>Connect</button>
            </div>
          </div>;
    }
}