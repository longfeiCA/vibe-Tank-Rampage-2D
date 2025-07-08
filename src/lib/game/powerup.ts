import { Heart, Shell } from "lucide-react";

export type PowerUpType = 'health' | 'ammo';

export class PowerUp {
  x: number;
  y: number;
  size: number;
  type: PowerUpType;
  markedForDeletion: boolean = false;
  rotation: number = 0;
  
  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = type;
  }
  
  get width() { return this.size; }
  get height() { return this.size; }

  update() {
    this.rotation += 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol = '';
    switch(this.type) {
        case 'health': 
            ctx.fillStyle = 'hsl(357 42% 47%)';
            symbol = '♥';
            break;
        case 'ammo':
            ctx.fillStyle = 'hsl(85 37% 44%)';
            symbol = 'A';
            break;
    }
    ctx.fillText(symbol, 0, 1);
    ctx.restore();
  }
}
