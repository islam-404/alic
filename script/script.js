document.addEventListener('DOMContentLoaded', () => {

  const search = document.querySelector('.search');
        wishlistBtn = document.getElementById('wishlist'),
        cartBtn = document.getElementById('cart'),
        goodsWrapper = document.querySelector('.goods-wrapper'),
        cart = document.querySelector('.cart'),
        category = document.querySelector('.category'),
        cartCounter = cartBtn.querySelector('.counter'),
        wishlistCounter = wishlistBtn.querySelector('.counter'),
        cartWrapper = document.querySelector('.cart-wrapper');

  const wishlist = [];
  let goodsBasket = {};

  const loading = () => {
    goodsWrapper.innerHTML = `<div id="spinner"><div class="spinner-loading">
    <div><div><div></div></div><div><div></div></div><div><div></div></div>
    <div><div></div></div></div></div></div>`
  }


  const createCardGoods = (id, title, price, img) => {
    const card = document.createElement('div');
    card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
    card.innerHTML = `<div class="card">
                        <div class="card-img-wrapper">
                          <img class="card-img-top" src="${img}" alt="">
                          <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                                  data-goods-id="${id}"></button>
                        </div>
                        <div class="card-body justify-content-between">
                          <a href="#" class="card-title">${title}</a>
                          <div class="card-price">${price} ₽</div>
                          <div>
                            <button class="card-add-cart"
                                    data-goods-id="${id}">Добавить в корзину</button>
                          </div>
                        </div>
                      </div>`;
    return card;

  };

  const renderCard = (goods) => {
    goodsWrapper.textContent = '';
      if (goods.length) {
        goods.forEach(({ id, title, price, imgMin }) => {
          goodsWrapper.append(createCardGoods(id, title, price, imgMin));
        });
      } else {goodsWrapper.textContent = 'Извините, мы не нашли товаров по вашему запросу!'}
  };

  // создание товаров корзины 

  const createCardGoodsBasket = (id, title, price, img) => {
    const card = document.createElement('div');
    card.className = 'goods';
    card.innerHTML = `<div class="goods-img-wrapper">
                        <img class="goods-img" src="${img}" alt="">
                      </div>
                      <div class="goods-description">
                        <h2 class="goods-title">${title}</h2>
                        <p class="goods-price">${price} ₽</p>
                      </div>
                      <div class="goods-price-count">
                        <div class="goods-trigger">
                          <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" 
                           data-goods-id="${id}></button>
                          <button class="goods-delete" data-goods-id="${id}></button>
                        </div>
                        <div class="goods-count">1</div>
                      </div>`;
    return card;

  };

  const renderBasket = (goods) => {
    cartWrapper.textContent = '';
      if (goods.length) {
        goods.forEach(({ id, title, price, imgMin }) => {
          cartWrapper.append(createCardGoodsBasket (id, title, price, imgMin));
        });
      } else {
        cartWrapper.innerHTML = `<div id="cart-empty">
                                      Ваша корзина пока пуста</div>`}
  };


  const closeCart = (event) => {
    const target = event.target;

    if (target === cart ||
      target.classList.contains('cart-close') ||
      event.keyCode === 27) {
      cart.style.display = '';
      document.removeEventListener('keyup', closeCart);

    }

    console.log(event.keyCode)
  };

  const showCardBasket = goods => goods.filter(item => goodsBasket.hasOwnProperty(item.id));

  const openCart = () => {
    event.preventDefault();
    cart.style.display = 'flex';
    document.addEventListener('keyup', closeCart);
    getGoods(renderBasket, showCardBasket);
  };

  const getGoods = (handler, filter) => {
    loading();
    fetch('db/db.json')
      .then(response => response.json())
      .then(filter)
      .then(handler);
  };

  const randomSort = (item) => item.sort(() => Math.random() -0.5);

  const choiceCategory = event => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('category-item')) {
      const category = target.dataset.category;
      getGoods(renderCard, goods => goods.filter(item => item.category.includes(category)));
    }
  };

  const searchGoods = event => {
    event.preventDefault();
    const input = event.target.elements.searchGoods;
    const inputValue = input.value.trim();
    if (inputValue !== '') {
      const searchString = new RegExp(inputValue, 'i');
      getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
    } else {
      search.classList.add('error');
      setTimeout( () => {
        search.classList.remove('error');
      }, 2000)
      }
    input.value = '';
  };

  const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  };

  const cookieQuery = get => {
    if (get) {
      if (getCookie('goodsBasket')){
        goodsBasket = JSON.parse(getCookie('goodsBasket'));
      }
      checkCount();
    } else {
        document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age=86400e3`;
    }
  };

  const checkCount = () => {
    wishlistCounter.textContent = wishlist.length;
    cartCounter.textContent = Object.keys(goodsBasket).length;
  }

  const storageQuery = get => {

    if (get) {
      if (localStorage.getItem('wishlist')) {
        JSON.parse(localStorage.getItem('wishlist')).forEach(id => wishlist.push(id));
      }
      checkCount();
    } else {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    

  }

  const toggleWishlist = (id, elem) => {
    if (wishlist.includes(id)) {
      wishlist.splice(wishlist.indexOf(id), 1);
      elem.classList.remove('active');
    } else {
      wishlist.push(id);
      elem.classList.add('active');
    }
    checkCount();
    storageQuery();
  };

  const addBasket = id => {
    if (goodsBasket[id]) {
      goodsBasket[id] += 1
    } else {
      goodsBasket[id] = 1
    }
    checkCount();
    cookieQuery();
  };

  const handlerGoods = event => {
    const target = event.target;


    if (target.classList.contains('card-add-wishlist')) {
      toggleWishlist(target.dataset.goodsId, target);
    };

    if (target.classList.contains('card-add-cart')) {
      addBasket(target.dataset.goodsId);
    }


  }

  const showWishlist = () => {
    getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
  };

  cartBtn.addEventListener('click', openCart);
  cart.addEventListener('click', closeCart);
  category.addEventListener('click', choiceCategory);
  search.addEventListener('submit', searchGoods);
  goodsWrapper.addEventListener('click', handlerGoods);
  wishlistBtn.addEventListener('click', showWishlist)

  getGoods(renderCard, randomSort);

  storageQuery(true);
  cookieQuery(true);

});