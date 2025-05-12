import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-brick-breaker',
  templateUrl: './brick-breaker.component.html',
  styleUrls: ['./brick-breaker.component.scss'],
  imports: [CommonModule],
})
export class BrickBreakerComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private ballRadius = 10;
  private x = 400;
  private y = 300;
  private dx = 2;
  private dy = -2;

  private paddleHeight = 10;
  private paddleWidth = 75;
  private paddleX = 400 - this.paddleWidth / 2;
  private canvasHeight = 600;
  private canvasWidth = 800;
  private paddleY = this.canvasHeight - this.paddleHeight;

  private rightPressed = false;
  private leftPressed = false;

  private bricks: any[] = [];
  private brickRowCount = 5;
  private brickColumnCount = 10;
  private brickHeight = 20;
  private brickPadding = 10;
  private brickOffsetTop = 30;
  private brickOffsetLeft = 0;

  score = 0;
  gameStarted = false;
  gameOver = false;

  get brickWidth(): number {
    return (this.canvasWidth - this.brickPadding * (this.brickColumnCount + 1)) / this.brickColumnCount;
  }
  ngOnInit(): void {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
  }


  startGame() {
    this.resetState();
    this.gameStarted = true;
    this.draw();
  }

  restartGame() {
    this.resetState();
    this.gameOver = false;
    this.gameStarted = true;
    this.draw();
  }

  resetState() {
    this.score = 0;
    this.x = 400;
    this.y = 300;
    this.dx = 2;
    this.dy = -2;
    this.paddleX = 400 - this.paddleWidth / 2;
    this.createBricks();
  }

  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#0095DD';
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawPaddle() {
    this.ctx.beginPath();
    this.ctx.rect(this.paddleX, 580, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#0095DD';
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawBricks() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status === 1) {
          const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
          const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
          this.bricks[c][r].x = brickX;
          this.bricks[c][r].y = brickY;
          this.ctx.beginPath();
          this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          this.ctx.fillStyle = '#0095DD';
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  collisionDetection() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        const b = this.bricks[c][r];
        if (b.status === 1) {
          if (this.x > b.x && this.x < b.x + this.brickWidth && this.y > b.y && this.y < b.y + this.brickHeight) {
            this.dy = -this.dy;
            b.status = 0;
            this.score++;
            if (this.score === this.brickRowCount * this.brickColumnCount) {
              alert('Parabéns! Você venceu!');
              this.gameOver = true;
              this.gameStarted = false;
            }
          }
        }
      }
    }
  }

  movePaddle() {
    if (this.rightPressed && this.paddleX < 800 - this.paddleWidth) {
      this.paddleX += 7;
    } else if (this.leftPressed && this.paddleX > 0) {
      this.paddleX -= 7;
    }
  }

  draw() {
    if (!this.gameStarted) return;

    this.ctx.clearRect(0, 0, 800, 600);
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();
    this.collisionDetection();
    this.movePaddle();

    if (this.x + this.dx > 800 - this.ballRadius || this.x + this.dx < this.ballRadius) {
      this.dx = -this.dx;
    }
    if (this.y + this.dy > this.paddleY - this.ballRadius) {
      if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
        this.handleBallBounceOffPaddle();
      } else {
        this.gameOver = true;
        this.gameStarted = false;
        return;
      }
    }

    this.x += this.dx;
    this.y += this.dy;

    requestAnimationFrame(() => this.draw());
  }

  handleBallBounceOffPaddle() {
    const hitPoint = (this.x - this.paddleX) / this.paddleWidth; // 0 (esquerda) → 1 (direita)
    const angle = (hitPoint - 0.5) * Math.PI / 2; // -π/4 (esq) → π/4 (dir)

    // Pequena aleatoriedade de -5 a +5 graus
    const randomOffset = (Math.random() - 0.5) * (Math.PI / 36);

    const finalAngle = angle + randomOffset;

    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.dx = speed * Math.sin(finalAngle);
    this.dy = -Math.abs(speed * Math.cos(finalAngle)); // sempre pra cima
  }


  @HostListener('document:keydown', ['$event'])
  keyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Right' || event.key === 'ArrowRight') this.rightPressed = true;
    else if (event.key === 'Left' || event.key === 'ArrowLeft') this.leftPressed = true;
  }

  @HostListener('document:keyup', ['$event'])
  keyUpHandler(event: KeyboardEvent) {
    if (event.key === 'Right' || event.key === 'ArrowRight') this.rightPressed = false;
    else if (event.key === 'Left' || event.key === 'ArrowLeft') this.leftPressed = false;
  }

  // Suporte a toques no mobile
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    const touch = event.touches[0];
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    this.paddleX = touchX - this.paddleWidth / 2;
    if (this.paddleX < 0) this.paddleX = 0;
    if (this.paddleX > 800 - this.paddleWidth) this.paddleX = 800 - this.paddleWidth;
  }
}
