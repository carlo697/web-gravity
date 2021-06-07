import MassObj from "./MassObj.js";
import Vector2 from "./Vector2.js";

class Game {
    static instance;

    constructor(canvas) {
        Game.instance = this;

        // Canvas
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        // Loop
        this.lastFrameTime = 0;
        this.elapsedTime = 0;

        // Objects
        this.worldObjects = [];

        // Rendering
        this.renderFrameAccumulated = 0;
        this.renderCount = 0;
        this.skipRenderFrames = 0;
        this.renderSquares = true;

        // physics
        this.worldCenter = new Vector2(0, 0);
        this.worldSize = new Vector2(1000, 1000);
        this.collidingPairs = [];

        this.start();
    }

    start() {
        // Create a sun
        this.sun = new MassObj(this.worldCenter, 15, 30000);
        this.sun.colorStyle = "rgb(255, 255, 255)";

        // Spawn random asteorids
        for (let i = 0; i < 400; i++) {
            // Get a random position and size
            const x = this.worldCenter.x + (Math.random() * 2 - 1) * 300;
            const y = this.worldCenter.y + (Math.random() * 2 - 1) * 300;
            const size = 0.5 + Math.random() * 1;

            // Spawn the asteorid
            const obj = new MassObj(new Vector2(x, y), size, size * size * 4);

            // get tangent direction
            const dirr = this.sun.position.substract(obj.position);
            const distance = dirr.magnitude;
            const dirrNormalized = dirr.normalized;
            // get a random value to alter the orbit a bit
            const random = 1 + (Math.random() * 2 - 1) * 0.1;

            // apply a velocity to make it orbit the sun
            obj.velocity = new Vector2(
                -dirrNormalized.y *
                    Math.sqrt(this.sun.mass / distance) *
                    random,
                dirrNormalized.x * Math.sqrt(this.sun.mass / distance) * random
            );

            // set a random color
            const r = 55 + Math.random() * 200;
            const g = 55 + Math.random() * 200;
            const b = 55 + Math.random() * 200;
            obj.colorStyle = `rgb(${r},${g},${b})`;
        }
    }

    update(elapsed) {
        this.elapsedTime = elapsed;

        // elapsed time since last frame
        let delta = (elapsed - this.lastFrameTime) / 1000;

        // pause everything for a moment at the beginning
        if (elapsed < 4000) {
            delta = 0;
        }

        // if it's running too slow (or when it seems so), reset the delta
        if (delta > 0.5) {
            delta = 0;
        }

        // update loop
        this.physicsFrame(delta);

        this.renderFrameAccumulated += delta;

        // render loop
        if (this.renderCount === this.skipRenderFrames) {
            this.renderFrame(this.renderFrameAccumulated);

            this.renderFrameAccumulated = 0;
            this.renderCount = 0;
        } else {
            this.renderCount++;
        }

        // request new frame
        this.lastFrameTime = elapsed;
    }

    physicsFrame(delta) {
        if (this.sun) {
            this.sun.velocity = Vector2.zero;
        }

        // update positions and velocities
        let obj;
        for (let i = 0; i < this.worldObjects.length; i++) {
            obj = this.worldObjects[i];

            obj.velocity = new Vector2(
                obj.velocity.x + obj.aceleration.x * delta,
                obj.velocity.y + obj.aceleration.y * delta
            );

            obj.lasPosition = obj.position.copy;

            obj.position = new Vector2(
                obj.position.x + obj.velocity.x * delta,
                obj.position.y + obj.velocity.y * delta
            );
        }

        // update each object
        for (var i = 0; i < this.worldObjects.length; i++) {
            this.worldObjects[i].update(delta);
        }

        // iterate through collisions
        for (var i = 0; i < this.collidingPairs.length; i++) {
            const a = this.collidingPairs[i][0];
            const b = this.collidingPairs[i][1];

            // normal
            //const normal = b.position.substract(a.position).normalized;
            const normal = new Vector2(
                b.position.x - a.position.x,
                b.position.y - a.position.y
            ).normalized;

            // tangent
            const tangent = new Vector2(-normal.y, normal.x);

            // dot product tangent
            /*const dpTanA = a.velocity.dotProduct(tangent);
            const dpTanB = b.velocity.dotProduct(tangent);*/
            const dpTanA = a.velocity.x * tangent.x + a.velocity.y * tangent.y;
            const dpTanB = b.velocity.x * tangent.x + b.velocity.y * tangent.y;

            // dot product normal
            //const dpNormA = a.velocity.dotProduct(normal);
            //const dpNormB = b.velocity.dotProduct(normal);
            const dpNormA = a.velocity.x * normal.x + a.velocity.y * normal.y;
            const dpNormB = b.velocity.x * normal.x + b.velocity.y * normal.y;

            // Conservation of momentum
            //const mA = (dpNormA * (a.mass - b.mass) + 2 * b.mass * dpNormB) / (a.mass + b.mass);
            //const mB = (dpNormB * (b.mass - a.mass) + 2 * a.mass * dpNormA) / (a.mass + b.mass);
            const mA =
                (0.5 * b.mass * (dpNormB - dpNormA) +
                    a.mass * dpNormA +
                    b.mass * dpNormB) /
                (a.mass + b.mass);
            const mB =
                (0.5 * a.mass * (dpNormA - dpNormB) +
                    a.mass * dpNormA +
                    b.mass * dpNormB) /
                (a.mass + b.mass);

            a.velocity = new Vector2(
                tangent.x * dpTanA + normal.x * mA,
                tangent.y * dpTanA + normal.y * mA
            );

            b.velocity = new Vector2(
                tangent.x * dpTanB + normal.x * mB,
                tangent.y * dpTanB + normal.y * mB
            );
        }

        // clear array
        this.collidingPairs.length = 0;
    }

    renderFrame(delta) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
        this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
        this.context.scale(cameraZoom, cameraZoom);
        this.context.translate(
            -window.innerWidth / 2 + cameraOffset.x,
            -window.innerHeight / 2 + cameraOffset.y
        );

        // rendering
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw circles
        let obj = null;
        for (let i = 0; i < this.worldObjects.length; i++) {
            obj = this.worldObjects[i];

            this.context.fillStyle = obj.colorStyle;
            this.context.beginPath();

            if (this.renderSquares && obj != this.sun) {
                // draw a square
                this.context.fillRect(
                    obj.position.x - obj.radius,
                    obj.position.y - obj.radius,
                    obj.radius * 2,
                    obj.radius * 2
                );
            } else {
                // draw a circle
                this.context.arc(
                    obj.position.x,
                    obj.position.y,
                    obj.radius,
                    0,
                    2 * Math.PI
                );
            }

            this.context.fill();
        }
    }
}

export default Game;
