export const setChannelListeners = (dataChannel, callerComponent) => {
    dataChannel.onerror = err => {
        console.error("Data channel error", err);
    };

    dataChannel.onopen = e => {
        console.log("%cData channel opened", "color: green");
    };

    dataChannel.onmessage = e => {
        let messageObj = JSON.parse(e.data);
        callerComponent.displayMessage(messageObj);
    };
};

export const getUserMedia = () => {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    return navigator.getUserMedia;
}