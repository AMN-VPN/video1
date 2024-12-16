class SettingsManager {
    constructor() {
        this.initializeSettings();
        this.bindEvents();
    }

    initializeSettings() {
        // نمایش نام کاربری فعلی
        const userName = localStorage.getItem('userName') || '';
        const userNameInput = document.getElementById('userNameInput');
        if (userNameInput) {
            userNameInput.value = userName;
        }
    }

    bindEvents() {
        const saveUserNameBtn = document.getElementById('saveUserNameBtn');
        if (saveUserNameBtn) {
            saveUserNameBtn.onclick = () => {
                const userNameInput = document.getElementById('userNameInput');
                const newUserName = userNameInput.value.trim();
                
                if (newUserName) {
                    localStorage.setItem('userName', newUserName);
                    // بروزرسانی نام در پروفایل
                    const profileName = document.getElementById('profileName');
                    if (profileName) {
                        profileName.textContent = newUserName;
                    }
                    alert('نام کاربری با موفقیت تغییر کرد');
                } else {
                    alert('لطفا یک نام معتبر وارد کنید');
                }
            };
        }

        const accountSettings = document.getElementById('accountSettings');
        if (accountSettings) {
            accountSettings.onclick = () => {
                const mainContent = document.getElementById('mainContent');
                const settingsPanel = document.getElementById('accountSettingsPanel');
                const profileSection = document.getElementById('profileSection');

                if (mainContent && settingsPanel && profileSection) {
                    mainContent.style.display = 'none';
                    profileSection.style.display = 'none';
                    settingsPanel.style.display = 'flex';
                    settingsPanel.style.transform = 'translateX(0)';
                }
            };
        }
        
        // اضافه کردن بقیه event listeners با بررسی وجود المان‌ها
        document.querySelectorAll('.back-button').forEach(btn => {
            btn.onclick = () => {
                const settingsPanel = document.getElementById('accountSettingsPanel');
                const profileSection = document.getElementById('profileSection');
                
                if (settingsPanel && profileSection) {
                    settingsPanel.style.transform = 'translateX(100%)';
                    settingsPanel.style.display = 'none';
                    profileSection.style.display = 'flex';
                }
            };
        });

        const backToMainChat = document.getElementById('backToMainChat');
        if (backToMainChat) {
            backToMainChat.onclick = () => {
                const profileSection = document.getElementById('profileSection');
                const mainContent = document.getElementById('mainContent');
                
                if (profileSection && mainContent) {
                    profileSection.style.display = 'none';
                    mainContent.style.display = 'block';
                }
            };
        }

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.onclick = () => {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('currentRoomCode');
                window.location.href = 'index.html';
            };
        }

        const backToProfileBtn = document.getElementById('backToProfile');
        if (backToProfileBtn) {
            backToProfileBtn.onclick = () => {
                const settingsPanel = document.getElementById('accountSettingsPanel');
                const profileSection = document.getElementById('profileSection');
                
                if (settingsPanel && profileSection) {
                    settingsPanel.style.transform = 'translateX(100%)';
                    settingsPanel.style.display = 'none';
                    profileSection.style.display = 'flex';
                }
            };
        }
    }

    loadAccountSettings() {
        const displayNameInput = document.getElementById('displayNameInput');
        const accountTypeSelect = document.getElementById('accountTypeSelect');
        
        if (displayNameInput) {
            displayNameInput.value = localStorage.getItem('displayName') || '';
        }
        
        if (accountTypeSelect) {
            accountTypeSelect.value = localStorage.getItem('accountType') || 'standard';
        }
        
        console.log('Account settings loaded successfully');
    }

    showChatSettings() {
        const panel = document.getElementById('chatSettingsPanel');
        if (panel) {
            panel.style.display = 'block';
            panel.classList.add('active');
            this.currentPanel = panel;
        }
    }

    showPrivacySettings() {
        const panel = document.getElementById('privacySettingsPanel');
        if (panel) {
            panel.style.display = 'block';
            panel.classList.add('active');
            this.currentPanel = panel;
        }
    }

    hideCurrentPanel() {
        if (this.currentPanel) {
            this.currentPanel.classList.remove('active');
            this.currentPanel.style.display = 'none';
            this.currentPanel = null;
        }
    }

    saveSetting(key, value) {
        localStorage.setItem(key, value);
        console.log(`Setting saved: ${key} = ${value}`);
    }
}
// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});