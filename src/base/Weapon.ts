import Phaser from "phaser";
import { Bullet, BulletConfig, BulletType, ShooterLike } from "./Bullet";

export interface WeaponConfig {
	key: BulletType;
	damage: number;
	frameRate: number;
	frameCount: number;
	scale: number;
	loop: boolean;
	poolSize: number;
	sound: string;
}


export class Weapon {
	public readonly group: Phaser.Physics.Arcade.Group;

	constructor(
		private scene: Phaser.Scene,
		private config: WeaponConfig
	) {
		this.group = this.scene.physics.add.group({
			classType: Bullet,
			maxSize: config.poolSize,
			runChildUpdate: true, // so Bullet.preUpdate runs
		});
		console.log(`Weapon created with pool size: ${config.key}`);
		for (let i = 0; i < config.poolSize; i++) {
			const bullet = new Bullet(scene, -1000, -1000, config.key);
			this.group.add(bullet, true);
			bullet.kill();
		}
	}

	static preload(scene: Phaser.Scene) {
		const files = ['laser_sound1', 'laser_sound2', 'laser_sound3', 'laser_sound4', 'enemy_attack1'];
		for (const file of files) {
			if (!scene.textures.exists(file)) { scene.load.audio(file, `assets/audio/SoundEffects/${file}.mp3`); }
		}
	}

	shoot(from: ShooterLike, config: BulletConfig): Bullet | null {
		const bullet = this.group.getFirstDead(false) as Bullet | null;

		if (!bullet) return null;
		bullet.fire(from, config.direction, config, this.config.damage);
		this.scene.sound.play(this.config.sound);
		return bullet;
	}
}
