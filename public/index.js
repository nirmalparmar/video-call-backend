// const io = require('socket.io-client');
// const socket = io.Socket('http://localhost:5000');

// const configuration = {
//     iceServers: [{
//         url: "stun:stun.services.mozilla.com"
//     }]
// }

// let pc = new RTCPeerConnection(configuration);




var socket = io.connect(window.location.origin); 
const configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ]
};
var answersFrom = {}, offer;
let pc = new RTCPeerConnection(configuration);

function setLocalMediaStream(){
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then( stream => {
        const localVideo = document.querySelector('#video-local');
        localVideo.srcObject = stream;
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });
    })
}




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

let remoteStream = new MediaStream();


pc.addEventListener('track', async (event) => {
    let remoteStr = remoteStream.addTrack(event.track, remoteStream);
    const remoteVideo = document.querySelector('#video-remote');
    remoteVideo.srcObject = remoteStr;
});

// navigator.getUserMedia({video: true, audio: true}, function (stream) {
//     var video = document.querySelector('video');
//     video.srcObject = stream;
//     pc.addStream(stream);
// }, error);


socket.on('add-users', function (data) {
    let userIdDiv = document.querySelector("#userId");
    userIdDiv.appendChild(
        document.createElement('ul').innerHTML = data.userId
    );
    let idBtn = document.querySelector('button');
    idBtn.addEventListener('click', (e)=>{
        let id = idBtn.innerHTML;
        createOffer(id);
    })
    // createOffer(data.userId);
});

socket.on('remove-user', function (id) {
    
});


socket.on('offer-made', async (data) => {
    await pc.setRemoteDescription(data.offer);
    let answer = await pc.createAnswer();
    setLocalMediaStream();
    socket.emit('make-answer', {
        answer:answer,
        to:data.id
    });
});

socket.on('answer-made', async (data) => {
    await pc.setRemoteDescription(data.answer);
    setLocalMediaStream();
});

async function createOffer(id) {
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('make-offer', {
        offer:offer,
        to:id
    })
}

function error(err) {
    console.warn('Error', err);
}
