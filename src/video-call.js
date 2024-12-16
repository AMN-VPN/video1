class VideoCall {
    constructor() {
        this.localStream = null;
        this.peerConnection = null;
        this.currentConnection = null;
    }

    initializeButtons() {
        const startButton = document.getElementById('startVideoCall');
        const endButton = document.getElementById('endVideoCall');
        
        if(startButton) startButton.onclick = () => this.startCall();
        if(endButton) endButton.onclick = () => this.endCall();
    }

    async startCall() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = this.localStream;
            document.getElementById('videoContainer').style.display = 'flex';
            document.getElementById('startVideoCall').style.display = 'none';
            document.getElementById('endVideoCall').style.display = 'block';

            this.initializePeerConnection();

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            connections.forEach(conn => {
                if (conn.open) {
                    this.currentConnection = conn;
                    conn.send({
                        type: 'video-offer',
                        offer: this.peerConnection.localDescription
                    });
                }
            });

        } catch (error) {
            console.log('خطا در شروع تماس:', error);
        }
    }

    initializePeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: CONFIG.STUN_SERVERS
        });

        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.currentConnection) {
                this.currentConnection.send({
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };

        this.peerConnection.ontrack = (event) => {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo.srcObject !== event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];
            }
        };
    }

    async handleVideoOffer(offer, conn) {
        try {
            // اول چک می‌کنیم که آیا دوربین در دسترس هست
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');

            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: hasCamera ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                } : false,
                audio: hasAudio
            });

            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = this.localStream;
            document.getElementById('videoContainer').style.display = 'flex';

            this.initializePeerConnection();
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            conn.send({
                type: 'video-answer',
                answer: this.peerConnection.localDescription
            });

        } catch (error) {
            console.log('وضعیت دوربین و میکروفون را بررسی کنید');
            alert('لطفا دسترسی به دوربین و میکروفون را در مرورگر خود فعال کنید');
        }
    }
    async handleVideoAnswer(answer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.log('خطا در افزودن ICE candidate:', error);
            }
        }
    }

    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('startVideoCall').style.display = 'block';
        document.getElementById('endVideoCall').style.display = 'none';

        if (this.currentConnection) {
            this.currentConnection.send({ type: 'end-call' });
        }
    }
}

window.videoCall = new VideoCall();
