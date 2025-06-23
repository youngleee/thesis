import { registerApplication, start } from 'single-spa';

// Register Vue micro-frontends
registerApplication({
  name: 'product-listing',
  app: () => import('productListing/ProductList'),
  activeWhen: ['/products', '/'],
  customProps: {
    domElement: document.getElementById('product-listing-container')
  }
});

registerApplication({
  name: 'shopping-cart',
  app: () => import('shoppingCart/ShoppingCart'),
  activeWhen: ['/cart'],
  customProps: {
    domElement: document.getElementById('shopping-cart-container')
  }
});

registerApplication({
  name: 'product-details',
  app: () => import('productDetails/ProductDetails'),
  activeWhen: ['/product-details'],
  customProps: {
    domElement: document.getElementById('product-details-container')
  }
});

// Register React micro-frontend
registerApplication({
  name: 'user-profile',
  app: () => import('userProfile/UserProfile'),
  activeWhen: ['/profile'],
  customProps: {
    domElement: document.getElementById('user-profile-container')
  }
});

// Start Single-SPA
start(); 