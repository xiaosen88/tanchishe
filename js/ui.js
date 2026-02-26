export class UI {
    constructor() {
        this.startMenu = document.getElementById('startMenu');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.notification = document.getElementById('notification');

        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.highScoreDisplay = document.getElementById('highScore');

        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalHighScoreDisplay = document.getElementById('finalHighScore');

        this.muteBtn = document.getElementById('muteBtn');
        this.muteIcon = document.getElementById('muteIcon');

        this.notificationTimeout = null;
    }

    showStartScreen() {
        this.startMenu.style.display = 'flex';
        this.pauseMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
    }

    hideStartScreen() {
        this.startMenu.style.display = 'none';
    }

    showPauseScreen() {
        this.pauseMenu.style.display = 'flex';
    }

    hidePauseScreen() {
        this.pauseMenu.style.display = 'none';
    }

    showGameOverScreen(score, highScore) {
        this.finalScoreDisplay.textContent = score;
        this.finalHighScoreDisplay.textContent = highScore;
        this.gameOverMenu.style.display = 'flex';
    }

    hideGameOverScreen() {
        this.gameOverMenu.style.display = 'none';
    }

    updateScoreDisplay(score, level) {
        this.scoreDisplay.textContent = score;
        this.levelDisplay.textContent = level;
    }

    updateHighScoreDisplay(highScore) {
        this.highScoreDisplay.textContent = highScore;
    }

    showNotification(text) {
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        this.notification.textContent = text;
        this.notification.classList.remove('show');

        // 强制重排以重启动画
        void this.notification.offsetWidth;

        this.notification.classList.add('show');

        this.notificationTimeout = setTimeout(() => {
            this.notification.classList.remove('show');
        }, 2000);
    }

    updateMuteButton(muted) {
        this.muteIcon.textContent = muted ? '🔇' : '🔊';
    }

    bindStartButtons(callback) {
        const buttons = this.startMenu.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.getAttribute('data-difficulty');
                callback(difficulty);
            });
        });
    }

    bindRestartButton(callback) {
        document.getElementById('restartBtn').addEventListener('click', callback);
    }

    bindMenuButton(callback) {
        document.getElementById('menuBtn').addEventListener('click', callback);
    }

    bindMuteButton(callback) {
        this.muteBtn.addEventListener('click', callback);
    }
}
