import * as PIXI from 'pixi.js';
import { Pane } from 'tweakpane';
import TWEEN from '@tweenjs/tween.js';

class AnimatedPoints {
    constructor() {
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight-125 });
        document.body.appendChild(this.app.view);

        this.points = [];
        this.createPoints();
        this.startButton = null;
        this.resetButton = null;
        this.animation = null;
        this.setupControls();
    }

    createPoints() {
        for (let i = 0; i < 20; i++) {
            const point = new PIXI.Graphics();
            point.beginFill(0xff0000);
            point.lineStyle(2, 0x00ff00);
            point.drawCircle(0, 0, 10);
            point.endFill();
            point.x = Math.random() * this.app.screen.width;
            point.y = Math.random() * this.app.screen.height;
            this.app.stage.addChild(point);
            this.points.push(point);
        }
    }

    animatePoints() {
        if (this.animation || this.animationInProgress) return;

        this.animationInProgress = true;
        this.animation = new TWEEN.Tween({});

        const animationPromises = this.points.map((point, index) => {
            const startX = point.x;
            const startY = point.y;
            const targetX = this.app.screen.width / 2;
            const targetY = this.app.screen.height / 2;
            const duration = 500;
            const delay = index * 500;

            return new Promise((resolve) => {
                new TWEEN.Tween({ x: startX, y: startY })
                    .to({ x: targetX, y: targetY }, duration)
                    .delay(delay)
                    .onUpdate(({ x, y }) => {
                        point.x = x;
                        point.y = y;
                    })
                    .onComplete(() => {
                        resolve();
                    })
                    .start();
            });
        });

        Promise.all(animationPromises).then(() => {
            this.animationInProgress = false;
            this.animation = null;
        });
    }

    resetPoints() {
        if (this.animationInProgress || this.animation) return;

        this.points.forEach((point) => {
            point.x = Math.random() * this.app.screen.width;
            point.y = Math.random() * this.app.screen.height;
        });
    }

    setupControls() {
        const pane = new Pane();

        const controlsFolder = pane.addFolder({ title: "Game" });

        this.resetButton = controlsFolder.addButton({ title: "Reset" }).on("click", () => {
            this.resetPoints();
        });

        this.startButton = controlsFolder.addButton({ title: "Start" }).on("click", () => {
            this.animatePoints();
        });

        document.body.appendChild(pane.element);
        const checkAnimationStatus = () => {
            if (!this.animationInProgress && !this.animation) {
                this.resetButton.disabled = false;
                this.startButton.disabled = false;
            } else {
                this.resetButton.disabled = true;
            }
        };

        setInterval(checkAnimationStatus, 100);
    }
}

new AnimatedPoints();

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}

animate();
