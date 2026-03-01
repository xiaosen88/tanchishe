export class AudioManager {
    constructor() {
        this.muted = false;
        this.sounds = {};
        this.audioContext = null;
        this.bgmNodes = [];
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // 播放和弦
    playChord(frequencies, duration, startTime) {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const nodes = [];

        frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            // 音量包络：快速上升，缓慢下降
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
            
            nodes.push({ osc, gain });
        });

        return nodes;
    }

    // 播放背景音乐
    playBGM() {
        if (this.muted || !this.audioContext || this.bgmPlaying) return;

        const ctx = this.audioContext;
        this.bgmPlaying = true;

        // 轻快的和弦进行 (C - Am - F - G)
        const chordProgression = [
            [261.63, 329.63, 392.00], // C大调 (C-E-G)
            [220.00, 261.63, 329.63], // A小调 (A-C-E)
            [174.61, 220.00, 261.63], // F大调 (F-A-C)
            [196.00, 246.94, 293.66]  // G大调 (G-B-D)
        ];

        // 节奏模式：每个和弦持续0.5秒
        const beatDuration = 0.5;
        let currentBeat = 0;

        const playNextBeat = () => {
            if (!this.bgmPlaying) return;

            const startTime = ctx.currentTime;
            const chordIndex = currentBeat % chordProgression.length;
            const chord = chordProgression[chordIndex];

            // 播放和弦
            const nodes = this.playChord(chord, beatDuration, startTime);
            this.bgmNodes.push(...nodes);

            // 添加节奏感：每两拍加重音
            if (currentBeat % 2 === 0) {
                // 加入低音
                const bassNodes = this.playChord([chord[0] / 2], beatDuration * 0.3, startTime);
                this.bgmNodes.push(...bassNodes);
            }

            currentBeat++;

            // 清理旧节点
            this.bgmNodes = this.bgmNodes.filter(node => {
                try {
                    return node.osc.context.state === 'running';
                } catch {
                    return false;
                }
            });
        };

        // 立即播放第一拍
        playNextBeat();

        // 设置定时器循环播放
        this.bgmInterval = setInterval(playNextBeat, beatDuration * 1000);
    }

    // 停止背景音乐
    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }

        this.bgmNodes.forEach(node => {
            try {
                node.osc.stop();
            } catch (e) {
                // 节点可能已经停止
            }
        });

        this.bgmNodes = [];
        this.bgmPlaying = false;
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
