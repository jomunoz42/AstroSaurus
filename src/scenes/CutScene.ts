import { BaseScene } from "../base/BaseScene";
import { GameScene } from "./game/GameScene";
import Phaser from "phaser";

export default class CutsceneScene extends BaseScene {
	static readonly SCENE_KEY = "CutsceneScene";

	private images: string[] = [
		"1_no_edge",
		"2_no_edge",
		"3_no_edge",
		"4_no_edge",
	];

	private index = 0;
	private shownImages: Phaser.GameObjects.Image[] = [];
	private skipKey!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: CutsceneScene.SCENE_KEY });
	}

	preload() {
		for (const key of this.images) {
			this.load.image(key, `assets/CutScene_Intro/${key}.png`);
		}
	}

	create() {
		this.index = 0;
		this.shownImages = [];
		this.showNextImage();

		const imageTimer = this.time.addEvent({
			delay: 3000,
			loop: true,
			callback: () => this.showNextImage(),
		});

		this.skipKey = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.skipKey.on("down", () => {
			imageTimer.remove();
			this.scene.start(GameScene.SCENE_KEY);
		});

		this.scale.on("resize", () => {
			this.resizeLastImage();
		});

		// cleanup correto ao sair da scene
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			imageTimer.remove();
			this.shownImages.forEach(img => img.destroy());
			this.shownImages.length = 0;
		});
	}

	private showNextImage() {
		if (this.index >= this.images.length) {
			this.scene.start(GameScene.SCENE_KEY);
			return;
		}

		const image = this.add.image(0, 0, this.images[this.index])
			.setOrigin(0)
			.setAlpha(0)
			.setDepth(this.index); // garante empilhamento correto

		this.shownImages.push(image);
		this.resizeImageFullScreen(image);

		this.tweens.add({
			targets: image,
			alpha: 1,
			duration: 500,
			ease: "Power1",
		});

		this.index++;
	}

	private resizeLastImage() {
		const image = this.shownImages[this.shownImages.length - 1];
		if (image) {
			this.resizeImageFullScreen(image);
		}
	}

	private resizeImageFullScreen(image: Phaser.GameObjects.Image) {
		const { width, height } = this.scale;
		image.setDisplaySize(width, height);
		image.setPosition(0, 0);
	}
}
