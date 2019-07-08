import {Component, HostListener, OnInit} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';


function getRandomNumberBetween0And(num: number) {
  return Math.round(Math.random() * num)
}


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {

  private COL_COUNT = 80;
  private ROW_COUNT = 60;
  private gridStyles = {
    'grid-template-columns': `repeat(${this.COL_COUNT}, 1fr)`,
    'grid-template-rows': `repeat(${this.ROW_COUNT}, 1fr)`,
  };

  private roomId: string;
  private playerId: string;
  private playerCoords: { row: number, col: number };
  private allPlayers: Observable<any[]>;
  private gridCells = [].constructor(this.COL_COUNT * this.ROW_COUNT);

  constructor(private route: ActivatedRoute, private db: AngularFireDatabase) {
    this.playerId = Math.random().toString(36).substring(7);
    this.playerCoords = {
      row: getRandomNumberBetween0And(this.ROW_COUNT),
      col: getRandomNumberBetween0And(this.COL_COUNT),
    };


  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      const roomId = paramMap.get('roomId');
      this.roomId = roomId;
      this.allPlayers = this.db.list(roomId).valueChanges();
    });


  }

  @HostListener('window:unload', ['$event'])
  removePlayerOnPageExit() {
    this.db.object(`${this.roomId}/${this.playerId}`).remove();
  }

  updateDB() {
    const itemRef = this.db.object(this.roomId);
    itemRef.update({[this.playerId]: this.playerCoords});
  }
}
