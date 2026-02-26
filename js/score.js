import { SCORE_CONFIG } from './constants.js';

export class Score {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.highScore = this.loadHighScore();
    }

    reset() {
        this.score = 0;
        this.level = 1;
    }

    addScore(points) {
        this.score += points;
        this.level = Math.floor(this.score / SCORE_CONFIG.levelUpScore) + 1;
    }

    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }

    getHighScore() {
        return this.highScore;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }

    loadHighScore() {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved) : 0;
    }

    calculateSpeed(difficulty) {
        // 根据等级计算速度
        const newSpeed = difficulty.initialSpeed - (this.level - 1) * difficulty.speedDecrease;
        return Math.max(newSpeed, difficulty.minSpeed);
    }
}
