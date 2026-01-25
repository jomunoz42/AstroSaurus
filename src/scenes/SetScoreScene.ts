
import { BaseScene } from '@/base/BaseScene';
import ScoreScene from './ScoreScene';

export default class SetScoreScene extends BaseScene {
    static readonly SCENE_KEY = 'SetScoreScene';

    private playerName = '';

    constructor() {
        super({ key: SetScoreScene.SCENE_KEY });
    }

    create(data: { finalScore: number }) {
        const { width, height } = this.scale;

        // Dark lava background
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x3a1a07, 1);

        // Soft ember atmosphere
        const glow = this.add.rectangle(width / 2, height / 2, width, height, 0xffa042, 0.12)
            .setBlendMode(Phaser.BlendModes.ADD);

        

        this.add.text(width / 2, height / 2.8, 'ENTER YOUR NAME', {
            fontSize: '70px',
            color: '#ffd37a',
            fontStyle: 'bold',
            stroke: '#3b1600',
            strokeThickness: 8
        }).setOrigin(0.5);

        

        const nameText = this.add.text(width / 2, height / 2.3, '_', {
            fontSize: '48px',
            color: '#ffb45a'
        }).setOrigin(0.5);

        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const finalScore = data.finalScore;
            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            }
            else if (event.key === 'Enter' && this.playerName.length > 0) {
                ScoreScene.insertScore(this.playerName, finalScore);
                this.scene.start('ScoreScene');
            }
            else if (event.key.length === 1 && this.playerName.length < 10) {
                this.playerName += event.key.toUpperCase();
            }

            nameText.setText(this.playerName || '_');
        });
    }
}