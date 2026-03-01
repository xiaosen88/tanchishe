export class AudioManager {
    constructor() {
        this.muted = false;
        this.sounds = {};
        this.audioContext = null;
        this.bgmOscillator = null;
        this.bgmGain = null;
        this.bgmPlaying = false;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // 播放背景音乐
    playBGM() {
        if (this.muted || !this.audioContext || this.bgmPlaying) return;

        const ctx = this.audioContext;
        
        // 创建振荡器和增益节点
        this.bgmOscillator = ctx.createOscillator();
        this.bgmGain = ctx.createGain();
        
        this.bgmOscillator.connect(this.bgmGain);
        this.bgmGain.connect(ctx.destination);
        
        // 设置简单的旋律（使用低音量）
        this.bgmOscillator.type = 'sine';
        this.bgmOscillator.frequency.value = 220; // A3音
        this.bgmGain.gain.value = 0.05; // 很低的音量
        
        this.bgmOscillator.start();
        this.bgmPlaying = true;
    }

    // 停止背景音乐
    stopBGM() {
        if (this.bgmOscillator && this.bgmPlaying) {
            this.bgmOscillator.stop();
            this.bgmOscillator = null;
            this.bgmGain = null;
            this.bgmPlaying = false;
        }
    }

    // 使用 Web Audio API 生成简单音效
    play(soundName) {
        if (this.muted || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch (soundName) {
            case 'eat':
                // 吃食物：短促的高音
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;

            case 'levelup':
                // 升级：上升音阶
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;

            case 'gameover':
                // 游戏结束：下降音
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.5);
                break;
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBGM();
        } else {
            this.playBGM();
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }
}
