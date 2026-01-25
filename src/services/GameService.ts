import { Component, DivElement, Service } from "typecomposer";
import Phaser from "phaser";
import { BaseScene } from "@/base/BaseScene";
import { GameScene } from "@/scenes/game/GameScene";
import CutsceneScene from "@/scenes/CutScene";
import MenuScene from "@/scenes/MenuScene";
import SkinsScene from "@/scenes/SkinsScene";
import ControlsScene from "@/scenes/ControlScene";
import { ShipConfig } from "@/scenes/game/objects/Ship";
import shipConfig from "@/config/ship.config.json";
import PauseScene from "@/scenes/PauseScene";
import AudioScene from "@/scenes/AudioScene";
import ScoreScene from "@/scenes/ScoreScene";
import EndingScene from "@/scenes/EndingScene";
import SetScoreScene from "@/scenes/SetScoreScene";


@Service
export class GameService {

    readonly config!: Phaser.Types.Core.GameConfig;
    private game!: Phaser.Game;

    readonly container!: DivElement;

    readonly audio!: AudioScene;


    onCreate(parent: Component) {
        // @ts-ignore
        this.config = {
            type: Phaser.AUTO,
            parent,

            transparent: true,
            pixelArt: true,

            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    // debugShowBody: true,
                    // debugShowVelocity: false,
                    // debugBodyColor: 0xff0000 // vermelho },
                },
            },

            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: window.innerWidth,
                height: window.innerHeight,
            },

            // ORDEM IMPORTANTE
            scene: [
                AudioScene,
                MenuScene,
                GameScene,
                SkinsScene,
                ControlsScene,
                CutsceneScene,
                PauseScene,
                ScoreScene,
                EndingScene,
                SetScoreScene
            ],
        };

        this.game = new Phaser.Game(this.config);

        // garante áudio global sempre ativo
        this.game.scene.start(AudioScene.SCENE_KEY);

        window.addEventListener('resize', this.resize);
    }

    /* =======================
       Keyboard helpers
    ======================= */

    enebleKeyboardInput() {
        if (this.game.input.keyboard) {
            this.game.input.keyboard.enabled = true;
        }
    }

    disableKeyboardInput() {
        if (this.game.input.keyboard) {
            this.game.input.keyboard.enabled = false;
        }
    }

    /* =======================
       Scene control
    ======================= */

    // async loadScene(sceneKey: string, data?: any) {
    //     this.game.scene.start(sceneKey, data || {});
    // }

    launchScene(sceneKey: string, data?: any) {
        // this.game.scene.launch(sceneKey, data);
    }

    stopScene(sceneKey: string) {
        this.game.scene.stop(sceneKey);
    }

    pauseScene(sceneKey: string) {
        this.game.scene.sleep(sceneKey);
    }

    resumeScene(sceneKey: string) {
        this.game.scene.wake(sceneKey);
    }

    /* =======================
       Resize
    ======================= */

    private resize = () => {
        if (!this.game?.scale) return;
        this.game.scale.resize(window.innerWidth, window.innerHeight);
    };

    /* =======================
       Ship helpers (mantidos)
    ======================= */

    setSelectedShipIndex(index: number) {
        localStorage.setItem('selectedShipIndex', index.toString());
    }

    getSelectedShipIndex(): number {
        try {
            const index = localStorage.getItem('selectedShipIndex');
            return index ? parseInt(index) : 0;
        } catch {
            return 0;
        }
    }

    getShipConfig(): ShipConfig {
        const shipIndex = this.getSelectedShipIndex();
        // @ts-ignore
        return shipConfig.ships[shipIndex];
    }

    /* =======================
       Destroy (somente ao sair do app)
    ======================= */

    destroy() {
        window.removeEventListener('resize', this.resize);
        this.game.destroy(true);
    }
}
