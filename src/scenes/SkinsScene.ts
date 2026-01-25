
import { BaseScene } from '@/base/BaseScene';
import shipConfig from "@/config/ship.config.json";
import Phaser from 'phaser';
import { DialogueBox } from './game/DialogueBox';
import { ShipConfig } from './game/objects/Ship';
import MenuScene from './MenuScene';
import CutsceneScene from './CutScene';

export default class SkinsScene extends BaseScene {
    static readonly SCENE_KEY = 'SkinsScene';

    constructor() {
        super({ key: SkinsScene.SCENE_KEY });
    }

    preload() {
        this.load.image('skins_image', 'assets/skins_image.png');
        const ships = shipConfig.ships;
        for (let i = 0; i < ships.length; i++) {
            const ship = ships[i];
            const key = ship.key;
            if (!this.textures.exists(key)) {
                const regex = /^Ship_0[1-3]\//;
                const result = key.replace(regex, "");
                this.load.image(key, result)
            }
        }
    }

    create() {
        const { width, height } = this.scale;
        // Background
        this.add.image(width / 2, height / 2, 'skins_image')
            .setDisplaySize(width, height);
        this.add.text(width / 2, 110, 'SELECT YOUR SHIP', {
            fontSize: '64px',
            color: '#ffd37a',
            fontStyle: 'bold',
            stroke: '#3b1600',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5);

        const menuX = 120;
        const menuY = height - 60;

        // -------------------------------
        // START BUTTON (bottom-left)
        // -------------------------------

        const startButton = this.add.rectangle(menuX, menuY - 70, 150, 50, 0x000000, 0.35)
            .setStrokeStyle(3, 0xffa940)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0xa56d28, 0.45);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x000000, 0.25);
        });

        startButton.on('pointerdown', () => {
            this.scene.start(CutsceneScene.SCENE_KEY);
            console.log('Returning to Menu Scene');
        });

        this.add.text(menuX, menuY - 70, 'START', {
            fontSize: '32px',
            color: '#d2a249',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // -------------------------------
        // MENU BUTTON (bottom-left)
        // -------------------------------

        const menuButton = this.add.rectangle(menuX, menuY, 150, 50, 0x000000, 0.35)
            .setStrokeStyle(3, 0xffa940)
            .setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setFillStyle(0xa56d28, 0.45);
        });

        menuButton.on('pointerout', () => {
            menuButton.setFillStyle(0x000000, 0.25);
        });

        menuButton.on('pointerdown', () => {
            this.scene.start(MenuScene.SCENE_KEY);
            console.log('Returning to Menu Scene');
        });

        this.add.text(menuX, menuY, 'MENU', {
            fontSize: '32px',
            color: '#d2a249',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // -------------------------------
        // SKIN SELECTION BOXES
        // -------------------------------

        const boxSize = 150;
        const spacing = 60;

        const startX = width / 2 - boxSize - spacing;

        const skinBoxes = [];

        const rows = 2;
        const cols = 3;

        const startY = height / 2 - boxSize / 2; // top row Y
        const rowSpacing = boxSize + 40;
        let indexShip = 0;
        const dialogStartX = startX - 80;
        const dialog = new DialogueBox(this.scene.scene, width - (dialogStartX * 2), height - 30, 160, dialogStartX, 0);
        let boxSelect: Phaser.GameObjects.Rectangle | null = null;
        const indexSelected = this.gameService.getSelectedShipIndex();

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (boxSize + spacing);
                const y = startY + row * rowSpacing;

                const index = row * cols + col;

                const box = this.add.rectangle(x, y, boxSize, boxSize, 0x000000, 0.25)
                    .setStrokeStyle(3, indexSelected === indexShip ? 0x00ff00 : 0xffa940)
                    .setInteractive({ useHandCursor: true });
                if (indexSelected === indexShip) {
                    boxSelect = box;
                }
                const ship: ShipConfig = shipConfig.ships[indexShip] as any;
                // Ship Image
                this.add.image(x, y - 10, ship.key)
                    .setScale(0.08)
                    .setRotation(Phaser.Math.DegToRad(90));

                box.on('pointerover', () => {
                    box.setFillStyle(0x000000, 0.45);
                    dialog.showShipInfo(ship);
                });

                box.on('pointerout', () => {
                    dialog.close(50);
                    box.setFillStyle(0x000000, 0.25);
                });

                box.on('pointerdown', () => {
                    if (boxSelect)
                        boxSelect.setStrokeStyle(3, 0xffa940);
                    boxSelect = box;
                    box.setStrokeStyle(5, 0x00ff00);
                    this.gameService.setSelectedShipIndex(index);
                    console.log(`Selected skin ${index + 1}`);
                });
                indexShip++;
                skinBoxes.push(box);
            }
        }

        //  this.add.existing();

    }
}