import { Component, Inject } from "typecomposer";
import { GameService } from "../services/GameService";

export class GamePage extends Component {

	@Inject()
	game: GameService;

	constructor() {
		super({ style: { width: "100dvw", height: "100dvh" } });
	}

	onConnected() {
		this.game.onCreate(this);
	}


}
