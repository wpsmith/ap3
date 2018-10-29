import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, Events, Content } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';
import { Storage } from '@ionic/storage';

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
	title: string;
	stopLoop: boolean = false;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public events: Events,
		public storage: Storage
		) {

		if( this.navParams.get('route') ) {
			this.route = this.navParams.get('route')
		} else {
			this.route = 'products'
		}

		this.title = this.navParams.get('title')

		events.subscribe('add_to_cart', data => {
	      this.cart_count++
	    });

	    events.subscribe('clear_cart', data => {
	      this.cart_count = 0
	    });

	    events.subscribe('cart_change', data => {
	      this.getCartFromAPI()
	    });

	    // make sure cart count is always updated on initial load
	    this.getCartFromAPI()

	}

	ionViewDidLoad() {

		this.loadProducts( this.route )

		this.getCategories()
		
	}

	ionViewWillEnter() {

		this.getCartCount()

	}

	getCartCount() {

		// get cart count from storage, or hit API if we don't have it
		this.storage.get( 'cart_count' ).then( data => {
			if( data ) {
				this.cart_count = data
			} else {
				this.getCartFromAPI()
			}
		})
	}

	getCartFromAPI() {

		this.wooProvider.getCartContents().then( cart => {

			this.cart_count = ( cart && typeof cart != 'string' && (<any>cart).cart_total ? (<any>cart).cart_total.cart_contents_count : '' )
			// don't need to save count to storage, it's already saved in woo.ts
		})
		
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

			if( (<any>items).length ) {

			  this.items = items;

			  // load more right away
			  this.loadMore(null);

			} else if ( !this.stopLoop ) {
				this.route = 'products?category=' + this.getUrlParam( this.route, 'parent=' )
				this.loadProducts( this.route )
				this.getCategories()
				this.stopLoop = true
			}

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

		if( this.route.indexOf('categories') >= 0 ) {
			return;
		}

		this.wooProvider.get( 'products/categories', null ).then(categories => {

			if( categories ) {
				this.customClasses += ' has-favorites';
				this.content.resize()
			}

			// Loads posts from WordPress API
			this.categories = categories;

			console.log(this.categories)

			// set category name in dropdown
			if( this.route.indexOf('category') >= 0 ) {
				let catId = this.getUrlParam( this.route, 'category=' )
				setTimeout( () => {
					this.category = catId
				}, 100 )
				
			}


		}).catch((err) => {

		  console.warn('Error getting categories', err);

		});

	}

	categoryChanged() {

		let route = this.addQueryParam( 'products', 'category=' + this.category )

		this.loadProducts( route )

	}

	loadDetail(event, item) {

		let opt = {};

		if( item.price ) {
			
			this.navCtrl.push('WooDetail', {
			  item: item
			}, opt);

		} else if( this.route.indexOf('categories') >= 0 ) {

			this.navCtrl.push('WooList', {
			  route: 'products/?category=' + item.id
			}, opt);

		} else {

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

	getBtnText( item ) {

		let txt;

		switch( item.type ) {
			case "simple":
				txt = "Add to Cart"
				break;
			case "grouped":
				txt = "View Products"
				break;
			case "variable":
				txt = "Select Options"
				break;
			default:
				txt = "View Details"
		}

		return txt

	}

	productAction( item ) {

		switch( item.type ) {
			case "simple":
				this.addToCart(item)
				break;
			default:
				this.loadDetail(item)
		}

	}

	addToCart( item ) {

		this.presentToast( item.name + ' added to cart.' )

		item.quantity = 1
		item.product_id = item.id

		this.wooProvider.addToCart( item ).then( data => {
			
			this.productAddSuccess( data, item )

		}).catch( e => { 

			this.productAddError( e )
			console.warn(e)

		} )

	}

	productAddSuccess( data, item ) {

		this.storage.get( 'cart_count').then( count => {

			if( count ) {
				count = parseInt( count ) + 1
			} else {
				count = 1
			}
			this.storage.set( 'cart_count', count )

		})

		this.events.publish( 'add_to_cart', item )

	}

	productAddError( e ) {

		let msg;

		if( e.error && e.error.message ) {
			msg = e.error.message
		} else {
			msg = 'There was a problem, your item was not added to the cart.'
		}

		this.presentToast( msg ) 

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

	    // this.cartModal = this.modalCtrl.create( 'CartPage' );
	    
	    // this.cartModal.present();

	    this.navCtrl.push('CartPage')

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

	// get category ID from url string
	getUrlParam( url, param ) {
		console.log('url param ' + url, param)
		return url.split( param ).pop()
	}

	addQueryParam(url, param) {
		const separator = (url.indexOf('?') > 0) ? '&' : '?';
		return url + separator + param;
	}

	clearSearch() {

		this.loadProducts( this.route )

	}

}