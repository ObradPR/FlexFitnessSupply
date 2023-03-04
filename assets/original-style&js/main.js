"use strict";

// GLOBAL DATA
const url = window.location.pathname;
let proizvodi = [];
const collapseMenuButton = document.querySelector(`#toggle`);
const navMeni = document.querySelector(`#nav__menu`);
const cartBtn = document.querySelector(`#cart`);
const logo = document.querySelector(`#logo`);

// GLOBAL AJAX CALLS
ajaxCall("navMeni", ispisNavMeni);

// GLOBAL EVENTS
collapseMenuButton.addEventListener(`click`, function () {
  $(navMeni).slideToggle();
});

// PAGE

if (url === "/" || url === "/index.html") {
  //  INDEX DATA
  const sliderContainer = document.querySelector(
    `#slider__promotion_container`
  );
  const bestProductsContainer = document.querySelector(
    `#best__products_container`
  );

  $(document).ready(function () {
    // INDEX PROMOTION SLDIER
    $(`#slider__promotion`).skdslider({
      slideSelector: `.slide__promotion`,
      delay: 4000,
      animationSpeed: 1000,
      showNextPrev: false,
      showPlayButton: false,
      autoSlide: true,
      animationType: `sliding`,
    });
  });

  // INDEX AJAX CALLS
  ajaxCall("products", ispisNajprodavanijihProizvoda);
  ajaxCall("promotion__products", ispisPromocija);

  // INDEX FUNCTIONS
  function ispisNajprodavanijihProizvoda(data) {
    let sadrzaj = "";

    for (let obj of data) {
      if (obj.najprodavaniji) {
        sadrzaj += ispisProizvodBloka(obj);
      }
    }

    bestProductsContainer.innerHTML = sadrzaj;
  }
  function ispisPromocija(data) {
    let sadrzaj = "";

    for (let obj of data) {
      sadrzaj += `<li class="slide__promotion"><img src="${obj.slika.src}" alt="${obj.slika.alt}" /></li>`;
    }

    sliderContainer.innerHTML = sadrzaj;
  }
} else if (url === "/shop.html") {
  // SHOP DATA
  const sidebarBrendContainer = document.querySelector(`#sidebar__brands`);
  const sidebarCategoryContainer =
    document.querySelector(`#sidebar__categories`);
  const productsContainer = document.querySelector(`#all__products`);
  const sortDdl = document.querySelector(`#sortDdl`);
  const searchTb = document.querySelector(`#searchTb`);

  // SHOP AJAX CALLS
  ajaxCall("brand", ispisBrendova);
  ajaxCall("category", ispisKategorije);
  ajaxCall("products", ispisProizvoda);

  // SHOP EVENTS
  sortDdl.addEventListener(`change`, function () {
    filterChange();
  });
  document.querySelectorAll(`.stanje`).forEach(function (cb) {
    cb.addEventListener(`change`, filterChange);
  });
  document.querySelectorAll(`.kolekcija`).forEach(function (cb) {
    cb.addEventListener(`change`, filterChange);
  });
  searchTb.addEventListener(`keyup`, filterChange);

  // ADD PRODUCT TO LOCAL STORAGE EVENT
  $(document).ready(function () {
    let data;
    data = JSON.parse(localStorage.getItem("zaKupovinu"));
    if (data == null) {
      data = [];
    }
    document.querySelectorAll(`.add__to_cart`).forEach((btn) => {
      btn.addEventListener(`click`, function (e) {
        e.preventDefault();

        setTimeout(() => {
          document.querySelector(`#success__cart`).style.display = `none`;
        }, 900);
        document.querySelector(`#success__cart`).style.display = `block`;

        let id = btn.nextSibling.nextSibling.defaultValue;
        let p = proizvodi.find((x) => x.id == id);
        if (p.dostupnost) {
          data.push(p);
          dodajULocalStorage(data);
        }
      });
    });
  });

  // SHOP FUNCTIONS
  function ispisSidebarTeksta(data, classs) {
    let sadrzaj = "";
    let value = 1;
    for (let obj of data) {
      sadrzaj += `<div class="sidebar__row">
      <label for="${obj.naziv}">${obj.naziv}</label>
      <input type="checkbox" name="${obj.naziv}" id="${
        obj.naziv
      }" class="${classs}" value="${value++}"/>
    </div>`;
    }

    return sadrzaj;
  }
  function ispisBrendova(data) {
    sidebarBrendContainer.innerHTML = ispisSidebarTeksta(data, "brands");
    document.querySelectorAll(`.brands`).forEach((x) => {
      x.addEventListener(`change`, filterChange);
    });
  }
  function ispisKategorije(data) {
    sidebarCategoryContainer.innerHTML = ispisSidebarTeksta(data, "categories");
    document.querySelectorAll(`.categories`).forEach((x) => {
      x.addEventListener(`change`, filterChange);
    });
  }
  function ispisProizvoda(data) {
    proizvodi = data;
    data = filterBrands(data);
    data = filterCategory(data);
    data = filterDostupnosti(data);
    data = filterKolekcija(data);
    data = filterPretraga(data);
    data = sorting(data);

    let sadrzaj = "";
    if (data.length === 0) {
      sadrzaj += `<p>Nemamo proizvode za izabrane kategorije</p>`;
    } else {
      for (let obj of data) {
        sadrzaj += ispisProizvodBloka(obj);
      }
    }
    productsContainer.innerHTML = sadrzaj;
  }
  function sorting(data) {
    let sortingType = sortDdl.value;
    if (sortingType === `asc__name`) {
      return data.sort((a, b) => (a.naziv > b.naziv ? 1 : -1));
    } else if (sortingType === `desc__name`) {
      return data.sort((a, b) => (a.naziv < b.naziv ? 1 : -1));
    } else if (sortingType === `asc__price`) {
      return data.sort((a, b) =>
        +a.cena.aktuelnaCena > +b.cena.aktuelnaCena ? 1 : -1
      );
    } else if (sortingType === `asc__price`) {
      return data.sort((a, b) =>
        +a.cena.aktuelnaCena > +b.cena.aktuelnaCena ? 1 : -1
      );
    } else if (sortingType === `desc__price`) {
      return data.sort((a, b) =>
        +a.cena.aktuelnaCena < +b.cena.aktuelnaCena ? 1 : -1
      );
    } else if (sortingType === `sort__star`) {
      return data.sort((a, b) => (a.ocena.stars < b.ocena.stars ? 1 : -1));
    } else if (sortingType === `sort__comments`) {
      return data.sort((a, b) =>
        a.ocena.komentari < b.ocena.komentari ? 1 : -1
      );
    }
    return data;
  }
  function filterCategory(data) {
    let selectedCategories = [];
    document.querySelectorAll(`.categories:checked`).forEach(function (el) {
      selectedCategories.push(parseInt(el.value));
    });
    if (selectedCategories.length != 0) {
      return data.filter((x) =>
        x.kategorije.some((k) => selectedCategories.includes(k))
      );
    }
    return data;
  }
  function filterBrands(data) {
    let selectedBrands = [];
    document.querySelectorAll(`.brands:checked`).forEach(function (el) {
      selectedBrands.push(parseInt(el.value));
    });
    if (selectedBrands.length != 0) {
      return data.filter((x) => selectedBrands.includes(x.brend));
    }
    return data;
  }
  function filterDostupnosti(data) {
    let selectedDostupnost = [];
    document.querySelectorAll(`.stanje:checked`).forEach(function (el) {
      let id = el.getAttribute(`id`);
      if (id === `stanje__ima`) selectedDostupnost.push(true);
      if (id === `stanje__nema`) selectedDostupnost.push(false);
    });
    if (selectedDostupnost.length != 0) {
      return data.filter((x) => selectedDostupnost.includes(x.dostupnost));
    }
    return data;
  }
  function filterKolekcija(data) {
    let proizvodi;
    let novi = [];
    let akcijski = [];
    let najprodavaniji = [];
    document.querySelectorAll(`.kolekcija`).forEach(function (cb) {
      if (cb.checked && cb.id === `novo`) {
        novi = data.filter((x) => x.novo === true);
      }
      if (cb.checked && cb.id === `akcija`) {
        akcijski = data.filter((x) => x.cena.staraCena);
      }
      if (cb.checked && cb.id === `najprodavaniji`) {
        najprodavaniji = data.filter((x) => x.najprodavaniji === true);
      }
    });
    proizvodi = [...novi, ...akcijski, ...najprodavaniji];
    if (proizvodi.length != 0) {
      return proizvodi;
    }
    return data;
  }
  function filterPretraga(data) {
    const unos = searchTb.value;

    let filtriranNiz = data.filter(function (el) {
      if (el.naziv.toUpperCase().indexOf(unos.trim().toUpperCase()) != -1) {
        return el;
      }
    });

    return filtriranNiz;
  }
  function filterChange() {
    ajaxCall("products", ispisProizvoda);
  }
} else if (url === "/contact.html") {
  // CONTACT DATA
  const poruka = document.querySelector(`#polje__tekst`);
  const ddlOpcije = document.querySelector(`#ddl__opcije`);
  const formBtnSubmit = document.querySelector(`#form__subimt_btn`);
  const brKaraktera = document.querySelector(`#broj__karaktera`);
  const txtAreaRow = document.querySelector(`.form_row__txtarea`);

  const errorIme = document.querySelector(`#error__ime`);
  const errorPrezime = document.querySelector(`#error__prezime`);
  const errorTelefon = document.querySelector(`#error__telefon`);
  const errorMejl = document.querySelector(`#error__mejl`);
  const errorPoruka = document.querySelector(`#error__poruka`);

  // CONTACT EVENTS
  poruka.addEventListener(`keyup`, function () {
    let broj = poruka.value.length;
    brKaraktera.innerHTML = broj;
  });

  formBtnSubmit.addEventListener(`click`, function (e) {
    e.preventDefault();
    podaciIzForme();
  });

  // CONTACT FUNCTIONS
  function podaciIzForme() {
    let ime = document.querySelector(`#ime`);
    let prezime = document.querySelector(`#prezime`);
    let telefon = document.querySelector(`#telefon`);
    let mejl = document.querySelector(`#mejl`);
    let poruka = document.querySelector(`#polje__tekst`);
    let opcija = document.querySelector(`#ddl__opcije`);

    proveraPodataka(ime, prezime, telefon, mejl, poruka, opcija);
  }

  function proveraPodataka(ime, prezime, telefon, mejl, poruka, opcija) {
    const imePrezimeRegEx = /^[A-ZŽĆČŠĐ][a-zžćčšđ]+$/;
    const mejlRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const telefonRegEx = /^[\+]381\s6[0-9]{8}$/;

    let greske = false;
    if (ime.value.match(imePrezimeRegEx)) {
      errorIme.style.display = `none`;
    } else {
      errorIme.style.display = `block`;
      greske = true;
    }
    if (prezime.value.match(imePrezimeRegEx)) {
      errorPrezime.style.display = `none`;
    } else {
      errorPrezime.style.display = `block`;
      greske = true;
    }
    if (telefon.value.match(telefonRegEx)) {
      errorTelefon.style.display = `none`;
    } else {
      errorTelefon.style.display = `block`;
      greske = true;
    }
    if (mejl.value.match(mejlRegEx)) {
      errorMejl.style.display = `none`;
    } else {
      errorMejl.style.display = `block`;
      greske = true;
    }
    if (poruka.value.length >= 50) {
      errorPoruka.style.display = `none`;
      txtAreaRow.style.justifyContent = `flex-end`;
    } else {
      txtAreaRow.style.justifyContent = `space-between`;
      errorPoruka.style.display = `block`;
      greske = true;
    }
    if (opcija.value != 0) {
      ddlOpcije.style.border = `1px solid #707070`;
    } else {
      ddlOpcije.style.border = `1px solid #fc7c78`;
      greske = true;
    }

    if (!greske) {
      ime.value = ``;
      prezime.value = ``;
      telefon.value = ``;
      mejl.value = ``;
      poruka.value = ``;
      ddlOpcije.value = "0";
      brKaraktera.innerHTML = 0;
    }
  }
} else if (url === "/cart.html") {
  // CART DATA
  let proizvodiUKorpi;
  const cartProductsContainer = document.querySelector(`#cart__products`);

  // CART EVENTS
  postavaljanjeStanjaKorpe();
  ispisProizvodaIzLocalStorage(proizvodiUKorpi);

  document.querySelectorAll(`.plus`).forEach(function (btn) {
    btn.addEventListener(`click`, function () {
      let id = prodnadjiProizvod(this);

      proizvodiUKorpi.push(proizvodiUKorpi.find((x) => x.id == id));
      dodajULocalStorage(proizvodiUKorpi);

      statickaPromena(this, "previousSibling", id);
    });
  });
  document.querySelectorAll(`.minus`).forEach(function (btn) {
    btn.addEventListener(`click`, function () {
      let id = prodnadjiProizvod(this);

      let el = proizvodiUKorpi.find((x) => x.id == id);
      let index;
      for (let i in proizvodiUKorpi) {
        if (el == proizvodiUKorpi[i]) {
          index = i;
        }
      }

      statickaPromena(this, "nextSibling", id);
      if (index != undefined) proizvodiUKorpi.splice(index, 1);
      dodajULocalStorage(proizvodiUKorpi);
      postavaljanjeStanjaKorpe();
    });
  });

  document.querySelectorAll(`#cart__btns a`).forEach((btn) => {
    btn.addEventListener(`click`, function (e) {
      e.preventDefault();

      if (this.id == `del__all`) {
        arzurirajBrisanjeKupovina();
      }

      if (this.id == `buy__all`) {
        if (proizvodiUKorpi.length != 0) {
          arzurirajBrisanjeKupovina();

          setTimeout(() => {
            document.querySelector(`#success__mess`).style.display = `none`;
          }, 3000);
          document.querySelector(`#success__mess`).style.display = `block`;
        }
      }
    });
  });

  // CART FUNCTIONS
  function uzimanjeVrednostiIzLocalStorage() {
    proizvodiUKorpi = JSON.parse(localStorage.getItem("zaKupovinu"));
  }
  function postavaljanjeStanjaKorpe() {
    uzimanjeVrednostiIzLocalStorage();
    if (proizvodiUKorpi.length == 0) {
      document.querySelector(`#cart__empty`).style.display = `block`;
      document.querySelector(`.money`).innerHTML = 0;
    }
  }
  function ispisProizvodaIzLocalStorage(data) {
    let ispis = "";
    let qnt;
    let key = "id";
    let ukpnaCena = 0;

    const arrayUniqueByKey = [
      ...new Map(data.map((item) => [item[key], item])).values(),
    ];

    for (let obj of arrayUniqueByKey) {
      qnt = data.filter((x) => x.id == obj.id).length;
      ispis += `<div class="cart__product_container">
      <div class="cart__product">
        <div class="cart__product_img">
          <img src="${obj.slika.src}" alt="${obj.slika.alt}" />
        </div>
        <div class="cart__product_info">
          <h2>Naziv proizvoda</h2>
          <p>${obj.naziv}</p>
        </div>
        <div class="cart__product_funn">
          <h3>Cena proizvoda: ${obj.cena.aktuelnaCena} din.</h3>
          <div class="cart__product_funn-row">
            <p>Kolicina:</p>
            <button class="minus"><b>-</b></button>
            <span class="kol">${qnt}</span>
            <button class="plus"><b>+</b></button>
          </div>
          <p>Ukupna cena: <span class="cena__el">${
            obj.cena.aktuelnaCena * qnt
          }</span> din.</p>
        </div>
      </div>
      <a href="#" class="del" id="${obj.id}">Obrisi</a>
    </div>`;
      ukpnaCena += +obj.cena.aktuelnaCena * qnt;
    }

    cartProductsContainer.innerHTML = ispis;
    document.querySelector(`.money`).innerHTML = ukpnaCena;
  }
  function prodnadjiProizvod(el) {
    let id =
      el.parentElement.parentElement.parentElement.nextSibling.nextSibling.id;
    return id;
  }
  function statickaPromena(el, sibling, id) {
    let ukupnaCena = document.querySelector(`.money`);
    let col;
    let cena;
    let cenaProizvoda;
    if (sibling == `previousSibling`) {
      col = el.previousSibling.previousSibling;
    }
    if (sibling == `nextSibling`) {
      col = el.nextSibling.nextSibling;
      col.innerHTML = +col.innerHTML - 1;
    }
    cenaProizvoda = proizvodiUKorpi.find((x) => x.id == id).cena.aktuelnaCena;
    if (+col.innerHTML == 0) {
      el.parentElement.parentElement.parentElement.parentElement.style.display = `none`;
      ukupnaCena.innerHTML = +ukupnaCena.innerHTML - +cenaProizvoda;
    } else {
      cena = el.parentElement.nextSibling.nextSibling.firstElementChild;
      if (sibling == `nextSibling`) {
        cena.innerHTML = +cena.innerHTML - +cenaProizvoda;
        ukupnaCena.innerHTML = +ukupnaCena.innerHTML - +cenaProizvoda;
      } else {
        col.innerHTML = +col.innerHTML + 1;
        cena.innerHTML = +cena.innerHTML + +cenaProizvoda;
        ukupnaCena.innerHTML = +ukupnaCena.innerHTML + +cenaProizvoda;
      }
    }
  }
  function isprazniLocalStorage() {
    localStorage.removeItem(`zaKupovinu`);
  }
  function arzurirajBrisanjeKupovina() {
    isprazniLocalStorage();
    proizvodiUKorpi = [];
    dodajULocalStorage(proizvodiUKorpi);
    ispisProizvodaIzLocalStorage(proizvodiUKorpi);
    postavaljanjeStanjaKorpe();
  }
}

// GLOBAL FUNCTIONS
function ispisProizvodBloka(obj, txtVar) {
  txtVar = `<div class="product__block">
  ${
    obj.najprodavaniji
      ? "<div class='bestseller'><img src='assets/img/bestseller.png' alt='bestseller mark' /></div>"
      : ""
  }
  ${
    obj.cena.staraCena
      ? "<div class='salemark'><img src='assets/img/salemark__15.png' alt='salemark 15%'/></div>"
      : ""
  }
  ${
    obj.dostupnost
      ? ""
      : "<div class='rasprodato'><img src='assets/img/rasprodato.png' alt='rasprodato mark'/></div>"
  }
  <img
    src="${obj.slika.src}"
    alt="${obj.slika.alt}"
  />
  <h3>${obj.naziv}</h3>
  <div class="prodcut__stats">
    <p>
      <span class="product__stars">(${obj.ocena.stars})</span
      >${ispisiZvezdice(obj.ocena.stars)}
    </p>
    <p><span class="product__coments">(${
      obj.ocena.komentari
    })</span> Komentara</p>
  </div>
  <div id="product__info">
    <div id="price">
    <p>${obj.cena.aktuelnaCena} RSD</p>
    <del>${obj.cena.staraCena ? obj.cena.staraCena + " RSD" : ""}</del>
    </div>
    <a href="#" class="add__to_cart"><i class="fa-solid fa-bag-shopping"></i></a>
    <input type="hidden" value="${obj.id}"/>
  </div>
</div>`;
  return txtVar;
}
function ispisiZvezdice(stars) {
  let sadrzaj = "";
  stars = Math.trunc(stars);
  for (let i = 0; i < stars; i++) {
    sadrzaj += "<i class='fa-regular fa-star'></i>";
  }
  return sadrzaj;
}
function ajaxCall(file, callback) {
  $.ajax({
    url: `assets/json/${file}.json`,
    type: "get",
    dataType: "json",
    success(data) {
      callback(data);
    },
    error(xhr) {
      console.log(xhr);
    },
  });
}
function ispisNavMeni(data) {
  let meni = "";
  for (let obj of data) {
    meni += `<li><a href="${obj.href}">${obj.naziv}</a></li>`;
  }
  $("#nav__menu").html(meni);
}
function dodajULocalStorage(data) {
  localStorage.setItem("zaKupovinu", JSON.stringify(data));
}
