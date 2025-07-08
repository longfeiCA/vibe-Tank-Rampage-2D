import { Bullet } from './bullet';
import type { Game } from './index';

export class Tank {
  game: Game;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotationSpeed: number;
  angle: number;
  color: string;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  shootCooldown: number;
  lastShotTime: number;
  markedForDeletion: boolean = false;

  constructor(game: Game, x: number, y: number, color: string) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 30;
    this.speed = 0;
    this.rotationSpeed = 0;
    this.angle = -Math.PI / 2;
    this.color = color;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.maxAmmo = 10;
    this.ammo = this.maxAmmo;
    this.shootCooldown = 500; // ms
    this.lastShotTime = 0;
  }

  update() {
    this.angle += this.rotationSpeed;
    const moveX = Math.cos(this.angle) * this.speed;
    const moveY = Math.sin(this.angle) * this.speed;
    
    const prevX = this.x;
    const prevY = this.y;
    this.x += moveX;
    this.y += moveY;

    // Boundary checks
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.fillStyle = '#666';
    ctx.fillRect(0, -2.5, this.width * 0.7, 5);
    
    ctx.beginPath();
    ctx.arc(0, 0, this.height / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();

    if (this.health < this.maxHealth) {
        const barX = -this.width / 2;
        const barY = -this.height / 2 - 12;
        
        ctx.fillStyle = 'hsl(0, 100%, 30%)';
        ctx.fillRect(barX, barY, this.width, 5);

        ctx.fillStyle = 'hsl(120, 100%, 30%)';
        ctx.fillRect(barX, barY, this.width * (this.health / this.maxHealth), 5);
    }
      
    ctx.restore();
  }

  shoot() {
    const currentTime = Date.now();
    if (this.ammo > 0 && currentTime - this.lastShotTime > this.shootCooldown) {
      this.ammo--;
      this.lastShotTime = currentTime;
      const bulletX = this.x + this.width / 2 + Math.cos(this.angle) * 25;
      const bulletY = this.y + this.height / 2 + Math.sin(this.angle) * 25;
      return new Bullet(bulletX, bulletY, this.angle, this);
    }
    return null;
  }
  
  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
        this.health = 0;
        this.markedForDeletion = true;
    }
  }
}

export class Player extends Tank {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, '#7C9B45'); // Changed player tank color to Military Green
    this.maxAmmo = 100;
    this.ammo = 10;
  }

  update() {
    const keys = this.game.keys;
    if (keys['w'] || keys['arrowup']) {
      this.speed = 2.5;
    } else if (keys['s'] || keys['arrowdown']) {
      this.speed = -2;
    } else {
      this.speed = 0;
    }
    
    if (keys['a'] || keys['arrowleft']) {
      this.rotationSpeed = -0.05;
    } else if (keys['d'] || keys['arrowright']) {
      this.rotationSpeed = 0.05;
    } else {
      this.rotationSpeed = 0;
    }

    super.update();
    
    if (keys[' ']) {
      const bullet = this.shoot();
      if (bullet) {
        this.game.addBullet(bullet);
      }
    }
  }
}

export class Enemy extends Tank {
  aiState: 'idle' | 'aiming' | 'attacking' | 'repositioning' = 'idle';
  stateTimer: number = 0;
  
  // AI parameters
  visionRange: number = 350;
  aimingSpeed: number = 0.04;
  attackAngleThreshold: number = 0.1; // in radians
  timeToLockOn: number = 750; // ms
  repositioningTime: number = 1500; // ms

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, '#A84448'); // Changed enemy tank color to Brick Red
    this.maxHealth = 30;
    this.health = this.maxHealth;
  }

  update(deltaTime: number) {
    this.stateTimer += deltaTime;
    const dx = this.game.player.x - this.x;
    const dy = this.game.player.y - this.y;
    const distanceToPlayer = Math.hypot(dx, dy);
    
    // State machine logic
    switch (this.aiState) {
        case 'idle':
            this.speed = 0;
            this.rotationSpeed = 0;
            if (distanceToPlayer < this.visionRange) {
                this.aiState = 'aiming';
                this.stateTimer = 0;
            }
            break;

        case 'aiming':
            this.speed = 0;
            const targetAngle = Math.atan2(dy, dx);
            let angleDiff = targetAngle - this.angle;

            // Normalize angle for shortest turn
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            if (Math.abs(angleDiff) < this.attackAngleThreshold) {
                this.rotationSpeed = 0;
                this.angle = targetAngle; // Snap to target
                if (this.stateTimer > this.timeToLockOn) {
                    this.aiState = 'attacking';
                }
            } else {
                this.rotationSpeed = Math.sign(angleDiff) * this.aimingSpeed;
                this.stateTimer = 0; // Reset lock-on timer if not aimed
            }

            if (distanceToPlayer > this.visionRange * 1.2) { // Give some buffer
                this.aiState = 'idle';
            }
            break;

        case 'attacking':
            const bullet = this.shoot();
            if (bullet) {
                this.game.addBullet(bullet);
            }
            this.aiState = 'repositioning';
            this.stateTimer = 0;
            break;

        case 'repositioning':
            this.speed = 1.5;
            if (this.stateTimer > this.repositioningTime) {
                this.aiState = 'idle';
                this.stateTimer = 0;
            }
            break;
    }

    super.update();
  }
}