import { BaseScene } from "@/base/BaseScene";
import { Ship, ShipConfig } from "./objects/Ship";
import { AsteroidPool } from "@/base/AsteroidPool";
import Phaser from "phaser";
import { Bullet } from "@/base/Bullet";
import { Weapon } from "@/base/Weapon";
import { DialogueManager } from "./DialogueManager";


export class GameScene extends BaseScene {
	static readonly SCENE_KEY: string = 'GameScene';
	private shipConfig: ShipConfig;
	private ship: Ship;
	private asteroidPool: AsteroidPool;
	private enemy: Phaser.GameObjects.Sprite;
	private earthLifeBar: Phaser.GameObjects.Graphics;  // Nova barra de vida para "Earth"
	private enemyLifeBar: Phaser.GameObjects.Graphics;
	private playerLifeBar: Phaser.GameObjects.Graphics;
	private dialogueManager: DialogueManager;  // Instância do DialogueManager
	private scoreText: Phaser.GameObjects.Text;
	private enemyLife: number = 600;
	private earthLife: number = 540;
	private enemyLifeStart: number = 3500;
	private earthLifeStart: number = 540;

	constructor() {
		super({ key: GameScene.SCENE_KEY });
	}

	preload() {
		this.shipConfig = this.gameService.getShipConfig();
		this.load.image('space_background', 'assets/SBS - Seamless Space Backgrounds - Large 1024x1024/Large 1024x1024/Blue Nebula/Blue_Nebula_08-1024x1024.png');
		this.load.image('planet_03', 'assets/kenney_planets/Planets/planet03.png');
		this.load.spritesheet('asteroid', 'assets/Asteroids/Asteroid 01 - Explode.png', {
			frameWidth: 96,
			frameHeight: 96
		});
		this.load.image('player_picture', 'assets/Dialogue_Mini_Images/Standard_face.png');  // Imagem do personagem
		Ship.preload(this, this.shipConfig);
		Weapon.preload(this);
		Bullet.preload(this);
		this.load.audio('asteroid_hit', 'assets/audio/SoundEffects/asteroid-hitting-something-152511.mp3');

	}

	create() {
		super.create();
		this.enemyLife = this.enemyLifeStart;
		this.earthLife = this.earthLifeStart;
		localStorage.setItem("score", "0");
		this.anims.create({
			key: 'asteroid',
			frames: this.anims.generateFrameNumbers('asteroid', {
				start: 0,
				end: 7
			}),
			frameRate: 12,
			repeat: 0,
			hideOnComplete: true
		});
		this.anims.create({
			key: 'asteroid-main',
			frames: this.anims.generateFrameNumbers('asteroid', {
				start: 0,
				end: 7
			}),
			frameRate: 6,
			repeat: 0
		});
		this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'space_background')
			.setOrigin(0, 0)
			.setScrollFactor(0, 0);
		const planet = this.add
			.image(-50, window.innerHeight / 2, 'planet_03')
			.setScale(0.4);
		const asteroidMain = this.add.sprite(window.innerWidth + 60, window.innerHeight / 2, 'asteroid').setScale(15);

		this.tweens.add({
			targets: [planet, asteroidMain],
			rotation: Phaser.Math.PI2,
			duration: 120000,
			repeat: -1,
			ease: 'Linear'
		});

		Ship.createAnimations(this, this.shipConfig.key);
		this.asteroidPool = new AsteroidPool(this, "asteroid", 20);
		this.ship = this.addGameObject(new Ship(this.shipConfig, this));
		this.physics.add.collider(
			this.asteroidPool.group,
			this.ship.centerReference,
			(obj: any, target: any) => {
				if ("_shipOrigin" in obj) {
					const shipOrigin = (obj as any)._shipOrigin as Ship;
					shipOrigin.onHit(target);
					target.onHit(shipOrigin);
				}
				else {
					const shipOrigin = (target as any)._shipOrigin as Ship;
					obj.onHit(shipOrigin);
					shipOrigin.onHit(obj);
				}
			}
		);

		this.physics.add.collider(
			this.ship.weapon.group,
			this.asteroidPool.group,
			(obj: any, target: any) => {
				console.log("Bullet hit asteroid");
				obj.onHit(target);
				target.onHit(obj);
			}
		);

		this.physics.add.collider(
			this.asteroidPool.group,
			this.asteroidPool.group,
			(obj: any, target: any) => {
				obj.onHit(target);
			}
		);

		// Criando a nave do jogador

		// Criando um inimigo (asteróide)
		this.enemy = this.add.sprite(Phaser.Math.Between(400, 800), Phaser.Math.Between(100, 400), 'planet_08');
		this.enemy.setScale(0.1); // Ajustando o tamanho do inimigo

		//Inicializando DialogueManager
		this.dialogueManager = new DialogueManager(this);
		this.dialogueManager.showIntroDialogue();  // Mostra o primeiro diálogo ao iniciar

		// Inicializando as barras de vida
		this.createLifeBars();

		// ESC para abrir pausa
		const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		escKey.on("down", () => {
			if (!this.scene.isActive("PauseScene")) { // Verifica se a cena de pause não está ativa
				this.scene.launch("PauseScene");      // Lança a cena de pausa sem parar o jogo
				this.scene.pause();                   // Pausa o jogo atual
			} else {
				this.scene.resume("GameScene");       // Caso já tenha pausado, retoma o jogo
				this.scene.stop("PauseScene");         // Fecha a cena de pausa
			}
		});
		this.startAsteroidSpawner();
	}


	private startAsteroidSpawner() {
		const w = this.scale.width;
		const h = this.scale.height;

		this.time.addEvent({
			delay: 200,          // interval in ms
			loop: true,
			callback: () => {
				const x = w + 40;
				const y = Phaser.Math.Between(20, h - 20);

				// random angle mostly going left:
				// 180° is straight left; add +/- spread
				const spreadDeg = 35;
				const angle = Phaser.Math.DegToRad(
					180 + Phaser.Math.Between(-spreadDeg, spreadDeg)
				);

				const speed = Phaser.Math.Between(120, 260);
				const vx = Math.cos(angle) * speed;
				const vy = Math.sin(angle) * speed;

				// @ts-ignore
				this.asteroidPool.shoot({ x: x, y: y }, {
					direction: new Phaser.Math.Vector2(vx, vy),
					speed: speed,
					lifespanMs: 20000,
					effect: { kind: "impulse", force: 50 },
					damage: 20,
				});
			},
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
		this.updateLifeBars(this.ship.config);
		this.updateScore();
	}

	private updateScore() {
		const score = Number(localStorage.getItem("score") || "0");
		this.scoreText.setText(`Score: ${score}`);
	}

	private createLifeBars() {
		this.scoreText = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 20, `Score: 0`, {
			fontSize: '24px',
			fontFamily: 'Courier, sans-serif',
			color: '#ffffff',
			fontStyle: 'italic',
			align: 'right',
			stroke: '#000000',
			strokeThickness: 4
		}).setOrigin(1, 1);
		this.earthLifeBar = this.add.graphics();
		this.enemyLifeBar = this.add.graphics();
		this.playerLifeBar = this.add.graphics();
		this.createPlayerPicture();
	}

	private updateLifeBars(shipConfig: ShipConfig) {
		// console.log("Updating life bars: ", playerLife);
		this.updateEarthLifeBar(this.earthLife, this.earthLifeStart);
		this.updateEnemyLifeBar(this.enemyLife, this.enemyLifeStart);
		this.updatePlayerLifeBar(shipConfig.life, shipConfig.health);
		this.dialogueManager.updateDialogue(shipConfig.life, shipConfig.health, this.enemyLife, this.enemyLifeStart, this.earthLife, this.earthLifeStart);
	}

	// Atualiza a barra de vida da "Earth" (ao invés de player)
	private updateEarthLifeBar(currentValue: number, maxValue: number) {
		const maxWidth = this.cameras.main.width / 2 - 40; // Largura máxima da barra
		const height = 20;
		const x = 20;
		const y = 20;

		// Evita divisão por zero e limita o valor entre 0 e 1
		const percentage = Phaser.Math.Clamp(currentValue / maxValue, 0, 1);

		// Limpa a barra anterior
		this.earthLifeBar.clear();

		// Desenha a barra de vida proporcional
		this.earthLifeBar.fillStyle(0x00ff00, 1);
		this.earthLifeBar.fillRect(x, y, maxWidth * percentage, height);

		// Borda da barra
		this.earthLifeBar.lineStyle(2, 0x000000, 1);
		this.earthLifeBar.strokeRect(x, y, maxWidth, height);

		// Texto "Earth" abaixo da barra
		this.add.text(x + maxWidth / 2, y + height + 15, 'Earth', {
			fontSize: '24px',
			fontFamily: 'Courier, sans-serif',
			color: '#ffffff',
			fontStyle: 'italic',
			align: 'center',
			stroke: '#000000',
			strokeThickness: 4
		}).setOrigin(0.5);
	}


	private updateEnemyLifeBar(currentValue: number, maxValue: number) {
		const maxWidth = this.cameras.main.width / 2 - 40;
		const height = 20;
		const x = this.cameras.main.width - maxWidth - 20;
		const y = 20;

		// Calcula a porcentagem (0 a 1)
		const percentage = Phaser.Math.Clamp(currentValue / maxValue, 0, 1);

		// Limpa a barra anterior
		this.enemyLifeBar.clear();

		// Barra de vida do inimigo (vermelha)
		this.enemyLifeBar.fillStyle(0xff0000, 1);
		this.enemyLifeBar.fillRect(x, y, maxWidth * percentage, height);

		// Borda da barra
		this.enemyLifeBar.lineStyle(2, 0x000000, 1);
		this.enemyLifeBar.strokeRect(x, y, maxWidth, height);

		// Texto "Chicxulub" abaixo da barra
		this.add.text(x + maxWidth / 2, y + height + 15, 'Chicxulub', {
			fontSize: '24px',
			fontFamily: 'Courier, sans-serif',
			color: '#ffffff',
			fontStyle: 'italic',
			align: 'center',
			stroke: '#000000',
			strokeThickness: 4
		}).setOrigin(0.5);
	}


	private updatePlayerLifeBar(currentValue: number, maxValue: number) {
		const photoSize = 128;  // Tamanho da imagem do personagem
		const padding = 20;     // Espaço da borda da tela
		const maxWidth = photoSize;
		const height = 20;
		const x = padding;
		const y = this.cameras.main.height - photoSize - padding - 30;

		// Calcula a porcentagem (0 a 1)
		const percentage = Phaser.Math.Clamp(currentValue / maxValue, 0, 1);

		// Limpa a barra anterior
		this.playerLifeBar.clear();

		// Barra de vida do player (vermelha)
		this.playerLifeBar.fillStyle(0x00ff00, 1);
		this.playerLifeBar.fillRect(x, y, maxWidth * percentage, height);
		// Borda da barra
		this.playerLifeBar.lineStyle(2, 0x000000, 1);
		this.playerLifeBar.strokeRect(x, y, maxWidth, height);


	}


	private createPlayerPicture() {
		const photoSize = 128;  // Tamanho da imagem do personagem
		const padding = 20;     // Espaço da borda da tela
		const xPos = padding;
		const yPos = this.cameras.main.height - photoSize - padding;

		// Cria o fundo do quadrado primeiro
		const bg = this.add.graphics();
		bg.fillStyle(0x000000, 0.5); // fundo semi-transparente
		bg.fillRect(xPos, yPos, photoSize, photoSize);
		bg.lineStyle(2, 0xffffff, 1); // borda branca
		bg.strokeRect(xPos, yPos, photoSize, photoSize);

		// Cria a sprite da foto do jogador **depois** para garantir que fique acima do fundo
		this.add.sprite(
			xPos + photoSize / 2,
			yPos + photoSize / 2,
			'player_picture'
		)
			.setDisplaySize(photoSize, photoSize)
			.setOrigin(0.5, 0.5)
			.setDepth(1);
	}



	earthHit(damage: number) {
		this.earthLife -= damage;
		if (this.earthLife < 0) this.earthLife = 0;
		console.log("Earth was hit!");
		if (this.earthLife <= 0) {
			this.isActive = false;
			setTimeout(() => {
				const score = Number(localStorage.getItem("score") || "0");
				this.scene.start('EndingScene', { finalScore: score, isWin: false });
			}, 500);
		}
	}

	cometHit(damage: number) {
		this.enemyLife -= damage;
		if (this.enemyLife < 0) this.enemyLife = 0;
		if (this.enemyLife <= 0) {
			this.isActive = false;
			const score = Number(localStorage.getItem("score") || "0");
			console.log("Enemy defeated! Final score: ", score);
			setTimeout(() => {
				this.scene.start('EndingScene', { finalScore: score + 1000, isWin: true });
			}, 500);
		}
		console.log("Comet was hit!");
	}
}