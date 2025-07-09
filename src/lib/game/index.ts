import { Player, Enemy, Tank } from './tank';
import { Bullet } from './bullet';
import { Obstacle } from './obstacle';
import { PowerUp, type PowerUpType } from './powerup';
import { Particle } from './particle';
import { checkCollision } from './utils';
import type { GameStatusType } from '@/app/page';

export type GameState = 'playing' | 'gameOver' | 'levelComplete';

export class Game {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    keys: { [key: string]: boolean } = {};
    player: Player;
    enemies: Enemy[] = [];
    bullets: Bullet[] = [];
    obstacles: Obstacle[] = [];
    powerups: PowerUp[] = [];
    particles: Particle[] = [];
    score: number = 0;
    level: number = 1;
    gameState: GameState = 'playing';
    
    lastTime: number = 0;

    stateUpdateCallback: (status: GameStatusType) => void;

    constructor(
        ctx: CanvasRenderingContext2D, 
        width: number, 
        height: number,
        stateUpdateCallback: (status: GameStatusType) => void
    ) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.player = new Player(this, width / 2 - 20, height - 50);
        this.stateUpdateCallback = stateUpdateCallback;
        this.init();
    }

    init() {
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing';
        this.player = new Player(this, this.width / 2 - 20, this.height - 50);
        this.setupLevel();
        this.updateGameState();
    }

    setupLevel() {
        this.enemies = [];
        this.bullets = [];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];

        // Spawn Enemies
        for (let i = 0; i < this.level; i++) {
            const x = Math.random() * (this.width - 50);
            const y = Math.random() * (this.height / 2);
            this.enemies.push(new Enemy(this, x, y));
        }

        // Define a safe area around the player's starting position
        const playerSafeZone = {
            x: this.player.x - 50,
            y: this.player.y - 50,
            width: this.player.width + 100,
            height: this.player.height + 100,
        };

        // Improved Obstacle Spawning Logic
        const numObstacles = 5 + this.level;
        const maxAttemptsPerObstacle = 20;
        const obstacleBuffer = 15; // Spacing between obstacles

        for (let i = 0; i < numObstacles; i++) {
            let placed = false;
            for (let j = 0; j < maxAttemptsPerObstacle; j++) {
                const width = Math.random() * 50 + 30;
                const height = Math.random() * 50 + 30;
                const x = Math.random() * (this.width - width);
                const y = Math.random() * (this.height - height - 150) + 75; // Keep obstacles in a central band

                const newObstacle = new Obstacle(x, y, width, height);

                // 1. Check for collision with player safe zone
                if (checkCollision(newObstacle, playerSafeZone)) {
                    continue; // Try a new position
                }

                // 2. Check for collision with other obstacles
                let isOverlapping = false;
                for (const existingObstacle of this.obstacles) {
                    const bufferedExisting = {
                        x: existingObstacle.x - obstacleBuffer,
                        y: existingObstacle.y - obstacleBuffer,
                        width: existingObstacle.width + (obstacleBuffer * 2),
                        height: existingObstacle.height + (obstacleBuffer * 2),
                    };
                    if (checkCollision(newObstacle, bufferedExisting)) {
                        isOverlapping = true;
                        break;
                    }
                }

                if (!isOverlapping) {
                    this.obstacles.push(newObstacle);
                    placed = true;
                    break; // Obstacle placed, move to the next one
                }
            }
            // If not placed after all attempts, we just skip it.
        }
    }
    
    gameLoop(timestamp: number) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.gameState === 'playing') {
            this.update(deltaTime || 0);
        }
        this.draw();
    }

    update(deltaTime: number) {
        this.player.update();
        
        this.enemies.forEach(e => e.update(deltaTime));
        this.bullets.forEach(b => b.update());
        this.particles.forEach(p => p.update());

        this.handleCollisions();

        this.bullets = this.bullets.filter(b => !b.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.particles = this.particles.filter(p => p.life > 0);
        this.powerups = this.powerups.filter(p => !p.markedForDeletion);
        
        if (this.player.markedForDeletion && this.gameState === 'playing') {
            this.gameState = 'gameOver';
            this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height/2, 'hsl(357, 42%, 47%)', 50);
        } else if (this.enemies.length === 0 && this.gameState === 'playing') {
            this.gameState = 'levelComplete';
        }
        
        if (Math.random() < 0.002) {
            this.spawnPowerUp();
        }
        
        this.updateGameState();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        [...this.obstacles, ...this.powerups, this.player, ...this.enemies, ...this.bullets, ...this.particles].forEach(obj => obj.draw(this.ctx));
    }

    handleCollisions() {
        this.bullets.forEach(bullet => {
            const targets: Tank[] = bullet.owner === this.player ? this.enemies : [this.player];
            targets.forEach(tank => {
                if (!tank.markedForDeletion && checkCollision(bullet, tank)) {
                    tank.takeDamage(10);
                    bullet.markedForDeletion = true;
                    this.createExplosion(bullet.x, bullet.y, '#FFA500');
                    if (tank instanceof Enemy && tank.markedForDeletion) {
                        this.score += 100;
                        this.createExplosion(tank.x + tank.width / 2, tank.y + tank.height / 2, 'hsl(357, 42%, 47%)', 30);
                    }
                }
            });

            this.obstacles.forEach(obstacle => {
                if (checkCollision(bullet, obstacle)) {
                    bullet.markedForDeletion = true;
                    this.createExplosion(bullet.x, bullet.y, '#888');
                }
            });
            
            if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
                bullet.markedForDeletion = true;
            }
        });

        const tanks = [this.player, ...this.enemies];
        tanks.forEach((tank, index) => {
            this.obstacles.forEach(obstacle => {
                if (checkCollision(tank, obstacle)) {
                    this.resolveTankObstacleCollision(tank, obstacle);
                }
            });
            for(let i = index + 1; i < tanks.length; i++) {
                const otherTank = tanks[i];
                if (checkCollision(tank, otherTank)) {
                    this.resolveTankObstacleCollision(tank, otherTank);
                }
            }
        });
        
        this.powerups.forEach(powerup => {
            if (checkCollision(this.player, powerup)) {
                this.applyPowerUp(powerup.type);
                powerup.markedForDeletion = true;
            }
        });
    }

    resolveTankObstacleCollision(tank: Tank, obstacle: { x: number; y: number; width: number; height: number; }) {
      const dx = (tank.x + tank.width/2) - (obstacle.x + obstacle.width/2);
      const dy = (tank.y + tank.height/2) - (obstacle.y + obstacle.height/2);
      const combinedHalfWidths = tank.width/2 + obstacle.width/2;
      const combinedHalfHeights = tank.height/2 + obstacle.height/2;
      const overlapX = combinedHalfWidths - Math.abs(dx);
      const overlapY = combinedHalfHeights - Math.abs(dy);

      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
            tank.x += dx > 0 ? overlapX : -overlapX;
            tank.speed = 0;
        } else {
            tank.y += dy > 0 ? overlapY : -overlapY;
            tank.speed = 0;
        }
      }
    }

    applyPowerUp(type: PowerUpType) {
        switch (type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
                break;
            case 'ammo':
                this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 10);
                break;
        }
    }
    
    spawnPowerUp() {
        const types: PowerUpType[] = ['health', 'ammo'];
        const type = types[Math.floor(Math.random() * types.length)];
        const maxAttempts = 50; // Limit attempts to prevent infinite loop
        
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.random() * (this.width - 20);
            const y = Math.random() * (this.height - 20);
            const tempPowerUp = new PowerUp(x, y, type);

            let collision = false;
            for (const obstacle of this.obstacles) {
                if (checkCollision(tempPowerUp, obstacle)) {
                    collision = true;
                    break;
                }
            }

            if (!collision) {
                this.powerups.push(tempPowerUp);
                break; // Found a valid spot, exit loop
            }
        }
    }
    
    createExplosion(x: number, y: number, color: string, count: number = 20) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    updateGameState() {
        this.stateUpdateCallback({
            score: this.score,
            health: this.player.health,
            ammo: this.player.ammo,
            level: this.level,
            enemiesLeft: this.enemies.length,
            status: this.gameState,
        });
    }

    addBullet(bullet: Bullet) {
        this.bullets.push(bullet);
    }
    
    nextLevel() {
        if(this.gameState === 'levelComplete') {
            this.level++;
            this.score += 500 * (this.level -1);
            this.player.health = this.player.maxHealth;
            this.player.ammo = 10;
            this.setupLevel();
            this.gameState = 'playing';
            this.updateGameState();
        }
    }
    
    restart() {
        this.init();
    }
}