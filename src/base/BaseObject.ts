
export abstract class BaseObject extends Phaser.GameObjects.Container {

    readonly image: Phaser.Physics.Arcade.Image;

    constructor(scene: Phaser.Scene, texture: string = "") {
        super(scene);
        this.image = this.scene.physics.add.image(0, 0, texture);
        this.add(this.image);
    }

    abstract onInit(): void;

}