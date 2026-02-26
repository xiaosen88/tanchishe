export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, color) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // 更新位置
            p.x += p.vx;
            p.y += p.vy;

            // 应用重力和阻力
            p.vy += 0.1;
            p.vx *= 0.98;
            p.vy *= 0.98;

            // 减少生命值
            p.life -= 0.02;

            // 移除死亡粒子
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // 重置
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    clear() {
        this.particles = [];
    }
}
