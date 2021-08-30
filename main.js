class Restraunts {
  async getData() {
    try {
      const response = await fetch("./restraunts.json");
      const data = await response.json();
      return data.items;
    } catch (err) {
      console.log(err);
    }
  }
}

class Storage {
  static saveData(items) {
    _.map(items, (item, index) => {
      favourites[index + 1] = item.favourite;
    });
    localStorage.setItem("favourite", JSON.stringify(favourites.slice(1)));
  }

  static setFavourite(id) {
    let i = 1;
    let items = localStorage.getItem("favourite");

    items = JSON.parse(items);
    let newFav = new Array(15).fill(false);
    while (i <= 15) {
      if (i === parseInt(id)) {
        newFav[i] = "true";
      } else {
        newFav[i] = items[i - 1];
      }

      i++;
    }

    localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
  }

  static getFavourite(id) {
    let items = localStorage.getItem("favourite");
    if (items && items.length) {
      items = JSON.parse(items);
      return items[id];
    }
  }

  static removeFavourite(id) {
    let i = 1;
    let items = localStorage.getItem("favourite");
    items = JSON.parse(items);
    let newFav = new Array(15);
    while (i <= 15) {
      if (i === parseInt(id)) {
        newFav[i] = "false";
      } else {
        newFav[i] = items[i - 1];
      }

      i++;
    }

    localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
  }
}

class UI {
  displayItems(restaurants, prev = 0, next = 6) {
    let html = "";
    restaurants = restaurants.slice(prev, next);

    restaurants.forEach((restaurant) => {
      html += `
            <div class="item" id=${restaurant.id}>
            <img src="${restaurant.image}" alt="" />
            <button class="bag-btn">
                      ${
                        Storage.getFavourite(restaurant.id - 1) === "true"
                          ? "<i class='fa fa-heart fa-lg'></i>" + "favourite"
                          : "add to favourites"
                      }
                  </button>
            <div class="detail">
              <div><b>Name</b>: ${restaurant.name}</div>
              <div><b>ETA</b>: ${restaurant.ETA}</div>
              <div><b>Rating</b>: ${restaurant.rating}</div>
              <div><b>Location</b>: ${restaurant.location}</div>
            </div>
          </div>`;
    });

    restrauntDOM.innerHTML = html;
  }

  searchText(text, data) {
    const suggestions = data.filter((restaurant) => {
      return restaurant.name.toLowerCase().includes(text.toLowerCase());
    });
    this.outputTypeahead(suggestions);
  }

  outputTypeahead(suggestions) {
    if (search.value != "") {
      let output = "";
      suggestions.forEach((item) => {
        output += `<p class="autocomplete">${item.name}</p>`;
      });

      options.innerHTML = output;
      options.addEventListener("click", (e) => {
        search.value = e.target.textContent;
        options.style.display = "none";
      });
      options.style.display = "block";
    }
  }

  getfavouriteButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    btns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let btnId = e.target.parentNode.id;
        if (e.target.textContent == "favourite") {
          e.target.textContent = "add to favourite";
          Storage.removeFavourite(btnId);
        } else {
          e.target.innerHTML =
            `<i class='fa fa-heart fa-lg'></i>` + "favourite";
          Storage.setFavourite(btnId);
        }
      });
    });
  }
}

const search = document.querySelector("#typeahead");
const restrauntDOM = document.querySelector(".restraunts-center");
const options = document.querySelector("#target");
const favourites = [];

let prev = 0;
let next = 6;
const total = 15;

const ui = new UI();
const restraunts = new Restraunts();
const storage = new Storage();

document.addEventListener("DOMContentLoaded", () => {
  restraunts.getData().then((data) => {
    ui.displayItems(data);
    let items = localStorage.getItem("favourite");
    items = JSON.parse(items);
    if (!items || !items.length) {
      Storage.saveData(data);
    }
    ui.getfavouriteButtons();
  });
});

search.addEventListener("input", () => {
  if (search.value != "") {
    restraunts.getData().then((restaurants) => {
      ui.searchText(search.value, restaurants);
    });
  }
});

document.querySelector(".myform").addEventListener("submit", () => {
  event.preventDefault();
  options.style.display = "none";
  let suggestions;
  restraunts.getData().then((restaurants) => {
    suggestions = restaurants.filter((restaurant) => {
      return restaurant.name.toLowerCase().includes(search.value.toLowerCase());
    });
    ui.displayItems(suggestions);
    ui.getfavouriteButtons();
  });
});

document.querySelector("#sort").addEventListener("change", (event) => {
  restraunts.getData().then((restraunts) => {
    const field = event.target.value;
    if (field && field.length) {
      let items = _.sortBy(restraunts, field);
      if (field === "rating") items.reverse();
      ui.displayItems(items);
    } else {
      ui.displayItems(restraunts);
    }
    ui.getfavouriteButtons();
  });
});

document.getElementById("filter").addEventListener("change", (event) => {
  restraunts.getData().then((data) => {
    const field = event.target.value;
    if (field && field.length) {
      let items = _.filter(data, (item) => {
        tags = item.tags;
        return tags.includes(event.target.value);
      });
      ui.displayItems(items);
    } else {
      ui.displayItems(data);
    }
    ui.getfavouriteButtons();
  });
});

document.getElementById("pagination").addEventListener("click", (event) => {
  const field = event.target.textContent;

  if (field.includes("Next") && next < total) {
    prev += 6;
    next += 6;
    restraunts.getData().then((data) => {
      ui.displayItems(data, prev, next);
      ui.getfavouriteButtons();
    });
  } else if (field.includes("Prev") && prev >= 0) {
    prev = prev - 6;
    next = next - 6;
    restraunts.getData().then((data) => {
      ui.displayItems(data, prev, next);
      ui.getfavouriteButtons();
    });
  }
});
