import React, { Component } from "react";

export default class ChatAreaComponent extends Component {
    render () {
        const { messages } = this.props;
        return <div className="chat-box">
            {messages.map(msg => {
              return <div className="message">{`${msg.sender}: ${msg.message}`}</div>;
            })}
          </div>;
    }
}