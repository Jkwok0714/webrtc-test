import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import LoginComponent from './components/LoginComponent.js';

class App extends Component {
  
  state = {
    message: null,
    stream: null,
    loggedIn: false
  };

  stream = null;

  componentDidMount () {
    //Get the video stream. This will only work if the app is hosted by a server, for security reasons
    //  With NPM start with webpack watch, a socket is created
    this.getVideoStream();
  }

  changeLoginStatus = (status) => {
    this.setState({ loggedIn: status });
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

  handleDemoButtons = (action) => {
    switch (action) {
      case 'getAudioTracks':
        this.setMessage(this.stream.getAudioTracks());
        break;
      case 'getVideoTracks':
        this.setMessage(this.stream.getVideoTracks());
        break;
      case 'getTracks':
        this.setMessage(this.stream.getTracks());
        break;
      case 'popAudioTrack':
        this.stream.removeTrack(this.stream.getAudioTracks()[0]);
        break;
      case 'popVideoTrack':
        this.stream.removeTrack(this.stream.getVideoTracks()[0]);
        break;
      case 'printStreamObj':
        console.log('STREAM OBJECT', this.stream);
        this.setMessage('Printed to console');
        break;
      default:
        console.log('Unsupported button function', action);
        break;
    }
  }

  setMessage (obj) {
    this.setState({ message: typeof obj === 'string' ? obj : JSON.stringify(obj, ['label', 'enabled', 'kind']) });
  }

  getVideoStream = () => {
    //Set local getUserMedia object
    this.getUserMedia();

    //Get webcam audio and video
    navigator.getUserMedia({
        video: {
          mandatory: {
            maxWidth: 800,
            maxHeight: 600
          }
        },
        audio: true
      }, (stream) => {
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
        <LoginComponent loginChange={this.changeLoginStatus} />
        {!this.state.loggedIn && <div>
        <div className='video-container'>
          <video ref="videoTag" autoPlay />
        </div>
        <div className="buttons-area">
          HAS USER MEDIA: {"" + this.hasUserMedia()}
          <br />
          <button onClick={() => this.handleDemoButtons('getAudioTracks')}>Show Audio Tracks</button>
          <button onClick={() => this.handleDemoButtons('getVideoTracks')}>Show Video Tracks</button>
          <button onClick={() => this.handleDemoButtons('getTracks')}>Show All Tracks</button>
          <button onClick={() => this.handleDemoButtons('popAudioTrack')}>Pop Audio Tracks</button>
          <button onClick={() => this.handleDemoButtons('popVideoTrack')}>Pop Video Tracks</button>
          <button onClick={() => this.handleDemoButtons('printStreamObj')}>Print Stream Obj to Console</button>
          <button onClick={this.getVideoStream}>Get Video Stream</button>
        </div>
        <div>{message ? message : "---"}</div>
        </div>}
      </div>;
  }
}

export default App;
