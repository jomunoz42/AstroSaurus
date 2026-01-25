import { BaseScene } from "@/base/BaseScene";
import { GameScene } from "./game/GameScene";
import MenuScene from "./MenuScene";
import Phaser from "phaser";

export default class PauseScene extends BaseScene {
    static readonly SCENE_KEY = "PauseScene";

    private resumeButton!: Phaser.GameObjects.Rectangle;
    private menuButton!: Phaser.GameObjects.Rectangle;
    private background!: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: PauseScene.SCENE_KEY });
    }

    create() {
        const { width, height } = this.scale;

        // Fundo preto semitransparente
        this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setOrigin(0.5)
            .setDepth(0);

        const buttonWidth = 300;
        const buttonHeight = 80;
        const centerX = width / 2;
        let startY = height / 2 - 50;
        const spacing = 120;

        // RESUME
        this.resumeButton = this.add.rectangle(centerX, startY, buttonWidth, buttonHeight, 0x000000, 0.6)
            .setStrokeStyle(3, 0xffa940)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(1);

        this.resumeButton.on('pointerover', () => {
            this.resumeButton.setFillStyle(0xa56d28, 0.45);
        });

        this.resumeButton.on('pointerout', () => {
            this.resumeButton.setFillStyle(0x000000, 0.25);
        });

        this.add.text(centerX, startY, "RESUME", { fontSize: "32px", color: "#d2a249", fontStyle: "bold" })
            .setOrigin(0.5)
            .setDepth(2);


        // MENU
        startY += spacing;
        this.menuButton = this.add.rectangle(centerX, startY, buttonWidth, buttonHeight, 0x000000, 0.6)
            .setStrokeStyle(3, 0xffa940)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(1);

        this.menuButton.on('pointerover', () => {
            this.menuButton.setFillStyle(0xa56d28, 0.45);
        });

        this.menuButton.on('pointerout', () => {
            this.menuButton.setFillStyle(0x000000, 0.25);
        });

        this.add.text(centerX, startY, "MENU", { fontSize: "32px", color: "#d2a249", fontStyle: "bold" })
            .setOrigin(0.5)
            .setDepth(2);

        // Botões
        this.resumeButton.on("pointerdown", () => this.closePause());
        this.menuButton.on("pointerdown", () => this.goToMenu());

        // ESC para "resume" direto
        const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on("down", () => this.closePause());

        // Redimensionamento da tela
        this.scale.on("resize", (gameSize: Phaser.Structs.Size) => this.resizeUI(gameSize));
    }

    private closePause() {
        this.scene.stop();                       // Fecha a cena de pausa
        this.scene.resume(GameScene.SCENE_KEY);  // Volta para o jogo
    }

    private goToMenu() {
        this.scene.stop(GameScene.SCENE_KEY);    // Fecha a cena do jogo
        this.scene.stop();                        // Fecha a cena de pausa
        this.scene.start(MenuScene.SCENE_KEY);   // Volta para o menu
    }

    private resizeUI(gameSize: Phaser.Structs.Size) {
        const w = gameSize.width;
        const h = gameSize.height;

        // Fundo
        if (this.background) {
            this.background.setPosition(w / 2, h / 2);
            this.background.setSize(w, h);
        }

        // Botões
        const buttonsY = [h / 2 - 50, h / 2 + 70];
        [this.resumeButton, this.menuButton].forEach((btn, i) => btn.setPosition(w / 2, buttonsY[i]));

        // Textos
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                if (child.text === "RESUME") child.setPosition(w / 2, buttonsY[0]);
                if (child.text === "MENU") child.setPosition(w / 2, buttonsY[1]);
            }
        });
    }
}
