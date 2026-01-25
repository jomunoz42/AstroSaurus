
import { BaseScene } from '@/base/BaseScene';

export default class EndingScene extends BaseScene {
    static readonly SCENE_KEY = 'EndingScene';

    constructor() {
        super({ key: EndingScene.SCENE_KEY });
    }

    preload() {
        this.load.image('ending_image', 'assets/ending_image.png');
        this.load.image('losing_image', 'assets/losing_image.png');
    }

    create(data: { finalScore: number, isWin: boolean }) {
        const { width, height } = this.scale;

        const isWin = data.isWin;

        if (isWin) {
            this.gameService.audio.playBackground('ending_music');
        } else {
            this.gameService.audio.playBackground('losing_sound');
        }

        const imageKey = isWin ? 'ending_image' : 'losing_image';

        this.add.image(width / 2, height / 2, imageKey)
            .setDisplaySize(width, height);


        const message = isWin ? 'YOU WIN!' : 'YOU LOSE';

        this.add.text(width / 2, height / 9, message, {
            fontSize: '100px',
            color: isWin ? '#ffd37a' : '#ff5555',
            fontStyle: 'bold',
            stroke: '#3b1600',
            strokeThickness: 10
        }).setOrigin(0.5);

        // Auto-advance after 5 seconds   only in win
        this.time.delayedCall(5000, () => {
            this.scene.start('SetScoreScene', { finalScore: data.finalScore });
        });
    }
}
