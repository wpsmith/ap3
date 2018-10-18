import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, Events, Content } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';

@IonicPage()
@Component({
  selector: 'page-woo-list',
  templateUrl: 'woo-list.html',
})
export class WooList {

	@ViewChild(Content) content: Content;

	items: any;
	page: number = 1;
	route: string;
	cartModal: any;
	cart_count: any;
	categories: any;
	category: any;
	customClasses: string;
	showSearch: boolean = false;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public events: Events
		) {

		if( this.navParams.get('route') ) {
			this.route = this.navParams.get('route')
		} else {
			this.route = 'products/categories'
		}

		events.subscribe('add_to_cart', data => {
	      this.cart_count++
	    });

	    events.subscribe('clear_cart', data => {
	      this.cart_count = 0
	    });
	}

	ionViewDidLoad() {

		this.loadProducts( this.route )

		this.wooProvider.getCartContents().then( cart => {
			this.cart_count = ( cart ? (<any>cart).length : '' )
		})

		this.getCategories()
		
	}

	loadProducts( route ) {

		let loading = this.loadingCtrl.create({
		    showBackdrop: false,
		    //dismissOnPageChange: true
		});

		loading.present(loading);

		this.page = 1;

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.wooProvider.get( route, this.page ).then(items => {

		  console.log(items)

		  // Loads posts from WordPress API
		  this.items = items;

		  // load more right away
		  this.loadMore(null);
		  loading.dismiss();
		}).catch((err) => {

		  loading.dismiss();
		  console.error('Error getting posts', err);

		});

		// make sure spinner never gets stuck on
		setTimeout(() => {
		    loading.dismiss();
		}, 8000);

	}

	getCategories() {

		this.wooProvider.get( 'products/categories', null ).then(categories => {

			if( categories ) {
				this.customClasses += ' has-favorites';
				this.content.resize()
			}

			console.log(categories)

			// Loads posts from WordPress API
			this.categories = categories;


		}).catch((err) => {

		  console.warn('Error getting categories', err);

		});

	}

	categoryChanged() {

		console.log(this.category)

		let route = this.addQueryParam( 'products', 'category=' + this.category )

		this.loadProducts( route )

	}

	itemTapped(event, item) {

		console.log(item)

		let opt = {};

		if( item.price ) {
			
			this.navCtrl.push('WooDetail', {
			  item: item
			}, opt);

		} else {

			// link to another category page. Need to be able to tell if a category has children. If so, we link to 'products/categories/?parent=' + item.id 
			// otherwise we link to products?category=item.id
			this.navCtrl.push('WooList', {
			  route: 'products/categories/?parent=' + item.id
			}, opt);
		}

		
	}

	doRefresh(refresh) {
		this.loadProducts( this.route );
		// refresh.complete should happen when posts are loaded, not timeout
		setTimeout( ()=> refresh.complete(), 500);
	}

	loadMore(infiniteScroll) {

		this.page++;

		this.wooProvider.get( this.route, this.page ).then(items => {
		  // Loads posts from WordPress API
		  let length = items["length"];

		  if( length === 0 ) {
		    if(infiniteScroll)
		      infiniteScroll.complete();
		    return;
		  }

		  for (var i = 0; i < length; ++i) {
		    this.items.push( items[i] );
		  }

		  if(infiniteScroll)
		    infiniteScroll.complete();

		}).catch( e => {
		  // promise was rejected, usually a 404 or error response from API
		  if(infiniteScroll)
		    infiniteScroll.complete();

		  console.warn(e)

		});

	}

	presentToast(msg) {

		let toast = this.toastCtrl.create({
		  message: msg,
		  duration: 3000,
		  position: 'bottom',
		  cssClass: 'normal-toast'
		});

		toast.present();

	}

	showCart() {

	    this.cartModal = this.modalCtrl.create( 'CartPage' );
	    
	    this.cartModal.present();

	}

	toggleSearchBar() {
		if( this.showSearch === true ) {
		  this.showSearch = false
		} else {
		  this.showSearch = true
		}

		this.content.resize()
	}

	search(ev) {
		// set val to the value of the searchbar
		let val = ev.target.value;

		// if the value is an empty string don't filter the items
		if (val && val.trim() != '') {
		  // set to this.route so infinite scroll works
		  let route = this.addQueryParam(this.route, 'search=' + val);
		  this.loadProducts( route )
		}

	}

	addQueryParam(url, param) {
		const separator = (url.indexOf('?') > 0) ? '&' : '?';
		return url + separator + param;
	}

	clearSearch() {

		this.loadProducts( this.route )

	}

}