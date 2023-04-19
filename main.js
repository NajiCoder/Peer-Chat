let AppId = "Your App ID";

let token = null;

let uid = String(Math.floor(Math.random() * 1000000000));

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};
let init = async () => {
  client = await AgoraRTC.createInstance(AppId);
  await client.login(uid, token);

  channel = await client.createChannel("test");
  await channel.join();

  // handle whne a new user joins the channel
  channel.on("MemberJoined", handleUserJoined);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("user-1").srcObject = localStream;

  createOffer();
};

let handleUserJoined = async (MemberId) => {
  console.log("New user joined : ", MemberId);
};

let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  // Add the local stream to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Add the remote stream to the peer connection
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // Add the ICE candidate to the peer connection
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("New ICE candidate : ", event.candidate);
    }
  };

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  console.log("Offer : ", offer);
};

init();
