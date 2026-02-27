import { GRID_SIZE, DIRECTION } from './constants.js';

export class Snake {
    constructor(x, y) {
        this.body = [
            { x, y },
            { x: x - 1, y },
            { x: x - 2, y },
            { x: x - 3, y },
            { x: x - 4, y }
        ];
        this.prevBody = this.body.map(s => ({ ...s }));
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.growing = false;
        this.tonguePhase = 0;
    }

    move() {
        this.prevBody = this.body.map(s => ({ ...s }));
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        this.body.unshift(head);

        if (!this.growing) {
            this.body.pop();
            this.prevBody.unshift({ ...this.prevBody[0] });
        } else {
            this.growing = false;
            this.prevBody.unshift({ ...this.prevBody[0] });
        }
    }

    grow() { this.growing = true; }

    changeDirection(newDirection) {
        if (this.direction.x + newDirection.x === 0 &&
            this.direction.y + newDirection.y === 0) return;
        this.nextDirection = newDirection;
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) return true;
        }
        return false;
    }

    getHead() { return this.body[0]; }
    getBody() { return this.body; }

    _interpPos(cur, prev, t) {
        const cx = cur.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = cur.y * GRID_SIZE + GRID_SIZE / 2;
        const px = prev.x * GRID_SIZE + GRID_SIZE / 2;
        const py = prev.y * GRID_SIZE + GRID_SIZE / 2;
        return {
            x: px + (cx - px) * t,
            y: py + (cy - py) * t
        };
    }

    render(ctx, t = 1) {
        this.tonguePhase += 0.08;
        const len = this.body.length;

        const pts = this.body.map((seg, i) => {
            const prev = this.prevBody[i] || seg;
            return this._interpPos(seg, prev, t);
        });

        if (pts.length < 2) return;

        const splinePts = this._buildSplinePath(pts);

        // Draw body.
        this._drawCartoonBody(ctx, splinePts, len);

        // Draw head.
        const headR = GRID_SIZE * 0.6;
        this._drawHead(ctx, splinePts[0], this.direction, headR);
    }

    _buildSplinePath(pts) {
        if (pts.length < 2) return pts;
        const result = [];
        const subdivisions = 8;

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];

            for (let j = 0; j < subdivisions; j++) {
                const t = j / subdivisions;
                result.push(this._catmullRom(p0, p1, p2, p3, t));
            }
        }
        result.push(pts[pts.length - 1]);
        return result;
    }

    _catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: 0.5 * ((2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        };
    }

    // Cartoon body with bright green palette and zigzag pattern.
    _drawCartoonBody(ctx, splinePts, segCount) {
        const totalPts = splinePts.length;
        if (totalPts < 2) return;

        const headR = GRID_SIZE * 0.48;
        const tailR = GRID_SIZE * 0.10;

        const leftContour = [];
        const rightContour = [];

        for (let i = 0; i < totalPts; i++) {
            const ratio = i / (totalPts - 1);
            const r = headR - (headR - tailR) * ratio;

            let tx, ty;
            if (i === 0) {
                tx = splinePts[1].x - splinePts[0].x;
                ty = splinePts[1].y - splinePts[0].y;
            } else if (i === totalPts - 1) {
                tx = splinePts[i].x - splinePts[i - 1].x;
                ty = splinePts[i].y - splinePts[i - 1].y;
            } else {
                tx = splinePts[i + 1].x - splinePts[i - 1].x;
                ty = splinePts[i + 1].y - splinePts[i - 1].y;
            }

            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            const nx = -ty / tLen;
            const ny = tx / tLen;

            leftContour.push({
                x: splinePts[i].x + nx * r,
                y: splinePts[i].y + ny * r
            });
            rightContour.push({
                x: splinePts[i].x - nx * r,
                y: splinePts[i].y - ny * r
            });
        }

        ctx.save();

        const grad = ctx.createLinearGradient(
            splinePts[0].x, splinePts[0].y,
            splinePts[totalPts - 1].x, splinePts[totalPts - 1].y
        );
        grad.addColorStop(0, '#24c526');
        grad.addColorStop(0.55, '#17a61d');
        grad.addColorStop(1, '#11931a');

        ctx.lineWidth = 2.8;
        ctx.strokeStyle = '#0a6a12';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(leftContour[0].x, leftContour[0].y);
        for (let i = 1; i < leftContour.length; i++) {
            ctx.lineTo(leftContour[i].x, leftContour[i].y);
        }
        const tailPt = splinePts[totalPts - 1];
        const tailLeft = leftContour[totalPts - 1];
        const tailAngle = Math.atan2(tailLeft.y - tailPt.y, tailLeft.x - tailPt.x);
        ctx.arc(tailPt.x, tailPt.y, tailR, tailAngle, tailAngle + Math.PI);
        for (let i = rightContour.length - 1; i >= 0; i--) {
            ctx.lineTo(rightContour[i].x, rightContour[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(209, 255, 185, 0.35)';
        ctx.lineWidth = headR * 0.18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < totalPts; i++) {
            const ratio = i / (totalPts - 1);
            const r = (headR - (headR - tailR) * ratio) * 0.28;
            let tx, ty;
            if (i === 0) {
                tx = splinePts[1].x - splinePts[0].x;
                ty = splinePts[1].y - splinePts[0].y;
            } else if (i === totalPts - 1) {
                tx = splinePts[i].x - splinePts[i - 1].x;
                ty = splinePts[i].y - splinePts[i - 1].y;
            } else {
                tx = splinePts[i + 1].x - splinePts[i - 1].x;
                ty = splinePts[i + 1].y - splinePts[i - 1].y;
            }
            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            const nx = -ty / tLen;
            const ny = tx / tLen;
            const hx = splinePts[i].x + nx * r;
            const hy = splinePts[i].y + ny * r;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.stroke();

        this._drawZigzagPattern(ctx, splinePts, headR, tailR, segCount);

        ctx.restore();
    }

    _drawZigzagPattern(ctx, splinePts, headR, tailR, segCount) {
        const totalPts = splinePts.length;
        if (totalPts < 6) return;

        const step = Math.max(4, Math.floor(totalPts / Math.max(segCount * 2, 10)));

        ctx.beginPath();
        for (let i = step, n = 0; i < totalPts - step; i += step, n++) {
            const ratio = i / (totalPts - 1);
            const r = headR - (headR - tailR) * ratio;

            const prev = splinePts[i - 1];
            const next = splinePts[i + 1];
            const tx = next.x - prev.x;
            const ty = next.y - prev.y;
            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            const nx = -ty / tLen;
            const ny = tx / tLen;
            const side = n % 2 === 0 ? 1 : -1;
            const offset = r * 0.45 * side;
            const px = splinePts[i].x + nx * offset;
            const py = splinePts[i].y + ny * offset;

            if (n === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = '#b7d23f';
        ctx.lineWidth = Math.max(2, headR * 0.42);
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = 'rgba(31, 122, 19, 0.7)';
        ctx.lineWidth = Math.max(1.4, headR * 0.12);
        ctx.stroke();
    }

    _drawHead(ctx, pos, direction, r) {
        ctx.save();
        ctx.translate(pos.x, pos.y);

        const angle = Math.atan2(direction.y, direction.x);
        ctx.rotate(angle);

        const headGrad = ctx.createRadialGradient(-r * 0.45, -r * 0.25, r * 0.02, 0, 0, r * 1.12);
        headGrad.addColorStop(0, '#57df49');
        headGrad.addColorStop(0.6, '#24bc2b');
        headGrad.addColorStop(1, '#10881c');
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = '#0c6a13';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(r * 0.06, 0, r * 1.02, r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1eaa27';
        ctx.beginPath();
        ctx.ellipse(r * 0.82, 0, r * 0.32, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        this._drawEye(ctx, r * 0.02, -r * 0.42, r);
        this._drawEye(ctx, r * 0.02, r * 0.42, r);

        ctx.strokeStyle = '#0d6f15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.52, -r * 0.56);
        ctx.lineTo(-r * 0.16, -r * 0.78);
        ctx.lineTo(r * 0.18, -r * 0.56);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r * 0.52, r * 0.56);
        ctx.lineTo(-r * 0.16, r * 0.78);
        ctx.lineTo(r * 0.18, r * 0.56);
        ctx.stroke();

        ctx.fillStyle = '#12851a';
        ctx.beginPath();
        ctx.arc(r * 0.58, -r * 0.14, r * 0.1, 0, Math.PI * 2);
        ctx.arc(r * 0.58, r * 0.14, r * 0.1, 0, Math.PI * 2);
        ctx.fill();

        this._drawTongue(ctx, r);

        ctx.restore();
    }

    _drawEye(ctx, ex, ey, r) {
        const er = r * 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex, ey, er * 0.95, er * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0f5b15';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(ex + er * 0.15, ey, er * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(ex + er * 0.05, ey - er * 0.24, er * 0.22, 0, Math.PI * 2);
        ctx.fill();
    }
    _drawTongue(ctx, r) {
        const out = 0.5 + Math.sin(this.tonguePhase) * 0.5;
        const tLen = r * 0.65 * out;
        if (tLen < 0.05) return;

        const fLen = r * 0.28;
        const sx = r * 0.88;
        const ex = sx + tLen;

        ctx.strokeStyle = '#ff2255';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(ex, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(ex + fLen * out, -fLen * 0.45 * out);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(ex + fLen * out,  fLen * 0.45 * out);
        ctx.stroke();
    }
}
