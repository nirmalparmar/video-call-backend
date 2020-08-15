// const io = require('socket.io-client');
// const socket = io.Socket('http://localhost:5000');

// const configuration = {
//     iceServers: [{
//         url: "stun:stun.services.mozilla.com"
//     }]
// }

// let pc = new RTCPeerConnection(configuration);




var socket = io.connect(window.location.origin); 

var answersFrom = {}, offer;
let pc = new RTCPeerConnection({
    iceServers: [{
        url:['stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',]
    }]
});

let localStream = navigator.getUserMedia({video: true, audio: true})
const localVideo = document.getElementsByClassName('video-local');
localVideo.srcObject = remoteStream;

localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
});
// var pc = new peerConnection({
//     iceServers: [{
//         url:["stun:stun.services.mozilla.com",
//             'stun:stun1.l.google.com:19302',
//             'stun:stun2.l.google.com:19302',]
//     }]
// });

// pc. = function (obj) {
//     var vid = document.createElement('video');
//     vid.setAttribute('class', 'video-small');
//     vid.setAttribute('autoplay', 'autoplay');
//     vid.setAttribute('id', 'video-small');
//     document.getElementById('users-container').appendChild(vid);
//     vid.srcObject = obj.stream;
// }

const remoteStream = MediaStream();
const remoteVideo = document.getElementsByClassName('video-remote');
remoteVideo.srcObject = remoteStream;

pc.addEventListener('track', async (event) => {
    remoteStream.addTrack(event.track, remoteStream);
});

// navigator.getUserMedia({video: true, audio: true}, function (stream) {
//     var video = document.querySelector('video');
//     video.srcObject = stream;
//     pc.addStream(stream);
// }, error);


socket.on('add-users', function (data) {
    for (var i = 0; i < data.users.length; i++) {
            id = data.users[i];
            createOffer(id);
    }
});

socket.on('remove-user', function (id) {
    
});


socket.on('offer-made', function (data) {
    offer = data.offer;

    pc.setRemoteDescription(data.offer , function () {
        pc.createAnswer(function (answer) {
            pc.setLocalDescription(new sessionDescription(answer), function () {
                socket.emit('make-answer', {
                    answer: answer,
                    to: data.id
                });
            }, error);
        }, error);
    }, error);

});

socket.on('answer-made', function (data) {
    pc.setRemoteDescription(data.answer, function () {
        // document.getElementById(data.socket).setAttribute('class', 'active');
        if (!answersFrom[data.socket]) {
            createOffer(data.socket);
            answersFrom[data.socket] = true;
        }
    }, error);
});

function createOffer(id) {
    pc.createOffer(function (offer) {
        pc.setLocalDescription(offer, function () {
            socket.emit('make-offer', {
                offer: offer,
                to: id
            });
        }, error);
    }, error);
}

function error(err) {
    console.warn('Error', err);
}
