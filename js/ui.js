export class UI {
    constructor() {
        this.startMenu = document.getElementById('startMenu');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.leaderboardMenu = document.getElementById('leaderboardMenu');
        this.statsMenu = document.getElementById('statsMenu');
        this.notification = document.getElementById('notification');

        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.highScoreDisplay = document.getElementById('highScore');

        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalHighScoreDisplay = document.getElementById('finalHighScore');

        this.leaderboardList = document.getElementById('leaderboardList');
        this.statsList = document.getElementById('statsList');

        this.muteBtn = document.getElementById('muteBtn');
        this.muteIcon = document.getElementById('muteIcon');

        this.notificationTimeout = null;
    }

    showStartScreen() {
        this.startMenu.style.display = 'flex';
        this.pauseMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.leaderboardMenu.style.display = 'none';
        this.statsMenu.style.display = 'none';
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

    showLeaderboard(leaderboard) {
        this.leaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            this.leaderboardList.innerHTML = '<div class="stats-empty">暂无记录</div>';
        } else {
            leaderboard.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                
                if (index === 0) item.classList.add('top1');
                else if (index === 1) item.classList.add('top2');
                else if (index === 2) item.classList.add('top3');
                
                const difficultyName = this.getDifficultyName(entry.difficulty);
                const formattedDate = this.formatDate(entry.date);
                
                item.innerHTML = `
                    <div class="leaderboard-rank">#${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-score">${entry.score} 分</div>
                        <div class="leaderboard-difficulty">${difficultyName} - 等级 ${entry.level}</div>
                    </div>
                    <div class="leaderboard-date">${formattedDate}</div>
                `;
                
                this.leaderboardList.appendChild(item);
            });
        }
        
        this.leaderboardMenu.style.display = 'flex';
    }

    hideLeaderboard() {
        this.leaderboardMenu.style.display = 'none';
    }

    showStats(stats) {
        this.statsList.innerHTML = '';
        
        if (stats.totalGames === 0) {
            this.statsList.innerHTML = '<div class="stats-empty">暂无统计数据</div>';
        } else {
            const avgScore = Math.floor(stats.totalScore / stats.totalGames);
            
            const statsData = [
                { label: '总游戏次数', value: stats.totalGames },
                { label: '总得分', value: stats.totalScore },
                { label: '平均分', value: avgScore },
                { label: '吃掉的食物', value: stats.totalFoodEaten },
                { label: '最高等级', value: stats.maxLevel },
                { label: '简单最高分', value: stats.EASYHighScore },
                { label: '普通最高分', value: stats.NORMALHighScore },
                { label: '困难最高分', value: stats.HARDHighScore }
            ];
            
            statsData.forEach(stat => {
                const item = document.createElement('div');
                item.className = 'stats-item';
                item.innerHTML = `
                    <div class="stats-label">${stat.label}</div>
                    <div class="stats-value">${stat.value}</div>
                `;
                this.statsList.appendChild(item);
            });
        }
        
        this.statsMenu.style.display = 'flex';
    }

    hideStats() {
        this.statsMenu.style.display = 'none';
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

    formatDate(dateString) {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${month}-${day} ${hours}:${minutes}`;
    }

    getDifficultyName(difficulty) {
        const names = {
            'EASY': '简单',
            'NORMAL': '普通',
            'HARD': '困难'
        };
        return names[difficulty] || difficulty;
    }

    bindStartButtons(callback) {
        const buttons = this.startMenu.querySelectorAll('.menu-btn[data-difficulty]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.getAttribute('data-difficulty');
                callback(difficulty);
            });
        });
    }

    bindLeaderboardButton(callback) {
        document.getElementById('showLeaderboardBtn').addEventListener('click', callback);
    }

    bindStatsButton(callback) {
        document.getElementById('showStatsBtn').addEventListener('click', callback);
    }

    bindCloseLeaderboardButton(callback) {
        document.getElementById('closeLeaderboardBtn').addEventListener('click', callback);
    }

    bindCloseStatsButton(callback) {
        document.getElementById('closeStatsBtn').addEventListener('click', callback);
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
