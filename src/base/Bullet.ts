// Bullet.ts
import Phaser from "phaser";
import { Collidable, CollidableType } from "./Collidable";

export type BulletEffect =
	| { kind: "damage"; amount: number }
	| { kind: "explode"; radius: number; damage: number }
	| { kind: "slow"; factor: number; durationMs: number }
	| { kind: "pierce"; maxHits: number; damage: number };

export type ShooterLike = { x: number; y: number };

export interface BulletConfig {
	direction: Phaser.Math.Vector2;
	damage: number;
	speed: number;
	lifespanMs: number;
	effect: BulletEffect;
	owner?: unknown; // optional: store who fired it (player/enemy/etc.)
}

export const BulletFiles = [
	"Laser_Shot_1_008.png",
	"Shot_4_003.png",
	"Laser_Shot_3_008.png",
	"Shot_2_003.png",
	"Shot_5_003.png",
	"Laser_Shot_2_008.png",
	"Shot_3_003.png",
	"Shot_1_003.png",
] as const;



export type BulletType = typeof BulletFiles[number];

export class Bullet extends Phaser.Physics.Arcade.Sprite implements Collidable {
	private bornAt = 0;
	private lifespanMs = 800;
	public effect!: BulletEffect;
	public owner?: unknown;
	public type: CollidableType = CollidableType.BULLET;
	public damage: number = 0;
	public isActive: boolean = true;

	constructor(scene: Phaser.Scene, x: number, y: number, key: BulletType) {
		super(scene, x, y, key);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setRotation(Phaser.Math.DegToRad(90));
		this.setActive(false);
		this.setVisible(false);
		this.setCollideWorldBounds(true);
		this.setGravity(0, 0);
		this.scale = 0.2;
		this.setTexture(key);
		this.body!.enable = true;
		const size = Math.min(this.width, this.height);
		const radius = size * 0.3;
		this.body!.setCircle(
			radius,
			(this.width / 2 - radius) + 160,
			this.height / 2 - radius
		);
	}

	static preload(scene: Phaser.Scene) {
		const base = "assets/Ship_Effects/Fire_Shots/";
		let index = 0;
		for (const filename of BulletFiles) {
			const file = `${base}${filename}`;
			console.log("Preloading bullet file:", file);
			if (!scene.textures.exists(filename)) {
				scene.load.image(filename, file);
			}
			index++;
		}
	}


	fire(from: ShooterLike, direction: Phaser.Math.Vector2, config: BulletConfig, damage: number) {
		this.bornAt = this.scene.time.now;
		this.lifespanMs = config.lifespanMs;
		this.effect = config.effect;
		this.owner = config.owner;
		this.isActive = true;
		const dir = direction.clone().normalize();
		this.damage = damage;

		this.enableBody(true, from.x, from.y, true, true);
		this.setVelocity(dir.x * config.speed, dir.y * config.speed);
		// // Optional: rotate sprite towards travel direction
		// this.setRotation(dir.angle());
	}

	/** Called on collision / impact */
	onHit(target: Collidable) {
		// Apply effect logic:
		this.kill();
	}

	/** Return bullet to pool */
	kill() {
		this.disableBody(true, true);
		this.setActive(false);
		this.setVisible(false);
		this.body!.enable = false;
		this.isActive = false;
	}

	private withinHitHeight(): boolean {
		const height = this.scene.scale.height;
		return (this.y > height * 0.3 && this.y < height * 0.7);
	}

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);

		if (!this.active) return;

		if (time - this.bornAt >= this.lifespanMs) {
			this.kill();
			return;
		}

		// if hit right sideworld bounds, kill
		if (this.x > this.scene.scale.width && this.withinHitHeight()) {
			(this.scene as any).cometHit(this.damage);
			this.kill();
			return;
		}
	}
}
