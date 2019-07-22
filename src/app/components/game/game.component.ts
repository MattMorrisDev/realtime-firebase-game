import { Component, HostListener, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

interface IPlayer {
   row: number;
   col: number;
}

function getRandomNumberBetween0And(num: number) {
   return Math.round(Math.random() * num);
}

@Component({
   selector: "app-game",
   templateUrl: "./game.component.html",
   styleUrls: ["./game.component.scss"]
})
export class GameComponent implements OnInit {
   private COL_COUNT = 100;
   private ROW_COUNT = 100;
   private PLAYER_ID_LOCAL_STORAGE_KEY = "PLAYER_ID";

   private roomId: string;
   private playerId: string;
   private playerCoords: IPlayer;
   private playerCoordsRef: AngularFireObject<IPlayer>;
   private allPlayers: Observable<Array<IPlayer>>;

   gridStyles = {
      "grid-template-columns": `repeat(${this.COL_COUNT}, 1fr)`,
      "grid-template-rows": `repeat(${this.ROW_COUNT}, 1fr)`
   };
   gridCells: Array<boolean> = [].constructor(this.COL_COUNT * this.ROW_COUNT);

   constructor(private route: ActivatedRoute, private db: AngularFireDatabase) {
      let savedPlayerId = localStorage.getItem(this.PLAYER_ID_LOCAL_STORAGE_KEY);
      if (!savedPlayerId) {
         const randomPlayerId = Math.random()
            .toString(36)
            .substring(7);
         localStorage.setItem(this.PLAYER_ID_LOCAL_STORAGE_KEY, randomPlayerId);
         savedPlayerId = randomPlayerId;
      }

      this.playerId = savedPlayerId;
      this.playerCoords = {
         row: getRandomNumberBetween0And(this.ROW_COUNT),
         col: getRandomNumberBetween0And(this.COL_COUNT)
      };

      const playerCellIndex = this.getPlayerCellIndex(this.playerCoords);
      this.gridCells[playerCellIndex] = true;
   }

   ngOnInit() {
      this.route.paramMap.subscribe(paramMap => {
         const roomId = paramMap.get("roomId");
         this.roomId = roomId;
         this.playerCoordsRef = this.db.object<IPlayer>(this.roomId);
         this.playerCoordsRef.update({ [this.playerId]: this.playerCoords });

         this.allPlayers = this.db.list<IPlayer>(roomId).valueChanges();
         this.allPlayers.subscribe((players: Array<IPlayer>) => {
            // Need to diff the existing sets, can't keep doing this lol
            this.gridCells = [].constructor(this.COL_COUNT * this.ROW_COUNT);
            players.forEach((player: IPlayer) => {
               const playerCellIndex = this.getPlayerCellIndex(player);
               this.gridCells[playerCellIndex] = true;
            });
         });
      });
   }

   @HostListener("window:unload", ["$event"])
   private removePlayerOnPageExit() {
      this.db.object(`${this.roomId}/${this.playerId}`).remove();
   }

   @HostListener("window:keyup", ["$event"])
   private onKeyUp(event: KeyboardEvent) {
      let needsUpdate = false;

      const keyCode = event.keyCode;
      if (keyCode === 37 && this.playerCoords.col > 0) {
         this.playerCoords.col--;
         needsUpdate = true;
      } else if (keyCode === 38 && this.playerCoords.row > 0) {
         this.playerCoords.row--;
         needsUpdate = true;
      } else if (keyCode === 39 && this.playerCoords.col < this.COL_COUNT - 1) {
         this.playerCoords.col++;
         needsUpdate = true;
      } else if (keyCode === 40 && this.playerCoords.row < this.ROW_COUNT - 1) {
         this.playerCoords.row++;
         needsUpdate = true;
      }

      if (needsUpdate) {
         this.playerCoordsRef.update({ [this.playerId]: this.playerCoords });
      }
   }

   private getPlayerCellIndex(person: IPlayer) {
      return person.row * this.ROW_COUNT + person.col;
   }
}
