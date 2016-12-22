import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DraftService, ICreateDraftDTO, IDraftConfigAdminDTO, DraftPhase } from '../../../heroes-draft-service/services/draft.service';
import { HeroesService, IMapData, HeroData } from '../../../heroes-data-service/services/heroes.service';


@Component({
  selector: 'draft-config-screen',
  templateUrl: './draft-config-screen.component.html',
  styleUrls: ['./draft-config-screen.component.scss']
})
export class DraftConfigScreenComponent implements OnDestroy {
  private draftToken: string;
  private adminToken: string;
  private loadedHeroes: boolean;
  private loadedMaps: boolean;
  private loadedConfig: boolean;

  private stateSubscription: Subscription;

  public config: ICreateDraftDTO = <ICreateDraftDTO>{};
  public currentConfig: IDraftConfigAdminDTO;
  public maps: IMapData[];
  public heroes: HeroData[];
  public createError: string;



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private heroesService: HeroesService,
    private draftService: DraftService
  ) {
    try {

      heroesService.getMaps().subscribe((maps: IMapData[]) => {
        this.maps = maps;
        this.loadedMaps = true;
      });

      heroesService.getHeroes().subscribe((heroes: HeroData[]) => {
        this.heroes = heroes;
        this.loadedHeroes = true;
      });

      this.draftToken = this.route.snapshot.params['id'];
      this.adminToken = this.route.snapshot.params['adminToken'];

      if (this.draftToken && this.adminToken) {
        this.initConfigDraft();
      } else {
        this.initCreateDraft();
      }
    } catch (e) {
      console.error(e);
    }
  }

  public ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.draftService.disconnect();
  }
  public get loaded(): boolean {
    return this.loadedConfig && this.loadedHeroes && this.loadedMaps;
  }

  private initCreateDraft(): void {
    this.config = <ICreateDraftDTO>{
      firstPick: 0,
      bankTime: true,
      team1Name: 'Blue Team',
      team2Name: 'Red Team',
      pickTime: 60,
      bonusTime: 180
    };
    this.loadedConfig = true;
  }

  private initConfigDraft() {
    this.draftService.connectToDraft(this.draftToken, this.adminToken).then((config) => {
      this.currentConfig = <IDraftConfigAdminDTO>config;
      console.log('connected to draft', config);
      this.stateSubscription = this.draftService.getDraftState(this.draftToken).subscribe((state) => {
        this.currentConfig.state = state;
      });
      this.loadedConfig = true;
    }, (err) => {
      console.log('connect error', err);
    });
  }

  public createDraft() {
    this.createError = undefined;
    this.draftService.createDraft(this.config).then((cfg) => {
      this.router.navigate(['draft/config', cfg.draftToken, cfg.adminToken]);
    }, (err) => {
      this.createError = err ? err.toString() : 'Server Error';
    });
  }

  public resetDraft() {
    this.createError = undefined;
    this.draftService.resetDraft(this.draftToken, this.adminToken).then((cfg) => {
      this.currentConfig = cfg;
    }, (err) => {
      this.createError = err ? err.toString() : 'Server Error';
    });
  }

  public closeDraft() {
    this.createError = undefined;
    this.draftService.closeDraft(this.draftToken, this.adminToken).then(() => {
    }, (err) => {
      this.createError = err ? err.toString() : 'Server Error';
    });
  }

  public getMapName(): string {
    let mapName = '';
    if (this.currentConfig && this.maps) {
      let map = this.maps.find((value) => {
        return value.id === this.currentConfig.map;
      });
      if (map) {
        mapName = map.name;
      }
    }
    return mapName;
  }

  public getStatus(): string {
    return 'WAITING';
  }

  public getFirstPick(): string {
    let str = '';
    if (this.currentConfig) {
      str = this.currentConfig.firstPick === 1 ? this.currentConfig.team1Name : this.currentConfig.team2Name;
      if (this.currentConfig.wasFirstPickRandom) {
        str += ' (Random)';
      }
    }
    return str;
  }

  public getPhase(): string {
    let str = '';
    if (this.currentConfig) {
      switch (this.currentConfig.state.phase) {
        case DraftPhase.WAITING:
          str = 'Waiting';
          break;
        case DraftPhase.PICKING:
          str = 'Picking';
          break;
        case DraftPhase.FINISHED:
          str = 'Completed';
          break;
      }
    }
    return str;
  }

  public getLink(draftToken: string, teamToken: string): string {
    let url = window.location.protocol + '//';
    url += window.location.host + '/draft/' + draftToken;
    if (teamToken) {
      url += '/' + teamToken;
    }
    return url;
  }

  public copyLink(input: HTMLInputElement): void {
    try {
      input.select();
      document.execCommand('copy');
    } catch (e) { }
  }
}