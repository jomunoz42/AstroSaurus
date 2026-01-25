export enum CollidableType {
	PLAYER = "player",
	ENEMY = "enemy",
	ASTEROID = "asteroid",
	BULLET = "bullet",
	POWERUP = "powerup",
	SHIP = "ship",
}

export interface Collidable {
	isActive: boolean;
	damage: number;
	type: CollidableType;
	x: number;
	y: number;
	onHit(target: Collidable): void;
}