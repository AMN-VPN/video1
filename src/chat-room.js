const db = new Dexie('voiceApp');
db.version(1).stores({
    voices: '++id, voiceId, blob, timestamp, roomCode, userEmail, userAvatar, userName'  // اضافه کردن userName
});

let peer = null;
let connections = [];
let currentRoom = null;

document.addEventListener('DOMContentLoaded', async () => {
    const roomCode = localStorage.getItem('currentRoomCode');
    const isJoining = window.location.search.includes('join');
    
    if (!roomCode) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('roomCodeDisplay').textContent = roomCode;
    currentRoom = roomCode;
    
    // اول اتصال را برقرار می‌کنیم
    initializePeer(roomCode, !isJoining);
    
    // سپس وویس‌ها را بازیابی می‌کنیم
    await loadExistingRecordings(roomCode);
    
    // تنظیم دکمه‌های ضبط صدا
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    const leaveButton = document.getElementById('leaveRoom');

    recordButton.onclick = () => voiceManager.startRecording();
    stopButton.onclick = () => voiceManager.stopRecording();
    
    leaveButton.onclick = () => {
        localStorage.removeItem('currentRoomCode');
        if(peer) {
            peer.destroy();
        }
        connections.forEach(conn => conn.close());
        window.location.href = 'index.html';
    };

    const startVideoCallBtn = document.getElementById('startVideoCall');
    const endVideoCallBtn = document.getElementById('endVideoCall');
    
    if(startVideoCallBtn && endVideoCallBtn) {
        startVideoCallBtn.onclick = () => {
            if(window.videoCall) {
                window.videoCall.startCall();
            }
        };
        
        endVideoCallBtn.onclick = () => {
            if(window.videoCall) {
                window.videoCall.endCall();
            }
        };
    }
});
function initializePeer(roomCode, isCreator) {
    const peerId = isCreator ? roomCode : `${roomCode}-${Date.now()}`;
    
    peer = new Peer(peerId, {
        config: { iceServers: CONFIG.STUN_SERVERS }
    });

    peer.on('open', id => {
        console.log('Peer connection established:', id);
        if (!isCreator) {
            const conn = peer.connect(roomCode);
            setupConnection(conn);
        }
    });

    peer.on('connection', conn => {
        setupConnection(conn);
    });
}

function setupConnection(conn) {
    if (!conn) return;
    
    connections = connections.filter(c => c.peer !== conn.peer);
    connections.push(conn);
    
    conn.on('open', async () => {
        console.log('Connection opened with:', conn.peer);
        await syncExistingMessages(conn);
    });

    const videoCall = new VideoCall();

    conn.on('data', async (data) => {
        if (data.type === 'video-offer') {
            await videoCall.handleVideoOffer(data.offer, conn);
        } 
        else if (data.type === 'video-answer') {
            await videoCall.handleVideoAnswer(data.answer);
        }
        else if (data.type === 'ice-candidate') {
            await videoCall.handleIceCandidate(data.candidate);
        }
        else if (data.type === 'end-call') {
            videoCall.endCall();
        }
        else if (data.type === 'audio') {
            const audioBlob = new Blob([data.audioData], { type: 'audio/webm' });
            displayRecording(
                URL.createObjectURL(audioBlob),
                true,
                data.timestamp,
                data.voiceId,
                data.userEmail,
                data.userAvatar,
                data.userName
            );
        }
    });
}
async function syncExistingMessages(conn) {
    const voices = await db.voices
        .where('roomCode')
        .equals(currentRoom)
        .toArray();
        
    for (let voice of voices) {
        const arrayBuffer = await voice.blob.arrayBuffer();
        conn.send({
            type: 'audio',
            audioData: arrayBuffer,
            timestamp: voice.timestamp,
            voiceId: voice.voiceId,
            userEmail: voice.userEmail
        });
    }
}

async function loadExistingRecordings(roomCode) {
    console.log('Loading recordings for room:', roomCode);
    const recordings = await db.voices
        .where('roomCode')
        .equals(roomCode)
        .reverse()
        .toArray();
    
    document.getElementById('recordings').innerHTML = '';
    
    recordings.forEach(recording => {
        const isCurrentUser = recording.userEmail === localStorage.getItem('userEmail');
        const userAvatar = isCurrentUser ? 
            localStorage.getItem('userAvatar') : 
            recording.userAvatar || defaultAvatar;

        displayRecording(
            URL.createObjectURL(recording.blob),
            !isCurrentUser,
            recording.timestamp,
            recording.voiceId,
            recording.userEmail,
            userAvatar
        );
    });
}

function displayRecording(audioUrl, isRemote, timestamp, voiceId, userEmail, userAvatar, userName) {
    const recordingItem = document.createElement('div');
    recordingItem.className = 'recording-item';
    recordingItem.setAttribute('data-voice-id', voiceId);

    const avatar = document.createElement('img');
    avatar.className = 'recording-avatar';
    avatar.src = userAvatar || defaultAvatar;
    avatar.alt = 'تصویر پروفایل';

    const content = document.createElement('div');
    content.className = 'recording-content';

    const audio = document.createElement('audio');
    audio.src = audioUrl;
    audio.controls = true;

    const info = document.createElement('div');
    info.innerHTML = `
        <p>${isRemote ? 'دریافتی از: ' : 'ضبط شده توسط: '}<strong>${userName}</strong></p>
        <small>${new Date(timestamp).toLocaleString('fa-IR')}</small>
    `;

    content.appendChild(audio);
    content.appendChild(info);
    
    recordingItem.appendChild(avatar);
    recordingItem.appendChild(content);
    
    document.getElementById('recordings').insertBefore(recordingItem, document.getElementById('recordings').firstChild);
}