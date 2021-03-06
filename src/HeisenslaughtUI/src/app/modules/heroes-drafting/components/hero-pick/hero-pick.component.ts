import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';

import { HeroData, HeroesService } from '../../../heroes-data-service/heroes-data-service.module';


@Component({
  selector: 'hero-pick',
  templateUrl: './hero-pick.component.html',
  styleUrls: ['./hero-pick.component.scss']
})
export class HeroPickComponent implements OnChanges {

  @Input()
  public hero: HeroData;

  @ViewChild('heroCanvas')
  private canvas: ElementRef;

  public constructor(private heroesService: HeroesService) {

  }

  public async ngOnChanges(changes) {
    if (changes['hero']) {
      let canvas = <HTMLCanvasElement>this.canvas.nativeElement;
      let ctx = canvas.getContext('2d');
      let w = canvas.width;
      let h = canvas.height;
      if (this.hero && this.hero.id !== 'failed_ban') {
        let img = new Image(w, h);
        img.onload = event => {
          ctx.clearRect(0, 0, w, h);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(w * 0.52, h * 0.04);
          ctx.lineTo(w, h * 0.28);
          ctx.lineTo(w, h * 0.78);
          ctx.lineTo(w * 0.52, h * 1.01);
          ctx.lineTo(w * 0.05, h * 0.78);
          ctx.lineTo(w * 0.05, h * 0.28);
          ctx.clip();
          ctx.drawImage(img, 0, 0, w, h);
          ctx.restore();
        };
        let heroImages = await this.heroesService.getHeroImages();
        img.src = heroImages[this.hero.id] || this.hero.iconSmall;
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
  }
}
