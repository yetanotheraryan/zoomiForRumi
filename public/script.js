const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer()

const myVideo = document.createElement('video')
myVideo.setAttribute('autoplay', '');
myVideo.setAttribute('muted', '');
myVideo.setAttribute('playsinline', '');
myVideo.muted = true;

const peers={

}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream=>{
    addVideoStream(myVideo, stream);

    myPeer.on('call', call=>{
        call.answer(stream)
        const video = document.createElement('video')
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        call.on('stream', userVedioStream=>{
            addVideoStream(video, userVedioStream)
        })
    })

    socket.on('user-connected', userId =>{
        console.log("user connected: ", userId)
        connectToNewUser(userId, stream);
    })
})

socket.on("user-disconnected", userId=>{
    console.log(`user ${userId} disconnected`)
    if(peers[userId]){
        peers[userId].close();
    }

})
myPeer.on('open', (id)=>{
    socket.emit('join-room', ROOM_ID, id)
})

// socket.on('user-connected', userId =>{
//     console.log("user connected: ", userId)
// })


function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    videoGrid.append(video)
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    call.on('stream', userVideoStream =>{
        addVideoStream(video,userVideoStream);
    })
    call.on('close', ()=>{
        video.remove();
    })
    peers[userId] = call;
}
