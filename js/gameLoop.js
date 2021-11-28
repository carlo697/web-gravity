import MassObj from "./MassObj.js";
import Vector2 from "./Vector2.js";

let lastFrameTime = 0;

// fps counter
const physicsFPSCounter = document.querySelector("#physicsFPS");
const physicsFrameRegister = [];
let physicsFrameIndex = 0;

const FPSCounter = document.querySelector("#FPS");
let renderFrameAccumulated = 0;
const frameRegister = [];
let frameIndex = 0;

// world variables
const worldRoot = document.querySelector(".world");
export const worldObjects = [];
let mousePos;

// physics
const worldCenter = new Vector2(0, 0);
const worldSize = new Vector2(1000, 1000);

// render
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let renderCount = 0;
const skipFrames = 2;

// trails
const trailLines = [];
let trailFrameCount = 0;
let skipTrailFrames = 20;

// navigation
const navButtonsContainer = document.querySelector(".navigation");

// mouse
window.addEventListener("load", init);

// physics
export let collidingPairs = [];

export let sun;

//handleResize();

function init() {
  sun = new MassObj(worldCenter, 15, 30000);

  sun.colorStyle = "rgb(255, 255, 255)";

  for (let i = 0; i < 400; i++) {
    const x = worldCenter.x + (Math.random() * 2 - 1) * 300;
    const y = worldCenter.y + (Math.random() * 2 - 1) * 300;

    const size = 0.5 + Math.random() * 1;

    const obj = new MassObj(new Vector2(x, y), size, size * size * 4);

    // get tangent direction
    const dirr = sun.position.substract(obj.position);
    const distance = dirr.magnitude;
    const dirrNormalized = dirr.normalized;

    const random = 1 + (Math.random() * 2 - 1) * 0.1;

    // apply velocity to orbit around the sun
    obj.velocity = new Vector2(
      -dirrNormalized.y * Math.sqrt(sun.mass / distance) * random,
      dirrNormalized.x * Math.sqrt(sun.mass / distance) * random
    );

    // get random color
    const r = 55 + Math.random() * 200;
    const g = 55 + Math.random() * 200;
    const b = 55 + Math.random() * 200;
    obj.colorStyle = `rgb(${r},${g},${b})`;
  }

  /*
	let center = new Vector2(200, 100);

	new MassObj(
			center,
			15,
			30000,
	).velocity = new Vector2(-10, 20);
	*/

  // start game loop
  requestAnimationFrame(loop);
}

function loop(elapsed) {
  // elapsed time since last frame
  let delta = (elapsed - lastFrameTime) / 1000;

  // pause everything for a moment at the beginning
  if (elapsed < 4000) {
    delta = 0;
  }

  // if it's running too slow (or when it seems so), reset the delta
  if (delta > 0.5) {
    delta = 0;
  }

  // register frame duration in seconds
  physicsFrameRegister[physicsFrameIndex] = 1 / delta;
  physicsFrameIndex++;
  // reset the register index to zero
  if (physicsFrameIndex > 100) {
    physicsFrameIndex = 0;
  }
  // get the average fps
  let physicsFPS = physicsFrameRegister.reduce((sum, value) => sum + value, 0);
  physicsFPS /= physicsFrameRegister.length;
  physicsFPSCounter.textContent = physicsFPS.toFixed(1);

  // update loop
  update(delta);

  renderFrameAccumulated += delta;

  // render loop
  if (renderCount === skipFrames) {
    render(renderFrameAccumulated);

    // register frame duration in seconds
    frameRegister[frameIndex] = 1 / renderFrameAccumulated;
    frameIndex++;
    // reset the register index to zero
    if (frameIndex > 100) {
      frameIndex = 0;
    }
    // get the average fps
    let FPS = frameRegister.reduce((sum, value) => sum + value, 0);
    FPS /= frameRegister.length;
    FPSCounter.textContent = FPS.toFixed(1);

    renderFrameAccumulated = 0;
    renderCount = 0;
  } else {
    renderCount++;
  }

  // request new frame
  lastFrameTime = elapsed;
  requestAnimationFrame(loop);
}

function render(delta) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
  context.translate(window.innerWidth / 2, window.innerHeight / 2);
  context.scale(cameraZoom, cameraZoom);
  context.translate(
    -window.innerWidth / 2 + cameraOffset.x,
    -window.innerHeight / 2 + cameraOffset.y
  );
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // rendering
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw circles
  let obj = null;
  for (let i = 0; i < worldObjects.length; i++) {
    obj = worldObjects[i];

    /*
		// skip the circle if it's outside of the screen
		if (obj.position.x < 0 || obj.position.y < 0 || obj.position.x > context.width || obj.position.y > context.height) {
			continue;
		}
		*/

    // draw a square
    /*context.fillRect(
	    	obj.position.x - obj.radius,
	    	obj.position.y - obj.radius,
	    	obj.radius * 2,
	    	obj.radius * 2
    	);*/

    // draw a circle
    context.fillStyle = obj.colorStyle;
    context.beginPath();
    context.arc(obj.position.x, obj.position.y, obj.radius, 0, 2 * Math.PI);
    context.fill();

    /*context.beginPath();
		context.moveTo(obj.position.x, obj.position.y);
		context.lineTo(obj.position.x + obj.velocity.x * 0.4, obj.position.y + obj.velocity.y * 0.4);
		context.stroke();*/
  }

  context.strokeStyle = "red";

  for (let i = trailLines.length - 1; i >= 0; i--) {
    obj = trailLines[i];

    context.beginPath();
    context.moveTo(obj.startX, obj.startY);
    context.lineTo(obj.endX, obj.endY);
    context.stroke();

    obj.lifetime += delta;
    if (obj.lifetime > obj.time) {
      trailLines.splice(i, 1);
    }
  }
}

function findCollidingObjs(obj, group) {
  group.push(obj);
  obj.trailRendered = true;

  for (let i = 0; i < obj.collidingObjs.length; i++) {
    /*
		let included = false;

		for (let j = 0; j < group.length; j++) {
			if (group[j] === obj.collidingObjs[i]) {
				included = true;
				break;
			}
		}

		if (!included) {
			findCollidingObjs(obj.collidingObjs[i], group);
		}
		*/
    if (!obj.collidingObjs[i].trailRendered) {
      findCollidingObjs(obj.collidingObjs[i], group);
    }
  }
}

let trailGroups = [];

function update(delta) {
  if (sun) {
    sun.velocity = Vector2.zero;
  }

  // update positions and velocities
  let obj;
  for (let i = 0; i < worldObjects.length; i++) {
    obj = worldObjects[i];

    //obj.setVelocity(obj.velocity.add(obj.aceleration.scalarMultiply(delta)));
    //obj.setPosition(obj.position.add(obj.velocity.scalarMultiply(delta)));

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
  for (var i = 0; i < worldObjects.length; i++) {
    worldObjects[i].update(delta);
  }

  if (trailFrameCount >= skipTrailFrames) {
    for (let i = 0; i < trailGroups.length; i++) {
      const group = trailGroups[i];

      if (group.objs.length < 3) {
        continue;
      }

      let x = 0;
      let y = 0;

      for (let j = 0; j < group.objs.length; j++) {
        x += group.objs[j].position.x;
        y += group.objs[j].position.y;
      }

      x /= group.objs.length;
      y /= group.objs.length;

      group.endX = x;
      group.endY = y;

      trailLines.push({
        startX: group.startX,
        startY: group.startY,
        endX: group.endX,
        endY: group.endY,
        lifetime: 0,
        time: 25,
      });
    }

    trailGroups.length = 0;

    for (var i = 0; i < worldObjects.length; i++) {
      worldObjects[i].trailRendered = false;
    }

    trailFrameCount = 0;
  }

  if (trailFrameCount === 0) {
    // render trails
    for (var i = 0; i < worldObjects.length; i++) {
      obj = worldObjects[i];

      if (obj.trailRendered) {
        continue;
      }

      if (obj.collidingObjs.length > 0) {
        const group = {
          startX: 0,
          startY: 0,
          objs: [],
        };

        findCollidingObjs(obj.collidingObjs[0], group.objs);
        trailGroups.push(group);

        let x = 0;
        let y = 0;

        for (let j = 0; j < group.objs.length; j++) {
          x += group.objs[j].position.x;
          y += group.objs[j].position.y;
        }

        x /= group.objs.length;
        y /= group.objs.length;

        group.startX = x;
        group.startY = y;
      }
    }
  }

  trailFrameCount++;

  for (var i = 0; i < worldObjects.length; i++) {
    worldObjects[i].collidingObjs.length = 0;
  }

  // iterate through collisions
  for (var i = 0; i < collidingPairs.length; i++) {
    const a = collidingPairs[i][0];
    const b = collidingPairs[i][1];

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
  collidingPairs.length = 0;
}

let scale = 1;
