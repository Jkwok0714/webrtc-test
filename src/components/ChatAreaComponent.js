import React, { Component } from "react";
import * as ReactDOM from 'react-dom';

export default class ChatAreaComponent extends Component {
    componentDidUpdate () {
        let node = ReactDOM.findDOMNode(this.refs.chatBox);

        node.scrollTop = node.scrollHeight;
    }

    render () {
        const { messages } = this.props;
        return <div ref='chatBox' className="chat-box">
            {messages.map(msg => {
              return <div className="message">{`${msg.sender}: ${msg.message}`}</div>;
            })}
          </div>;
    }
}