import { BaseObject } from "@/base/BaseObject";
import { Collidable, CollidableType } from "@/base/Collidable";
import { Weapon, WeaponConfig } from "@/base/Weapon";
import weaponConfig from "@/config/weapon.config.json";
import Phaser from "phaser";

export interface ShipConfig {
    key: string;
    name: string;
    description: string;
    life: number;
    speed: number;
    health: number;
    attack: number;
    weapon: number;
}

export class Ship extends BaseObject implements Collidable {
    static EXHAUST_FRAME_KEYS: string[] = [];
    static EXPLOSION_FRAME_KEYS: string[] = [];

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private frameKeysIndex: number = 0;
    private fireCooldownMs: number;
    private lastFiredAt: number;
    public centerReference: Phaser.Physics.Arcade.Image;
    private keys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key };
    private weapons: Weapon[] = []
    private isAlive = true;
    private animationLoop: Phaser.Time.TimerEvent;
    public damage: number = 20;
    public type = CollidableType.SHIP;
    public isActive: boolean = true;


    constructor(public readonly config: ShipConfig, scene: Phaser.Scene) {
        super(scene);
        this.config.life = config.health;
        console.log(`Creating ship: ${config.name} with life: ${this.config.life}`);
        this.image.setTexture(Ship.EXHAUST_FRAME_KEYS[0]);
    }

    get weapon() {
        return this.weapons[0]
    }

    static preload(scene: Phaser.Scene, config: ShipConfig) {
        const match = config.key.match(/\/assets\/(Ship_0[1-3])\//);
        const folder = match ? match[1] : "";
        const matchIndex = config.key.match(/Exhaust_(\d+)_\d+_\d+\.png/);
        const index = parseInt(matchIndex?.[1] || "1");
        const EXHAUST_FRAME_KEYS = Array.from({ length: 10 }, (_, i) =>
            `Exhaust_${index}_1_${i.toString().padStart(3, "0")}`
        );
        for (let i = 0; i < EXHAUST_FRAME_KEYS.length; i++) {
            const file = `assets/${folder}/Exhaust/${EXHAUST_FRAME_KEYS[i]}.png`;
            if (!scene.textures.exists(file)) {
                scene.load.image(file, file);
            }
            EXHAUST_FRAME_KEYS[i] = file;
        }
        Ship.EXHAUST_FRAME_KEYS = EXHAUST_FRAME_KEYS;
        const EXPLOSION_FRAME_KEYS = Array.from({ length: 10 }, (_, i) =>
            `Explosion_${index}_${i.toString().padStart(3, "0")}`
        );
        for (let i = 0; i <= 8; i++) {
            const file = `assets/${folder}/Explosion/${EXPLOSION_FRAME_KEYS[i]}.png`;
            if (!scene.textures.exists(file)) {
                scene.load.image(file, file);
            }
            EXPLOSION_FRAME_KEYS[i] = file;
        }
        Ship.EXPLOSION_FRAME_KEYS = EXPLOSION_FRAME_KEYS;
    }

    static createAnimations(scene: Phaser.Scene, key: string) {
        if (scene.anims.exists(key)) return;
        scene.anims.create({
            key: key,
            frames: Ship.EXHAUST_FRAME_KEYS.map((k) => ({ key: k })),
            frameRate: 12,
            repeat: -1,
        });
    }

    public onHit(target: Collidable) {
        if (!this.isAlive || !target.isActive) return;

        this.config.life -= (target.damage || 0);
        if (this.config.life < 0) this.config.life = 0;
        this.onChangeLife(this.config.life);
        if (this.config.life <= 0) {
            this.explosion();
            setTimeout(() => {
                const score = Number(localStorage.getItem("score") || "0");
                this.scene.scene.start('EndingScene', { finalScore: score, isWin: false });
            }, 2000);
        }
        console.log(`Ship got hit! Remaining life: ${this.config.life}`);
    }

    onChangeLife = (newLife: number) => { }

    explosion() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.isActive = false;
        this.animationLoop.remove(false);
        this.image.setTexture(Ship.EXPLOSION_FRAME_KEYS[0]);
        this.animationLoop = this.scene.time.addEvent({
            delay: 1000 / 12, // ~12 fps
            loop: true,
            callback: () => {
                this.frameKeysIndex++;
                if (this.frameKeysIndex >= Ship.EXPLOSION_FRAME_KEYS.length) {
                    console.log("Ship explosion animation ended, hiding ship.");
                    this.image.setVisible(false);
                    this.animationLoop.remove(); // para o timer
                    return;
                }
                this.image.setTexture(Ship.EXPLOSION_FRAME_KEYS[this.frameKeysIndex]);
            },
        });
    }

    onInit() {
        this.fireCooldownMs = 150;
        this.lastFiredAt = 0;
        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.scale = 0.1;
        this.setPosition(100, 200);
        this.image.setRotation(Phaser.Math.DegToRad(90));
        this.image.setCollideWorldBounds(true);
        this.centerReference = this.scene.physics.add.image(this.x, this.y, "");
        this.centerReference.setCollideWorldBounds(true);
        this.centerReference.setVisible(false);
        this.centerReference.setSize(this.image.width * this.scale, this.image.height * this.scale);
        this.keys = this.scene.input.keyboard!.addKeys('W,A,S,D,E') as unknown as {
            W: Phaser.Input.Keyboard.Key;
            A: Phaser.Input.Keyboard.Key;
            S: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
            E: Phaser.Input.Keyboard.Key;
        };

        this.animationLoop = this.scene.time.addEvent({
            delay: 1000 / 12, // ~12 fps
            loop: true,
            callback: () => {
                this.frameKeysIndex = (this.frameKeysIndex + 1) % Ship.EXHAUST_FRAME_KEYS.length;
                this.image.setTexture(Ship.EXHAUST_FRAME_KEYS[this.frameKeysIndex]);
            },
        });
        const weaponCfg: WeaponConfig = weaponConfig.weapon[this.config.weapon] as WeaponConfig;
        this.weapons = [new Weapon(this.scene, weaponCfg)];

        (this.centerReference as any)._shipOrigin = this;
    }


    update(time: number) {
        if (!this.isAlive) return;
        this.centerReference.setVelocity(0);

        if (this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P).isDown) {
            this.explosion();
        }

        // Left / Right => X
        if (this.cursors.left?.isDown || this.keys.A?.isDown) this.centerReference.setVelocityX(-this.config.speed);
        else if (this.cursors.right?.isDown || this.keys.D?.isDown) this.centerReference.setVelocityX(this.config.speed);

        // Up / Down => Y
        if (this.cursors.up?.isDown || this.keys.W?.isDown) this.centerReference.setVelocityY(-this.config.speed);
        else if (this.cursors.down?.isDown || this.keys.S?.isDown) this.centerReference.setVelocityY(this.config.speed);

        // keep container in sync with physics sprite
        this.x = this.centerReference.x;
        this.y = this.centerReference.y;

        if (this.cursors.space.isDown || this.keys.E?.isDown) {
            this.tryFire(time);
        }
    }

    tryFire(time: number) {
        if (time - this.lastFiredAt < this.fireCooldownMs) return;
        this.w
        this.lastFiredAt = time;
        for (const weapon of this.weapons) {
            weapon.shoot(this, {
                direction: new Phaser.Math.Vector2(
                    Math.cos(Phaser.Math.DegToRad(this.angle)),
                    Math.sin(Phaser.Math.DegToRad(this.angle))
                ),
                speed: 500,
                lifespanMs: 2000,
                owner: this,
                damage: this.config.attack,
            } as any);
        }
        // this.shootBulletFrom({ x: this.x, y: this.y }, {
        //     direction: new Phaser.Math.Vector2(
        //         Math.cos(Phaser.Math.DegToRad(this.angle)),
        //         Math.sin(Phaser.Math.DegToRad(this.angle))
        //     ),
        //     speed: 500,
        //     lifespanMs: 2000,
        //     owner: this,
        // } as any)
    }

    // shootBulletFrom(shooter: ShooterLike, config: BulletConfig) {
    //     this.Weapon.shoot(shooter, config);
    // }
}