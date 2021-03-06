import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';

@IonicPage()
@Component({
  selector: 'page-thank-you',
  templateUrl: 'thank-you.html',
})
export class ThanksPage {

	order_id: any
	order: any
	title: string;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider
		) {
	}

	ionViewDidLoad() {
		this.order_id = this.navParams.get('order_id');

		console.log('order id: ' + this.order_id)

		this.title = ( this.navParams.get('title') ? this.navParams.get('title') : "Your Order" )

		if( this.order_id )
			this.getOrder()
	}

	getOrder() {

		this.wooProvider.get( 'orders/' + this.order_id, 'nopaging' ).then( response => {
			console.log(response)
			this.order = response
		})

	}

	thanksContinue() {
		this.navCtrl.pop()
	}

}
