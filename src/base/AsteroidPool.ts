// BulletPool.ts
import Phaser from "phaser";
import { ShooterLike } from "./Bullet";
import Asteroid, { AsteroidConfig } from "./Asteroid";

export class AsteroidPool {
	public readonly group: Phaser.Physics.Arcade.Group;

	constructor(
		private scene: Phaser.Scene,
		textureKey: string,
		poolSize = 50
	) {
		this.group = this.scene.physics.add.group({
			classType: Asteroid,
			maxSize: poolSize,
			runChildUpdate: true, // so Bullet.preUpdate runs
		});

		for (let i = 0; i < poolSize; i++) {
			const asteroid = new Asteroid(scene, -1000, -1000);
			this.group.add(asteroid, true);
			asteroid.kill();
		}
	}

	shoot(from: ShooterLike, config: AsteroidConfig): Asteroid | null {
		const asteroid = this.group.getFirstDead(false) as Asteroid | null;

		if (!asteroid) return null;

		asteroid.launch(from, config.direction, config);
		return asteroid;
	}
}
