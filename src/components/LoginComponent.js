import React, { Component } from "react";
import { PORT_NUMBER, STUN_SERVER } from '../constants/index.js';

const iceConfig = {
    iceServers: [{ url: STUN_SERVER }]
};

const IP = '192.168.38.23';

// let webkitRTCPeerConnection;

export default class LoginComponent extends Component {

    state = {
        ownPeer: '',
        otherPeer: '',
        message: '',
        connectedUser: null,
        ownConnection: null,
        loggedIn: null,
        connectedTo: '',
        messages: []
    };
    connection = null;
    connectedUser = null;
    rtcConnection = null;
    dataChannel = null;

    componentDidMount () {
        const socketUrl = `wss://${IP}:${PORT_NUMBER}`;
        console.log('connecting socket address', socketUrl);
        this.connection = new WebSocket(socketUrl);

        this.applyListenersToSocket(this.connection);
    }

    applyListenersToSocket (connection) {
        //Respond to socket events
        connection.onmessage = (message) => {
            // console.log('Socket got message:', message.data);
            let data;

            try {
                data = JSON.parse(message.data);
            } catch (e) {
                console.error('Invalid JSON:', message.data);
                data = {};
            }

            switch (data.type) {
              case "login":
                this.onLogin(data.success);
                break;
              case "offer":
                this.onOffer(data.offer, data.name);
                break;
              case "answer":
                this.onAnswer(data.answer);
                break;
              case "candidate":
                this.onCandidate(data.candidate);
                break;
              case 'instantMessage':
                this.onInstantMessage(data.message);
                break;
              case "serverMessage":
                console.log("Server says:", data.message);
                break;
              default:
                console.error("You lose.");
                break;
            }
        };

        connection.onopen = () => {
            console.log('%cConnected socket', 'color: green');
        }

        connection.onerror = (err) => {
            console.log('%cError on socket connection', 'color: red');
        }

        connection.ondisconnected = () => {
            window.alert('Disconnected');
        };
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
        let otherUser = this.state.otherPeer;
        this.connectedUser = otherUser;

        if (otherUser.trim().length > 0) {
            //Create an offer if username exists
            this.rtcConnection.createOffer((offer) => {
                console.log('Creating RTC offer');
                this.send({ type: 'offer', offer: offer });
                this.rtcConnection.setLocalDescription(offer);
            }, err => window.alert('An error occured creating an offer', err));
        }
    }

    send = (message) => {
        if (this.connectedUser) {
            message.name = this.connectedUser;
        }

        this.connection.send(JSON.stringify(message));
    }

    onLogin (success) {
        if (!success) {
            window.alert('Username login failed.');
            return;
        }

        let rtcConnection = new RTCPeerConnection(iceConfig);

        this.rtcConnection = rtcConnection;
        console.log('Created peer connection object', rtcConnection);
        this.setState({ loggedIn: this.state.ownPeer });

        //Configure ICE handling and inform other connections through socket when it's found
        rtcConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this.send({
                    type: 'candidate',
                    candidate: e.candidate
                });
            }
        };

        //Establish data channel
        this.openDataChannel();
    }

    //For when user is being called
    onOffer (offer, name) {
        this.connectedUser = name;
        this.rtcConnection.setRemoteDescription(new RTCSessionDescription(offer));

        console.log('onOffer name', name);

        this.rtcConnection.createAnswer((answer) => {
            this.rtcConnection.setLocalDescription(answer);

            this.send({
                type: 'answer',
                answer: answer
            });

            this.setState({ connectedTo: name });
            this.rtcConnection.ondatachannel = e => this.setChannelListeners(e.channel);
        }, err => window.alert('Error in handling an offer', err));
    }

    //For when a local user's offer is accepted
    onAnswer (answer) {
        this.setState({ connectedTo: this.state.otherPeer });
        this.rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.rtcConnection.ondatachannel = e => this.setChannelListeners(e.channel);
    }

    onCandidate (candidate) {
        this.rtcConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    onInstantMessage (message) {
        window.alert(message);
    }

    handleMessage = () => {
        // this.send({
        //     type: 'instantMessage',
        //     message: this.state.message
        // });

        try {
            let messageObj = { sender: this.state.ownPeer, message: this.state.message };
            this.dataChannel.send(JSON.stringify(messageObj));
            this.displayMessage(messageObj);
            // console.log('Sending message thru', this.dataChannel);
        } catch (e) {
            console.error('Error sending thru data channel', e.message ? e.message : e);
        }
        this.setState({ message: '' });
    }

    openDataChannel () {
        let dataChannelOptions = { reliable: true };

        console.log('%cOpening data channel', 'color: green');

        this.dataChannel = this.rtcConnection.createDataChannel('rtcDataChannel', dataChannelOptions);

        this.setChannelListeners(this.dataChannel);
    }

    setChannelListeners = (dataChannel) => {
        dataChannel.onerror = err => {
          console.error("Data channel error", err);
        };

        dataChannel.onopen = e => {
          console.log("%cData channel opened", "color: green");
        };

        dataChannel.onmessage = e => {
            let messageObj = JSON.parse(e.data);
            this.displayMessage(messageObj);
        };
    }

    displayMessage (message) {
        let newMessages = this.state.messages.slice(0);
        newMessages.push(message);
        this.setState({ messages: newMessages });
    }

    render () {
        const { ownPeer, otherPeer, loggedIn, message, connectedTo, messages } = this.state;

        return <div className="login-form">
            {!loggedIn ? <div className="login-field">
                <input onChange={e => this.changeValue("ownPeer", e)} value={ownPeer} type="text" />
                <button onClick={this.handleLogin}>Login</button>
              </div> : <div>
                You are connected as {this.state.loggedIn} {connectedTo !== '' && `and connected to ${connectedTo}`}
              </div>}
              {loggedIn && <div>
                 {connectedTo !== '' ? (
                   <div className="login-field">
                    <div className='chat-box'>
                        {messages.map(msg => {
                            return <div className='message'>{`${msg.sender}: ${msg.message}`}</div>
                        })}
                    </div>
                     <input onChange={e => this.changeValue("message", e)} value={message} type="text" />
                     <button onClick={this.handleMessage}>Send</button>
                    </div>
                 ) : (
                     <div className="login-field">
                     <input onChange={e => this.changeValue("otherPeer", e)} value={otherPeer} type="text" />
                     <button onClick={this.handleConnect}>Connect</button>
                     </div>
                 )}
              </div>}
          </div>;
    }
}