import { DialogueBox } from "./DialogueBox";

export class DialogueManager {
  private scene: Phaser.Scene;
  private dialogueBox: DialogueBox;

  private lastEarthLifePercent: number = 100;
  private lastPlayerLifePercent: number = 100;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.dialogueBox = new DialogueBox(
      scene,
      window.innerWidth - 300,
      window.innerHeight,
      130,
      200,
      -20
    );
  }

  public showIntroDialogue() {
    this.dialogueBox.show(
      "This asteroid is big, the love for my family is even bigger, I won't hesitate to push the trigger!!!",
      null,
      6000
    );
  }

  public updateDialogue(
    playerLife: number,
    playerMaxLife: number,
    earthLife: number,
    earthMaxLife: number,
    chicxulubLife: number,
    chicxulubMaxLife: number
  ) {
    // Percentuais
    const playerPercent = (playerLife / playerMaxLife) * 100;
    const earthPercent = (earthLife / earthMaxLife) * 100;
    const chicxulubPercent = (chicxulubLife / chicxulubMaxLife) * 100;

    // Player
    if (playerPercent <= 50 && this.lastPlayerLifePercent > 50) {
      this.dialogueBox.show(
        "Arrrghh Damned!! I don't want to become rocket fuel!!!!",
        null,
        4500
      );
    }

    // Earth
    if (earthPercent <= 70 && this.lastEarthLifePercent > 70) {
      this.dialogueBox.show(
        "I MUST PROTECT FAMILY !!!!!!",
        null,
        4500
      );
    }

    if (earthPercent <= 50 && this.lastEarthLifePercent > 50) {
      this.dialogueBox.show(
        "I’m a space dino, not a space clown, I must bring this asteroid down!",
        null,
        4500
      );
    }

    if (earthPercent <= 30 && this.lastEarthLifePercent > 30) {
      this.dialogueBox.show(
        "FAMILY, NOOO!!!",
        null,
        4500
      );
    }

    // Chicxulub
    if (chicxulubPercent <= 70) {
      this.dialogueBox.show(
        "Space is big… but so is my ego. Good thing I’m a dino!",
        null,
        4500
      );
    }

    // Tempo de gameplay
    if (this.scene.time.now > 20000 && this.scene.time.now < 20500) {
      this.dialogueBox.show(
        "No time to waste, gotta save the Earth before it's erased!",
        null,
        4500
      );
    }

    // Atualiza estados anteriores
    this.lastEarthLifePercent = earthPercent;
    this.lastPlayerLifePercent = playerPercent;
  }
}
