class ProfileManager {
    constructor() {
        this.defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0xODAsMTgwYzAtNDQtNDAtODAtODAtODBzLTgwLDM2LTgwLDgwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
        this.initializeProfile();
    }

    initializeProfile() {
        document.addEventListener('DOMContentLoaded', () => {
            const openProfileBtn = document.getElementById('openProfileBtn');
            if (openProfileBtn) {
                openProfileBtn.onclick = () => {
                    const mainContent = document.getElementById('mainContent');
                    const profileSection = document.getElementById('profileSection');
                    
                    if (mainContent && profileSection) {
                        mainContent.style.display = 'none';
                        profileSection.style.display = 'flex';
                    }
                };
            }

            this.loadUserInfo();
            this.bindProfileEvents();
        });
    }

    loadUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        const userName = localStorage.getItem('userName') || userEmail.split('@')[0];
        const avatar = localStorage.getItem('userAvatar') || this.defaultAvatar;

        const elements = {
            profileName: document.getElementById('profileName'),
            profileEmail: document.getElementById('profileEmail'),
            profileAvatar: document.getElementById('profileAvatar')
        };

        if (elements.profileName) elements.profileName.textContent = userName;
        if (elements.profileEmail) elements.profileEmail.textContent = userEmail;
        if (elements.profileAvatar) elements.profileAvatar.src = avatar;
    }

    bindProfileEvents() {
        const backToMainChat = document.getElementById('backToMainChat');
        if (backToMainChat) {
            backToMainChat.onclick = () => {
                document.getElementById('profileSection').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
            };
        }
    }

    handleAvatarChange() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imageUrl = reader.result;
                    document.getElementById('profileAvatar').src = imageUrl;
                    localStorage.setItem('userAvatar', imageUrl);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    async processAndStoreImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    initializeProfile() {
        document.addEventListener('DOMContentLoaded', () => {
            const changeAvatarBtn = document.getElementById('changeAvatarBtn');
            if (changeAvatarBtn) {
                changeAvatarBtn.onclick = this.handleAvatarChange.bind(this);
            }

            const openProfileBtn = document.getElementById('openProfileBtn');
            if (openProfileBtn) {
                openProfileBtn.onclick = () => {
                    const mainContent = document.getElementById('mainContent');
                    const profileSection = document.getElementById('profileSection');
                    
                    if (mainContent && profileSection) {
                        mainContent.style.display = 'none';
                        profileSection.style.display = 'flex';
                    }
                };
            }

            this.loadUserInfo();
            this.bindProfileEvents();
        });
    }}

// Initialize
new ProfileManager();