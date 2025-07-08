import type { Tank } from './tank';

export class Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  angle: number;
  owner: Tank;
  markedForDeletion: boolean = false;

  constructor(x: number, y: number, angle: number, owner: Tank) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 5;
    this.speed = 8;
    this.angle = angle;
    this.owner = owner;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
