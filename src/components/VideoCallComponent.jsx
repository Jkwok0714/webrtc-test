import React, { Component } from "react";
import * as ReactDOM from 'react-dom';

export default class VideoChatComponent extends Component {
    componentDidMount () {
        let node = ReactDOM.findDOMNode(this.refs.localVideo);
        node.srcObject = this.props.localStream;
    }

    componentWillReceiveProps (nextProps) {
        if ((!this.props.localStream && nextProps.localStream) || (nextProps.localStream && nextProps.localStream.id !== this.props.localStream.id)) {
            console.log('Setting local stream', nextProps.localStream);
            let node = ReactDOM.findDOMNode(this.refs.localVideo);
            node.srcObject = nextProps.localStream;
        }
        if ((!this.props.remoteStream && nextProps.remoteStream) || (nextProps.remoteStream && nextProps.remoteStream.id !== this.props.remoteStream.id)) {
          console.log("Setting remote stream");
          let node = ReactDOM.findDOMNode(this.refs.remoteVideo);
          node.srcObject = nextProps.remoteStream;
        }
    }

    render () {
        // const { localStream, remoteStream } = this.props;
        return (
            <div className='video-chat-wrapper'>
                <video ref='remoteVideo' muted className='remote-video' autoPlay></video>
                <video ref='localVideo' className='local-video' autoPlay></video>
            </div>
        );
    }
};