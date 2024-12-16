class VideoCall {
    constructor(connection) {
        this.localStream = null;
        this.peerConnection = null;
        this.connection = connection;
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

            document.getElementById('localVideo').srcObject = this.localStream;
            document.getElementById('videoContainer').style.display = 'flex';
            document.getElementById('startVideoCall').style.display = 'none';
            document.getElementById('endVideoCall').style.display = 'block';

            this.createPeerConnection();

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.connection.send({
                type: 'video-offer',
                offer: this.peerConnection.localDescription
            });

        } catch (error) {
            console.log('خطا در شروع تماس:', error);
        }
    }

    createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: CONFIG.STUN_SERVERS
        });

        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.connection.send({
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };

        this.peerConnection.ontrack = (event) => {
            console.log('دریافت تراک از peer دیگر');
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        };
    }

    async handleVideoOffer(offer, conn) {
        this.connection = conn;
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            document.getElementById('localVideo').srcObject = this.localStream;
            document.getElementById('videoContainer').style.display = 'flex';

            this.createPeerConnection();
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.connection.send({
                type: 'video-answer',
                answer: this.peerConnection.localDescription
            });

        } catch (error) {
            console.log('خطا در پاسخ به تماس:', error);
        }
    }

    async handleVideoAnswer(answer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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
    }
}

window.videoCall = new VideoCall();
