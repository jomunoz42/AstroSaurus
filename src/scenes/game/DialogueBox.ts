import * as Phaser from "phaser";
import { ShipConfig } from "./objects/Ship";

export class DialogueBox {
  private scene: Phaser.Scene;
  private dialogueBg: Phaser.GameObjects.Rectangle;
  private dialogueText: Phaser.GameObjects.Text;
  private dialogueTextShipAtributes: Phaser.GameObjects.Container;
  private dialoguePhoto: Phaser.GameObjects.Image;
  private timeoutId: number | null = null;

  constructor(scene: Phaser.Scene, width = 800, height = 600, dialogueHeight = 120, x = 0, y = 0) {
    this.scene = scene;
    console.log("Creating DialogueBox at:", x, y, "with size:", width, dialogueHeight);

    this.dialogueBg = this.scene.add.rectangle(x, y + height - dialogueHeight, width, dialogueHeight, 0xffffff, 0.7)
      .setOrigin(0)
      .setDepth(1000);

    this.dialoguePhoto = this.scene.add.image(x + 20, y + height - dialogueHeight / 2, "photoKey")
      .setOrigin(0, 0.5)
      .setDepth(1001)
      .setDisplaySize(128, 128);

    this.dialogueText = this.scene.add.text(x + 140, y + height - dialogueHeight / 2, "", {
      fontSize: "20px",
      color: "#000000",
      wordWrap: { width: width - 160 }
    })
      .setOrigin(0, 0.5)
      .setDepth(1001);

    const yLine = y + height - 30;

    this.dialogueTextShipAtributes = this.scene.add.container(x + 140, yLine)
      .setDepth(1001);


    const lifeText = this.scene.add.text(0, 0, "Life: 100", {
      fontSize: "18px",
      color: "#f39c12"
    }).setOrigin(0, 0.5);

    const speedText = this.scene.add.text(120, 0, "Speed: 50", {
      fontSize: "18px",
      color: "#3498db"
    }).setOrigin(0, 0.5);

    const attackText = this.scene.add.text(240, 0, "Attack: 30", {
      fontSize: "18px",
      color: "#e74c3c"
    }).setOrigin(0, 0.5);

    this.dialogueTextShipAtributes.add([lifeText, speedText, attackText]);

    this.dialogueBg.setVisible(false);
    this.dialoguePhoto.setVisible(false);
    this.dialogueText.setVisible(false);
    this.dialogueTextShipAtributes.setVisible(false);
  }

  close(duration = 0) {

    this.timeoutId = setTimeout(() => {
      this.dialogueBg.setVisible(false);
      this.dialoguePhoto.setVisible(false);
      this.dialogueText.setVisible(false);
      this.dialogueTextShipAtributes.setVisible(false);
    }, duration);
  }

  show(text: string, photoKey: string | null, duration = 3000) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (photoKey) this.dialoguePhoto.setTexture(photoKey);
    this.dialogueBg.setVisible(true);
    this.dialoguePhoto.setVisible(photoKey !== null);
    this.dialogueText.setText(text);
    this.dialogueText.setVisible(true);

    this.scene.time.delayedCall(duration, () => this.close());
  }

  showShipInfo(ship: ShipConfig) {
    const duration = 99999999;
    const text = `\n${ship.name.toUpperCase()}\n\n${ship.description}\n\n\n\n`;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    for (const child of this.dialogueTextShipAtributes.list) {
      if (child instanceof Phaser.GameObjects.Text) {
        if (child.text.startsWith("Life:")) {
          child.setText(`Life: ${ship.health}`);
        } else if (child.text.startsWith("Speed:")) {
          child.setText(`Speed: ${ship.speed}`);
        } else if (child.text.startsWith("Attack:")) {
          child.setText(`Attack: ${ship.attack}`);
        }
      }
    }
    this.dialogueBg.setVisible(true);
    this.dialoguePhoto.setVisible(false);
    this.dialogueText.setText(text);
    this.dialogueText.setVisible(true);
    this.dialogueTextShipAtributes.setVisible(true);

    this.scene.time.delayedCall(duration, () => this.close());
  }
}
