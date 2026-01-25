

import { BaseScene } from '@/base/BaseScene';
import ControlsScene from './ControlScene';
import SkinsScene from './SkinsScene';
import { GameScene } from './game/GameScene';
import ScoreScene from './ScoreScene';
import EndingScene from './EndingScene';

export default class MenuScene extends BaseScene {
    static readonly SCENE_KEY: string = 'MenuScene';

    constructor() { super({ key: MenuScene.SCENE_KEY }); }

    preload() {
        this.load.image('menu_image', 'assets/menu_image.png');
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'menu_image').setOrigin(0.5);
        console.log("create");
        bg.setDisplaySize(width, height);
        this.gameService.audio.playBackground('menu_music');

        const audio = this.gameService.audio as any;

        audio.playBackground('menu_music');

        // ---- BUTTON POSITIONS (match your artwork) ----
        const buttonWidth = 250;
        const buttonHeight = 80;

        const centerX = width / 2.20 - 110;

        const startY = height / 1.85 - 40;
        const spacing = 130;

        const buttons = [
            { label: 'PLAY', y: startY },
            { label: 'SCOREBOARD', y: startY + spacing },
            { label: 'CONTROLS', y: startY + spacing * 2 },
        ];

        buttons.forEach(btn => {

            const button = this.add.rectangle(centerX, btn.y, buttonWidth, buttonHeight, 0x000000, 0.60)
                .setStrokeStyle(3, 0xffa940)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            const text = this.add.text(centerX, btn.y, btn.label, {
                fontSize: '32px',
                color: '#d2a249',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Glow overlay
            const glow = this.add.rectangle(centerX, btn.y, buttonWidth + 10, buttonHeight + 10, 0xffc36a, 0.15)
                .setOrigin(0.5)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setAlpha(0);

            const group = [button, text];

            // Hover effects
            button.on('pointerover', () => {
                this.tweens.add({ targets: glow, alpha: 0.5, duration: 120 });
                this.tweens.add({ targets: group, y: '-=2', duration: 80 });
            });

            button.on('pointerout', () => {
                this.tweens.add({ targets: glow, alpha: 0, duration: 120 });
                this.tweens.add({ targets: group, y: '+=2', duration: 80 });
            });

            button.on('pointerdown', () => {
                this.cameras.main.shake(120, 0.004);

                switch (btn.label) {
                    case 'PLAY':
                        this.scene.start(SkinsScene.SCENE_KEY);
                        // this.scene.start('EndingScene', { finalScore: 2 });
                        break;
                    case 'SCOREBOARD':
                        this.scene.start(ScoreScene.SCENE_KEY);
                        break;
                    case 'CONTROLS':
                        this.scene.start(ControlsScene.SCENE_KEY);
                        break;
                }
            });
        });
    };
}