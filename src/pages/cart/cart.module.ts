import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartPage } from './cart';
import { TranslateModule } from '@ngx-translate/core';
import { WooSliderComponentModule } from '../../components/woo-slider/woo-slider.module';
import { WooCartComponentModule } from '../../components/woo-cart/woo-cart.module';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  declarations: [
    CartPage,
  ],
  imports: [
    IonicPageModule.forChild(CartPage),
    TranslateModule.forChild(),
    WooSliderComponentModule,
    StarRatingComponentModule,
    WooCartComponentModule
  ],
})
export class CartPageModule {}