class Vector2 {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static get zero() {
		return new Vector2(0, 0);
	}

	add(vector) {
		return new Vector2(
			this.x + vector.x,
			this.y +  vector.y
		);
	}

	substract(vector) {
		return new Vector2(
			this.x - vector.x,
			this.y -  vector.y
		);
	}

	multiplyByScalar(scalar) {
		return new Vector2(
			this.x * scalar,
			this.y * scalar
		);
	}

	scalarMultiply(scalar) {
		return new Vector2(
			this.x * scalar,
			this.y * scalar
		);
	}

	dotProduct(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}

	get magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	get normalized() {
		const factor = 1 / Math.sqrt(this.x * this.x + this.y * this.y);

		return new Vector2(
			this.x * factor,
			this.y * factor
		);
	}

	get copy() {
		return new Vector2(this.x, this.y);
	}

}