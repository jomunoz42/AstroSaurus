

import { BaseScene } from '@/base/BaseScene';
import MenuScene from './MenuScene';

const AudioFiles = [
    'ending_music',
    'game_music1',
    'game_music2',
    'menu_music',
    'losing_sound'
] as const;

export type AudioFileKey = typeof AudioFiles[number];

export default class AudioScene extends BaseScene {
    static readonly SCENE_KEY: string = 'AudioScene';
    readonly controller: Map<string, Phaser.Sound.BaseSound> = new Map();
    backgroundMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: AudioScene.SCENE_KEY });
        // @ts-ignore
        this.gameService.audio = this;
        console.log("AudioScene constructor");
    }

    preload() {
        for (const audioKey of AudioFiles) {
            this.load.audio(audioKey, `assets/audio/${audioKey}.mp3`);
        }
    }

    play(music: string, isbackgroundMusic: boolean = false, isCheckPlaying: boolean = false): void {
        const sound = this.controller.get(music);
        if (sound && (!isCheckPlaying || !sound.isPlaying)) {
            sound.play();
            if (isbackgroundMusic) {
                this.backgroundMusic?.stop();
                this.backgroundMusic = sound;
            }
        }
    }

    playBackground(music: AudioFileKey): void {
        this.play(music, true, true);
    }

    stop(music: string): void {
        const sound = this.controller.get(music);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    create() {
        console.log("AudioScene create");

        for (const audioKey of AudioFiles) {
            const shouldLoop = (
                audioKey === 'menu_music' ||
                audioKey === 'game_music1' ||
                audioKey === 'game_music2'
            );
            this.createAudio(audioKey, shouldLoop);
        }

        this.scene.start(MenuScene.SCENE_KEY);
    };

    createAudio(key: string, loop: boolean = false, volume: number = 1): Phaser.Sound.BaseSound {
        const music = this.sound.add(key, {
            loop,
            volume
        });
        this.controller.set(key, music);
        return music;
    }

    tracks: AudioFileKey[] = ['game_music1', 'game_music2'];
    current = 0;

    audioFile(scene: BaseScene) {
        this.current = 0;
        const playNext = () => {
            const key = this.tracks[this.current];

            this.gameService.audio.playBackground(key);

            const sound = this.gameService.audio.controller.get(key);

            if (sound) {
                sound.once('complete', () => {
                    if (scene.isActive) {
                        this.current = (this.current + 1) % this.tracks.length;
                        playNext();
                    }
                });
            }
        };
        playNext();
    }
}