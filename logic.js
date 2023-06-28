class Zomato {
    constructor() {
     this.api = 'b05a4e1bf00dfb56e6e8664292297912';
     this.header = {
      method: 'GET',
      headers: {
       'user-key': this.api,
       'Content-Type': 'application/json'
      },
      credantials: 'same-origin'
     };
     this.sortRestourant = 'rating';
     this.orderRestourant = 'asc';
    }
    async searchAPI(city, categoryID) {
     const categoryURL = `https://developers.zomato.com/api/v2.1/categories`;
     const cityURL = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;
     const categoryInfo = await fetch(categoryURL, this.header);
     const cityInfo = await fetch(cityURL, this.header);
     const categories = await categoryInfo.json();
     const cityJSON = await cityInfo.json();
     const cityLocation = await cityJSON.location_suggestions;
     let cityID = 0;
     if (cityLocation.length > 0) {
      cityID = await cityLocation[0].id;
     }
   
     const resterauntURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&category=${categoryID}&sort=${this.sortRestourant}&order=${this.orderRestourant}`;
     const restaurantInfo = await fetch(resterauntURL, this.header);
     const restaurantJSON = await restaurantInfo.json();
     const restaurants = await restaurantJSON.restaurants;
     return {
      categories,
      cityID,
      restaurants
     }
    }
   }
   
   class UI {
    constructor() {
     this.loader = document.querySelector('.loader');
     this.restourantList = document.querySelector('#restaurant-list');
    }
    addSelectOption(categories) {
     const search = document.querySelector('#searchCategory');
     let output = `<option value="0" selected>SELECT CATEGORY</option>`;
     categories.forEach(categorie => {
      const categoriesList = categorie['categories'];
      output += `
      <option value="${categoriesList.id}">${categoriesList.name}</option>
      `;
     });
     search.innerHTML = output;
    }
    showFeedBack(message, className) {
     const feedBack = document.querySelector('.feedback');
     feedBack.classList.add(className, 'showItem');
     feedBack.innerHTML = `<p>${message}</p>`;
     setTimeout(() => {
      feedBack.classList.remove(className, 'showItem');
     }, 3000);
    }
    showLoader() {
     this.loader.classList.add('showItem');
    }
    hideLoader() {
     this.loader.classList.remove('showItem');
    }
    getRestourants(restaurants) {
     if (restaurants.length === 0) {
      this.showFeedBack('no such categories exist in the selected city', 'alert-danger');
     } else {
      this.restourantList.innerHTML = '';
      restaurants.forEach(restourant => {
       const {
        thumb,
        name,
        location: {
         address
        },
        user_rating: {
         aggregate_rating,
         rating_text
        },
        cuisines,
        average_cost_for_two,
        currency,
        menu_url,
        url
       } = restourant.restaurant;
       if (thumb !== '') {
        this.showRestourant(thumb, name, address, aggregate_rating, rating_text, cuisines, average_cost_for_two, currency, menu_url, url);
       } else {
        this.showRestourant('https://www.lrcmyanmar.org/wp-content/uploads/2018/11/noimage.png', name, address, aggregate_rating, rating_text, cuisines, average_cost_for_two, currency, menu_url, url)
       }
      });
     }
    }
    showRestourant(thumb, name, address, aggregate_rating, rating_text, cuisines, average_cost_for_two, currency, menu_url, url) {
     const div = document.createElement('div');
     div.classList.add('col-11','mx-auto','my-3','col-md-4');
     div.innerHTML = `
     <div class="card">
      <div class="card">
       <div class="row p-3">
        <div class="col-5">
         <img src="${thumb}" class="img-fluid img-thumbnail" alt="">
        </div>
        <div class="col-5 text-capitalize">
         <h6 class="text-uppercase pt-2 redText">${name}</h6>
         <p>${address}</p>
         <div class="badge badge-info">
         ${rating_text}
         </div>
        </div>
        <div class="col-1">
         <div class="badge badge-success">
         ${aggregate_rating}
         </div>
        </div>
       </div>
       <hr>
       <div class="row py-3 ml-1">
        <div class="col-5 text-uppercase ">
         <p>cousines : </p>
         <p>cost for two : </p>
        </div>
        <div class="col-7 text-uppercase">
         <p>${cuisines}</p>
         <p>${average_cost_for_two} ${currency}</p>
        </div>
       </div>
       <hr>
       <div class="row text-center no-gutters pb-3">
        <div class="col-6">
         <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i
           class="fas fa-book"></i> menu</a>
        </div>
        <div class="col-6">
         <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i
           class="fas fa-book"></i> website</a>
        </div>
       </div>
      </div>
     `;
     this.restourantList.appendChild(div);
    }
    clearSearch(searchCity) {
     searchCity.value = '';
    }
   }
   
   (function () {
    const searchForm = document.querySelector('#searchForm'),
     searchCategory = document.querySelector('#searchCategory'),
     searchCity = document.querySelector('#searchCity'),
     zomato = new Zomato(),
     ui = new UI();
   
    document.addEventListener('DOMContentLoaded', () => {
     zomato.searchAPI()
      .then(data => ui.addSelectOption(data.categories.categories))
      .catch(err => ui.showFeedBack(err, 'alert-danger'));
    });
   
    searchForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const city = searchCity.value.toLowerCase();
     const categorieID = parseInt(searchCategory.value);
     if (city !== '' && categorieID > 0) {
      zomato.searchAPI(city, categorieID)
       .then(cityData => {
        const townID = cityData.cityID;
        if (townID === 0) {
         ui.showFeedBack('please enter a valid city', 'alert-danger');
        } else {
         ui.showLoader();
         setTimeout(() => {
          ui.hideLoader();
          zomato.searchAPI(city, categorieID)
           .then(restourantData => {
            const restaurants = restourantData.restaurants;
            ui.getRestourants(restaurants);
            ui.clearSearch(searchCity);
           })
           .catch(err => ui.showFeedBack(err, 'alert-danger'));
         }, 3000);
        }
       })
       .catch(err => ui.showFeedBack(err, 'alert-danger'));
      /* ui.showFeedBack('Search success','alert-success'); */
     } else {
      ui.showFeedBack('please enter a city and select category', 'alert-danger');
     }
    });
   })();