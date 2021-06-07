import Game from "./Game.js";
import Vector2 from "./Vector2.js";

let gravityConst = 1;

class MassObj {
    constructor(position, radius, mass) {
        this.position = position;
        this.lasPosition = position.copy;
        this.velocity = new Vector2(0, 0);
        this.aceleration = new Vector2(0, 0);
        this.radius = radius;
        this.mass = mass;
        this.restitution = 1;
        this.colorStyle = "rgb(0, 255, 0)";

        // Set position
        this.setPosition(position);

        // set size
        this.setRadius(radius);

        this.collidingObjs = [];

        Game.instance.worldObjects.push(this);
    }

    update(delta) {
        let gravX = 0;
        let gravY = 0;

        let target;
        // loop through every obj in the world
        for (let i = 0; i < Game.instance.worldObjects.length; i++) {
            target = Game.instance.worldObjects[i];

            // if the object is not this one
            if (target != this) {
                // direction from this obj to the target obj
                let direction = new Vector2(
                    target.position.x - this.position.x,
                    target.position.y - this.position.y
                );

                // distance between this obj and the target obj
                let distance = Math.sqrt(
                    direction.x * direction.x + direction.y * direction.y
                );

                let directionNormalized = new Vector2(
                    direction.x / distance,
                    direction.y / distance
                );

                // if both objects are touching
                if (distance <= this.radius + target.radius) {
                    // if it is touching the sun, we'll remove it
                    if (target == Game.instance.sun) {
                        this.remove();
                        return;
                    }

                    const overlapDistance =
                        0.5 * (distance - this.radius - target.radius);

                    this.position = new Vector2(
                        this.position.x +
                            directionNormalized.x * overlapDistance,
                        this.position.y +
                            directionNormalized.y * overlapDistance
                    );

                    target.position = new Vector2(
                        target.position.x -
                            directionNormalized.x * overlapDistance,
                        target.position.y -
                            directionNormalized.y * overlapDistance
                    );

                    Game.instance.collidingPairs.push([this, target]);
                    this.collidingObjs.push(target);
                }

                gravX +=
                    directionNormalized.x *
                    ((gravityConst * target.mass) / (distance * distance));
                gravY +=
                    directionNormalized.y *
                    ((gravityConst * target.mass) / (distance * distance));
            }
        }

        this.aceleration = new Vector2(gravX, gravY);
    }

    setVelocity(newVelocity) {
        this.velocity = newVelocity;
    }

    setMass(mass) {
        this.mass = mass;
    }

    setRadius(radius) {
        this.radius = radius;
    }

    setPosition(newPosition) {
        this.position = newPosition;
    }

    remove() {
        // find the index in the array to remove this object
        const index = Game.instance.worldObjects.indexOf(this);
        // remove it from the array
        Game.instance.worldObjects.splice(index, 1);
    }
}

export default MassObj;
