export class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.color = color;
    this.maxLife = Math.random() * 20 + 20;
    this.life = this.maxLife;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    this.speedY += 0.05; // gravity
    this.size *= 0.98;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
