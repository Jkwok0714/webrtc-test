import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import LoginComponent from './components/LoginComponent.js';

class App extends Component {
  
  state = {
    message: null,
    stream: null
  };

  stream = null;

  componentDidMount () {
    //Get the video stream. This will only work if the app is hosted by a server, for security reasons
    //  With NPM start with webpack watch, a socket is created
    this.getVideoStream();
  }

  hasUserMedia () {
    //Checks if Web RTC is supported, if getUserMedia exists
    let result = !!this.getUserMedia();
    if (!result) this.setMessage('WebRTC not supported on this browser');
    return result;
  }

  getUserMedia () {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    return navigator.getUserMedia;
  }

  getAudioTracks = () => {
    // console.log('stream', this.stream);
    this.setMessage(this.stream.getAudioTracks());
  }

  getVideoTracks = () => {
    this.setMessage(this.stream.getVideoTracks());
  }

  getTracks = () => {
    this.setMessage(this.stream.getTracks());
  }

  popAudioTrack = () => {
    this.stream.removeTrack(this.stream.getAudioTracks()[0]);
  }

  popVideoTrack = () => {
    this.stream.removeTrack(this.stream.getVideoTracks()[0]);
  }

  setMessage (obj) {
    this.setState({ message: typeof obj === 'string' ? obj : JSON.stringify(obj, ['label', 'enabled', 'kind']) });
  }

  printStreamObj = () => {
    console.log('STREAM OBJECT', this.stream);
    this.setMessage('Printed to console');
  }

  getVideoStream = () => {
    //Set local getUserMedia object
    this.getUserMedia();

    //Get webcam audio and video
    navigator.getUserMedia({ video: true, audio: true }, (stream) => {
      //Store the stream so we can use it
      this.stream = stream;

      //Assign returned video stream to DOM object
      let node = ReactDOM.findDOMNode(this.refs.videoTag);
      // node.src = window.URL.createObjectURL(stream);
      node.srcObject = stream;
    }, (err) => console.error('Error getting stream', err));
  }

  render() {
    const { message } = this.state;

    return <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to WabRTC</h1>
        </header>
        <div className='video-container'>
          <video ref="videoTag" autoPlay />
        </div>
        <div className="buttons-area">
          HAS USER MEDIA: {"" + this.hasUserMedia()}
          <br />
          <button onClick={this.getAudioTracks}>Show Audio Tracks</button>
          <button onClick={this.getVideoTracks}>Show Video Tracks</button>
          <button onClick={this.getTracks}>Show All Tracks</button>
          <button onClick={this.popAudioTrack}>Pop Audio Tracks</button>
          <button onClick={this.popVideoTrack}>Pop Video Tracks</button>
          <button onClick={this.printStreamObj}>Print Stream Obj to Console</button>
          <button onClick={this.getVideoStream}>Get Video Stream</button>
        </div>
        <div>{message ? message : "---"}</div>
        <LoginComponent />
      </div>;
  }
}

export default App;
