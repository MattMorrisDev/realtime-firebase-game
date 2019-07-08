import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {environment} from 'src/environments/environment';
import {AppComponent} from './app.component';
import {GameComponent} from './components/game/game.component';

const routes: Routes = [{
  path: 'room/:roomId',
  component: GameComponent,
}];


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase, 'realtime-game-123'),
    AngularFireDatabaseModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
