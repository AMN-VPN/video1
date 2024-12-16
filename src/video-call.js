class VideoCall {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
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
            
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // اضافه کردن مسیریاب‌های ICE
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    connections.forEach(conn => {
                        conn.send({
                            type: 'ice-candidate',
                            candidate: event.candidate
                        });
                    });
                }
            };

            // نمایش استریم دریافتی
            this.peerConnection.ontrack = (event) => {
                document.getElementById('remoteVideo').srcObject = event.streams[0];
            };

            // اضافه کردن تراک‌های محلی
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            connections.forEach(conn => {
                conn.send({
                    type: 'video-offer',
                    offer: offer
                });
            });

        } catch (error) {
            console.error('خطا در شروع تماس:', error);
        }
    }

    async handleVideoOffer(offer, conn) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            document.getElementById('localVideo').srcObject = this.localStream;
            document.getElementById('videoContainer').style.display = 'flex';

            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    conn.send({
                        type: 'ice-candidate',
                        candidate: event.candidate
                    });
                }
            };

            this.peerConnection.ontrack = (event) => {
                document.getElementById('remoteVideo').srcObject = event.streams[0];
            };

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            conn.send({
                type: 'video-answer',
                answer: answer
            });

        } catch (error) {
            console.error('خطا در پاسخ به تماس:', error);
        }
    }

    async handleVideoAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(answer)
        } catch (error) {
            console.error('خطا در دریافت پاسخ تماس:', error)
        }
    }

    async handleIceCandidate(candidate) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('خطا در افزودن ICE candidate:', error);
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

        connections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'end-call'
                });
            }
        });
    }
}
// ساخت یک نمونه گلوبال
window.videoCall = new VideoCall();const videoCall = new VideoCall();