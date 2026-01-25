
import { BaseScene } from '@/base/BaseScene';

export default class ControlsScene extends BaseScene {
    static readonly SCENE_KEY = 'ControlsScene';

    constructor() {
        super({ key: ControlsScene.SCENE_KEY });
        console.log("ControlsScene")
    }

    preload() {
        this.load.image('back_image', 'assets/back_image.png'); // later
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'back_image')
            .setDisplaySize(width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // Title
        this.add.text(centerX, 80, 'CONTROLS', {
            fontSize: '60px',
            color: '#ffd37a',
            fontStyle: 'bold',
            stroke: '#3b1600',
            strokeThickness: 8,
        }).setOrigin(0.5);

        // -------------------------------
        // MENU BUTTON (bottom-left)
        // -------------------------------

        const menuX = 120;
        const menuY = height - 60;

        const menuButton = this.add.rectangle(menuX, menuY, 150, 50, 0x000000, 0.35)
            .setStrokeStyle(3, 0xffa940)
            .setInteractive({ useHandCursor: true });

        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        const menuText = this.add.text(menuX, menuY, 'MENU', {
            fontSize: '32px',
            color: '#d2a249',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // ----- KEY STYLE FUNCTION -----
        const makeKey = (x: number, y: number, label: string) => {
            const key = this.add.rectangle(x, y, 70, 70, 0x000000, 0.6)
                .setStrokeStyle(3, 0xffa940);
            const text = this.add.text(x, y, label, {
                fontSize: '28px',
                color: '#ffd37a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            return { key, text };
        };

        // ----- WASD BLOCK (CENTERED) -----
        const keySpacing = 80;

        const wY = centerY - 190;
        const aY = centerY - 100;
        const sY = centerY - 20;
        const dY = centerY - 100;
        const downY = centerY - 90;

        const w = makeKey(centerX, wY, 'W');
        const a = makeKey(centerX - 30 - keySpacing, aY, 'A');
        const s = makeKey(centerX, downY, 'S');
        const d = makeKey(centerX + 30 + keySpacing, dY, 'D');
        const ESC = makeKey(centerX - 250 - keySpacing, downY - 130, 'ESC');

        // Labels
        this.add.text(centerX, wY - 60, 'UP', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.text(centerX - keySpacing - 120, aY, 'LEFT', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.text(centerX, downY + 60, 'DOWN', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.text(centerX + keySpacing + 120, dY, 'RIGHT', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.text(centerX - 250 - keySpacing, downY - 70, 'PAUSE', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // -----------SPACE---------------
        const spaceY = centerY + 20;
        const space = this.add.rectangle(centerX, spaceY + 50, 200, 70, 0x000000, 0.6)
            .setStrokeStyle(3, 0xffa940);
        const spaceText = this.add.text(centerX, spaceY + 50, 'SPACE', {
            fontSize: '28px',
            color: '#ffd37a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, spaceY + 110, 'FIRE WEAPON', {
            color: '#ffb45a',
            fontSize: '20px',
            stroke: '#3b1600',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // // ----- MOUSE -----
        // const mouseY = centerY + 160;

        // const mouse = this.add.graphics();

        // // Body
        // mouse.fillStyle(0x000000, 0.6);
        // mouse.lineStyle(3, 0xffa940);

        // const bodyWidth = 90;
        // const bodyHeight = 120;
        // const radius = 28;

        // mouse.strokeRoundedRect(
        //     centerX - bodyWidth / 2,
        //     mouseY - bodyHeight / 2,
        //     bodyWidth,
        //     bodyHeight,
        //     radius
        // );

        // // Middle divider
        // mouse.lineBetween(
        // centerX,
        // mouseY - bodyHeight / 2 + 10,
        // centerX,
        // mouseY + bodyHeight / 2 - 10
        // );

        // // Scroll wheel
        // mouse.fillRoundedRect(
        // centerX - bodyWidth / 2,
        // mouseY - bodyHeight / 2,
        // bodyWidth,
        // bodyHeight,
        // radius
        // );

        // mouse.fillStyle(0xffa940, 0.8);
        // mouse.fillRoundedRect(centerX - 5, mouseY - 20, 10, 25, 5);

        //     this.add.text(centerX - 80, mouseY - 40, 'LEFT CLICK\nQUICK ATTACK', {
        //         fontSize: '18px',
        //         color: '#ffd37a',
        //         align: 'right',
        //         stroke: '#3b1600',
        //         strokeThickness: 4,
        //     }).setOrigin(1, 0.5);

        //     this.add.text(centerX + 80, mouseY - 40, 'RIGHT CLICK\nSTRONG ATTACK', {
        //         fontSize: '18px',
        //         color: '#ffd37a',
        //         align: 'left',
        //         stroke: '#3b1600',
        //         strokeThickness: 4,
        //     }).setOrigin(0, 0.5);
    }
}