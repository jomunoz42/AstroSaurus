import Phaser from "phaser";
import { Collidable, CollidableType } from "./Collidable";

export type AsteroidEffect = { kind: "impulse"; force: number };

export interface AsteroidConfig {
  damage: number;
  direction: Phaser.Math.Vector2;
  speed: number;
  lifespanMs: number;
  effect: AsteroidEffect;
  owner?: unknown;
}

export class Asteroid
  extends Phaser.Physics.Arcade.Sprite
  implements Collidable {
  private bornAt = 0;
  private lifespanMs = 2000;
  public effect!: AsteroidEffect;
  public owner?: unknown;
  public damage: number;
  public type: CollidableType = CollidableType.ASTEROID;
  private life: number = 5;
  private isAlive = true;
  public isActive = true;

  private readonly margin = 120;

  constructor(scene: Phaser.Scene, x: number, y: number, texture = "asteroid") {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  launch(
    from: { x: number; y: number },
    direction: Phaser.Math.Vector2,
    config: AsteroidConfig
  ) {
    this.bornAt = this.scene.time.now;
    this.lifespanMs = config.lifespanMs;
    this.effect = config.effect;
    this.owner = config.owner;
    this.damage = Number(config.damage);
    const dir = direction.clone().normalize();
    this.isAlive = true;
    this.isActive = true;
    this.isActive = true;
    this.setTexture("asteroid");
    this.setActive(true);
    this.enableBody(true, from.x, from.y, true, true);
    this.setVelocity(dir.x * config.speed, dir.y * config.speed);
    this.setVisible(true);
    this.setGravity(0, 0);
    this.body!.setSize(this.width * 0.35, this.height * 0.35);
    this.body!.setSize(this.width * 0.35, this.height * 0.35);

    this.life = 20;

    // If you scale asteroids, do it before hitbox setup
    // this.setScale(Phaser.Math.FloatBetween(0.6, 1.2));
  }

  static onChangeScore = (newScore: number) => { }
  /** Called on collision / impact */
  onHit(target: Collidable) {
    if (!this.isAlive) return;

    this.life -= target.type == this.type ? 1 : Number(target.damage);
    if (this.life <= 0 || target.type == CollidableType.SHIP) {
      this.isAlive = false;
      this.isActive = false;
      this.setGravity(0, 0);
      this.play("asteroid");
      const score = Number(localStorage.getItem("score") || "0") + 15;
      localStorage.setItem("score", score.toString());
      Asteroid.onChangeScore(score);
      this.scene.sound.play("asteroid_hit", { volume: 0.5 });
      setTimeout(() => this.kill(), 700);
      return;
    }

    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const len = Math.hypot(dx, dy) || 1;

    let nx = dx / len;
    let ny = dy / len;

    // optional minimum angle bias
    const min = 0.4;
    nx = Math.sign(nx) * Math.max(Math.abs(nx), min);
    ny = Math.sign(ny) * Math.max(Math.abs(ny), min);

    // 🔴 RENORMALIZE
    const nlen = Math.hypot(nx, ny);
    nx /= nlen;
    ny /= nlen;

    this.body!.velocity.x += nx * this.effect.force;
    this.body!.velocity.y += ny * this.effect.force;
  }

  kill() {
    this.x = -2000;
    this.y = -2000;
    this.body!.velocity.x = 0;
    this.body!.velocity.y = 0;
    this.isActive = false;
    this.disableBody(true, true);
    this.setActive(false);
    this.setVisible(false);
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

    const h = this.scene.scale.height;
    // TOP
    if (this.y < -this.margin) {
      this.y = -this.margin;
      this.body!.velocity.y *= -1;
    }

    // BOTTOM
    if (this.y > h + this.margin) {
      this.y = h + this.margin;
      this.body!.velocity.y *= -1;
    }

    // LEFT side earth loses health
    if (this.x < -this.margin && this.isActive && this.withinHitHeight()) {
      (this.scene as any).earthHit(this.damage);
      this.kill();
    }

    if (this.x > this.scene.scale.width + this.margin) {
      (this.scene as any).cometHit(this.damage * 3);
      this.kill();
    }
  }
}

export default Asteroid;
