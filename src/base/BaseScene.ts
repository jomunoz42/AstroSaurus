import Phaser from "phaser";
import { BaseObject } from "./BaseObject";
import { inject } from "typecomposer";
import { GameService } from "@/services/GameService";

export abstract class BaseScene extends Phaser.Scene {
    static readonly SCENE_KEY: string = 'BaseScene';
    readonly gameService = inject(GameService);
    public isActive = false;
    private gameObjects: Phaser.GameObjects.GameObject[] = [];

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    create(_data?: { [key: string]: any }) {
        this.isActive = true;
        this.gameObjects = [];
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.isActive = false);
    }

    init(data: { [key: string]: any }) {
        if (!data) return;
        const keys = Object.keys(data);
        for (const key of keys) {
            // @ts-ignore
            this[key] = data[key];
        }
    }

    addGameObject<T extends BaseObject>(gameObject: T): T {
        gameObject.onInit();
        this.add.existing(gameObject);
        this.gameObjects.push(gameObject);
        return gameObject;
    }

    update(time: number, delta: number): void {
        if (!this.isActive) return;
        try {
            for (const obj of this.gameObjects) {
                if ('update' in obj && typeof (obj as any).update === 'function') {
                    (obj as any).update(time, delta);
                }
            }
        } catch (error) {
        }
    }
}