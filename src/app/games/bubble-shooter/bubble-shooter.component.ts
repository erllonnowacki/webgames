import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';

export interface Bubble {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity?: { x: number; y: number };
  isMoving?: boolean;
}

@Component({
  selector: 'app-bubble-shooter',
  templateUrl: './bubble-shooter.component.html',
  styleUrls: ['./bubble-shooter.component.scss'],
  imports: [CommonModule],
})

export class BubbleShooterComponent implements AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private readonly radius = 20;
  private readonly colors = ['red', 'blue', 'green', 'yellow', 'purple'];
  private readonly cols = 10;
  private readonly rows = 10;

  private bubbles: Bubble[] = [];
  private shooter: Bubble;
  public score = 0;
  gameOver = false;

  constructor() {
    this.shooter = this.createBubble(200, 380, this.getRandomColor());
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.generateInitialBubbles();
    this.render();
  }

  generateInitialBubbles() {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.radius + col * this.radius * 2;
        const y = this.radius + row * this.radius * 2;
        this.bubbles.push(this.createBubble(x, y, this.getRandomColor()));
      }
    }
  }

  createBubble(x: number, y: number, color: string): Bubble {
    return { x, y, radius: this.radius, color };
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  shootBubble(angle: number) {
    const speed = 5;
    const radians = (angle * Math.PI) / 180;

    this.shooter.velocity = {
      x: Math.cos(radians) * speed,
      y: Math.sin(radians) * speed,
    };
    this.shooter.isMoving = true;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.gameOver || this.shooter.isMoving) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const dx = event.clientX - rect.left - this.shooter.x;
    const dy = event.clientY - rect.top - this.shooter.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    this.shootBubble(angle);
  }

  update() {
    if (this.shooter.isMoving && this.shooter.velocity) {
      this.shooter.x += this.shooter.velocity.x;
      this.shooter.y += this.shooter.velocity.y;

      // Colisão com paredes
      if (this.shooter.x < this.radius || this.shooter.x > 400 - this.radius) {
        this.shooter.velocity.x *= -1;
      }

      // Colisão com topo ou outras bolhas
      if (this.shooter.y < this.radius || this.checkCollision()) {
        this.shooter.isMoving = false;

        const snapY = Math.floor(this.shooter.y / (this.radius * 2)) * this.radius * 2 + this.radius;
        const snapX = Math.floor(this.shooter.x / (this.radius * 2)) * this.radius * 2 + this.radius;
        const newBubble = this.createBubble(snapX, snapY, this.shooter.color);
        this.bubbles.push(newBubble);

        this.removeCluster(newBubble);

        this.shooter = this.createBubble(200, 380, this.getRandomColor());

        if (this.bubbles.some(b => b.y >= 380)) {
          this.gameOver = true;
        }
      }
    }
  }

  checkCollision(): boolean {
    for (const bubble of this.bubbles) {
      const dx = bubble.x - this.shooter.x;
      const dy = bubble.y - this.shooter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.radius * 2) return true;
    }
    return false;
  }

  removeCluster(start: Bubble) {
    const visited = new Set<Bubble>();
    const cluster = this.findCluster(start, visited);

    if (cluster.length >= 3) {
      this.bubbles = this.bubbles.filter(b => !cluster.includes(b));
      this.score += cluster.length * 10;
    }
  }

  findCluster(start: Bubble, visited: Set<Bubble>): Bubble[] {
    const stack = [start];
    const cluster: Bubble[] = [];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      cluster.push(current);

      const neighbors = this.bubbles.filter(b => {
        const dx = b.x - current.x;
        const dy = b.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius * 2 + 1 && b.color === start.color && b !== current;
      });

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }

    return cluster;
  }

  render = () => {
    this.update();

    this.ctx.clearRect(0, 0, 400, 400);
    this.bubbles.forEach(b => this.drawBubble(b));
    if (!this.gameOver) this.drawBubble(this.shooter);

    this.ctx.fillStyle = 'black';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 20);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 150, 400, 100);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Game Over', 140, 200);
    }

    requestAnimationFrame(this.render);
  };

  drawBubble(bubble: Bubble) {
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = bubble.color;
    this.ctx.fill();
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
  }
}
