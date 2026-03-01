// 排行榜和统计数据管理
export class Leaderboard {
    constructor() {
        this.maxEntries = 10;
        this.storageKey = 'snakeGameLeaderboard';
        this.statsKey = 'snakeGameStats';
    }

    // 添加新记录
    addScore(score, difficulty, level) {
        const leaderboard = this.getLeaderboard();
        const newEntry = {
            score: score,
            difficulty: difficulty,
            level: level,
            date: new Date().toISOString()
        };

        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        
        // 只保留前10名
        const topScores = leaderboard.slice(0, this.maxEntries);
        localStorage.setItem(this.storageKey, JSON.stringify(topScores));

        // 更新统计数据
        this.updateStats(score, difficulty, level);

        return topScores;
    }

    // 获取排行榜
    getLeaderboard() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // 更新统计数据
    updateStats(score, difficulty, level) {
        let stats = this.getStats();
        
        stats.totalGames++;
        stats.totalScore += score;
        stats.totalFoodEaten += Math.floor(score / 10);
        
        // 更新各难度最高分
        const diffKey = `${difficulty}HighScore`;
        if (!stats[diffKey] || score > stats[diffKey]) {
            stats[diffKey] = score;
        }

        // 更新最高等级
        if (level > stats.maxLevel) {
            stats.maxLevel = level;
        }

        localStorage.setItem(this.statsKey, JSON.stringify(stats));
    }

    // 获取统计数据
    getStats() {
        const data = localStorage.getItem(this.statsKey);
        if (data) {
            return JSON.parse(data);
        }
        
        // 默认统计数据
        return {
            totalGames: 0,
            totalScore: 0,
            totalFoodEaten: 0,
            maxLevel: 1,
            EASYHighScore: 0,
            NORMALHighScore: 0,
            HARDHighScore: 0
        };
    }

    // 清空排行榜
    clearLeaderboard() {
        localStorage.removeItem(this.storageKey);
    }

    // 清空统计数据
    clearStats() {
        localStorage.removeItem(this.statsKey);
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 获取难度中文名
    getDifficultyName(difficulty) {
        const names = {
            'EASY': '简单',
            'NORMAL': '普通',
            'HARD': '困难'
        };
        return names[difficulty] || difficulty;
    }
}
