
import { BaseScene } from '@/base/BaseScene';

export default class ScoreScene extends BaseScene {
    static readonly SCENE_KEY = 'ScoreScene';
    private static scores: { name: string; score: number }[] = [];

    constructor() {
        super({ key: ScoreScene.SCENE_KEY });
    }

    preload() {
        this.load.image('back_image', 'assets/back_image.png'); // later
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'back_image')
            .setDisplaySize(width, height);

        // Title
        this.add.text(width / 2, 80, 'HIGH SCORES', {
            fontSize: '60px',
            color: '#ffd37a',
            fontStyle: 'bold',
            stroke: '#3b1600',
            strokeThickness: 8,
        }).setOrigin(0.5);

        // Load scores
        ScoreScene.scores = ScoreScene.loadScores();
        console.log("Loaded scores:", ScoreScene.scores);

        // // Insert new score if provided
        // if (data.newScore !== undefined) {
        //     this.insertScore(data.newScore);
        //     this.saveScores();
        // }

        // Display scores
        const startY = 220;

        const rowWidth = 900;
        const rowHeight = 90;
        const rowX = width / 2.1;

        ScoreScene.scores.forEach((entry, index) => {
            const y = startY + index * 110;

            // Background row box
            this.add.rectangle(rowX, y, rowWidth, rowHeight, 0x000000, 0.35)
                .setStrokeStyle(3, 0xffa940)
                .setOrigin(0.5);

            // Your original text (unchanged)
            this.add.text(
                width / 2.1,
                y,
                `${index + 1}.  ${entry.name}  ->  ${entry.score}`,
                {
                    fontSize: '62px',
                    color: '#ffb45a',
                    stroke: '#3b1600',
                    strokeThickness: 8,
                }
            ).setOrigin(0.5);
        });

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
            fontStyle: 'bold',
        }).setOrigin(0.5);
    }

    // ------------------------
    // Score Logic
    // ------------------------

    static loadScores(): { name: string; score: number }[] {
        const data = localStorage.getItem('highscores');
        if (!data) {
            return [
                { name: '---', score: 0 },
                { name: '---', score: 0 },
                { name: '---', score: 0 },
                { name: '---', score: 0 },
                { name: '---', score: 0 }
            ];
        }
        return JSON.parse(data);
    }


    static insertScore(newName: string, newScore: number) {
        ScoreScene.scores = this.loadScores();

        this.scores.push({ name: newName, score: newScore });

        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 5);

        localStorage.setItem('highscores', JSON.stringify(this.scores));
    }
}