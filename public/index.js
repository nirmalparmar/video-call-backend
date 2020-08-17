var socket = io.connect(window.location.origin); 

let userIdsDiv = document.querySelector('#userId');

let remoteSocket = '';

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

let pc = new RTCPeerConnection(configuration);

socket.on('add-user', handleAddUser);
socket.on('get-users', handleGetUsers);
socket.on('remove-user', handleRemoveUser);
socket.on('offer-made', handleOffer);
socket.on('answer-made', handleAnswer);
socket.on('new-ice-candidate', handleNewIcecandidate);


function handleAddUser(data){
    let node = document.createElement('button');
    node.setAttribute('id', data.userId);
    node.innerText = data.userId;
    userIdsDiv.appendChild(node);
    node.addEventListener('click', () => {
        callUser(data.userId);
    })
}

function handleGetUsers(data){
    // console.log(data);
    data.users.forEach(id => {
        let node = document.createElement('button');
        node.setAttribute('id', id);
        node.innerText = id;
        userIdsDiv.appendChild(node);
        node.addEventListener('click', () => {
            callUser(id);
        })
    })
}

function handleRemoveUser(id){
    let idNode = document.getElementById(id);
    userIdsDiv.removeChild(idNode);
}

async function createOffer(id){
    remoteSocket = id;
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    let payload = {
        offer:offer,
        to:id
    }
    socket.emit('make-offer', payload);
    addTrack();
}

function callUser(id){
    peerConnectionListener();
    createOffer(id);
}

async function handleOffer(data){
    console.log("offer received")
    remoteSocket = data.id;
    peerConnectionListener();
    let offer = new RTCSessionDescription(data.offer)
    await pc.setRemoteDescription(offer);
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    let payload = {
        answer:answer,
        to:data.id
    }
    socket.emit('make-answer', payload);
    addTrack();
}

async function handleAnswer(data){
    console.log("answer received");
    let answer = new RTCSessionDescription(data.answer);
    await pc.setRemoteDescription(answer);
    return;
}

function addTrack(){
    navigator.mediaDevices.getUserMedia({video: true, audio:true}).then(stream => {
        let localStream = stream;
        const localVideo = document.querySelector('#video-local');
        localVideo.srcObject = localStream;
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        })
    })
}

function handleRemoteStream(ev){
    console.log(ev.streams);
    let remoteVideo = document.querySelector('#video-remote');
    remoteVideo.srcObject = ev.streams[0];
}

function handleIcecandidate(ev){
    console.log('ice-candidate' + JSON.stringify(ev.candidate));
    if(ev.candidate){
        let payload = {
            candidate:ev.candidate,
            to:remoteSocket
        }
        socket.emit('ice-candidate', payload);
    }
}

function handleNewIcecandidate(data){
    console.log("new ice-candidate" + JSON.stringify(data.candidate));
    if(data.candidate){
        let candidate = new RTCIceCandidate(data.candidate);
        pc.addIceCandidate(candidate).then( res => {
            console.log("candidate added" + res);
        }).catch(e => {
            console.log(e);
        })
    }
}

function peerConnectionListener(){
    pc.addEventListener('icecandidate', handleIcecandidate);
    pc.addEventListener('track', handleRemoteStream);
}


// function setLocalMediaStream(){
//     navigator.mediaDevices.getUserMedia({video: true, audio: true}).then( stream => {
//         const localVideo = document.querySelector('#video-local');
//         localVideo.srcObject = stream;
//         stream.getTracks().forEach(track => {
//             pc.addTrack(track, stream);
//         });
//     })
// }


// setLocalMediaStream();

// // var pc = new peerConnection({
// //     iceServers: [{
// //         url:["stun:stun.services.mozilla.com",
// //             'stun:stun1.l.google.com:19302',
// //             'stun:stun2.l.google.com:19302',]
// //     }]
// // });

// // pc. = function (obj) {
// //     var vid = document.createElement('video');
// //     vid.setAttribute('class', 'video-small');
// //     vid.setAttribute('autoplay', 'autoplay');
// //     vid.setAttribute('id', 'video-small');
// //     document.getElementById('users-container').appendChild(vid);
// //     vid.srcObject = obj.stream;
// // }

// let remoteStream = new MediaStream();


// pc.addEventListener('track', async (event) => {
//     let remoteStr = remoteStream.addTrack(event.track, remoteStream);
//     const remoteVideo = document.querySelector('#video-remote');
//     remoteVideo.srcObject = remoteStr;
// });

// // navigator.getUserMedia({video: true, audio: true}, function (stream) {
// //     var video = document.querySelector('video');
// //     video.srcObject = stream;
// //     pc.addStream(stream);
// // }, error);


// socket.on('add-users', function (data) {
//     let userIdDiv = document.querySelector("#userId");
//     userIdDiv.appendChild(
//         document.createElement('ul').innerHTML = data.userId
//     );
//     let idBtn = document.querySelector('button');
//     idBtn.addEventListener('click', (e)=>{
//         let id = idBtn.innerHTML;
//         createOffer(id);
//     })
//     // createOffer(data.userId);
// });

// socket.on('remove-user', function (id) {
    
// });


// socket.on('offer-made', async (data) => {
//     await pc.setRemoteDescription(data.offer);
//     let answer = await pc.createAnswer();
//     setLocalMediaStream();
//     socket.emit('make-answer', {
//         answer:answer,
//         to:data.id
//     });
// });

// socket.on('answer-made', async (data) => {
//     await pc.setRemoteDescription(data.answer);
//     setLocalMediaStream();
// });

// async function createOffer(id) {
//     let offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit('make-offer', {
//         offer:offer,
//         to:id
//     })
// }

// function error(err) {
//     console.warn('Error', err);
// }
