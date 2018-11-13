import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';
import { CustomPage } from './custom-page';
import { ApListComponentModule } from '../../components/ap-list/ap-list.module';
import { ApSliderComponentModule } from '../../components/ap-slider/ap-slider.module';
import { WooListComponentModule } from '../../components/woo-list-component/woo-list-component.module';
import { WooCartComponentModule } from '../../components/woo-cart/woo-cart.module';
import { WooSliderComponentModule } from '../../components/woo-slider/woo-slider.module';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';


@NgModule({
  declarations: [
    CustomPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomPage),
    TranslateModule.forChild(),
    DynamicComponentModule,
    ApListComponentModule,
    ApSliderComponentModule,
    WooListComponentModule,
    WooSliderComponentModule,
    StarRatingComponentModule,
    WooCartComponentModule
  ],
  entryComponents: [
    CustomPage
  ],
  exports: [
    CustomPage
  ]
})
export class CustomPageModule {}
