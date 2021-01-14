const lettersOnlyExpression = /^[A-Za-zĄąĆćĘęŁłÓóŻżŻż" "]+$/;
const numbersOnlyExpression = /^[0-9]{1,}$/;
const moneyExpression = /^[0-9]{1,}\.{0,1}[0-9]{0,2}$/;
const productCodeExpression = /^[a-zA-Z0-9A-Za-zĄąĆćĘęŁłÓóŻżŻż]{2}-[a-zA-Z0-9A-Za-zĄąĆćĘęŁłÓóŻżŻż]{2}$/;

const addButton = document.querySelector(".add-btn");
const inputName = document.querySelector("#inputName");
const inputCode = document.querySelector("#inputCode");
const inputPrice = document.querySelector("#inputPrice");
const inputVAT = document.querySelector("#inputVAT");
const inputPriceBrutto = document.querySelector("#inputPriceBrutto");
const inputPhoto = document.querySelector("#inputPhoto");
const inputCategory = document.querySelector("#inputCategory");
const options = document.querySelectorAll(".option");
const rates = document.querySelectorAll(".rate");
const inputImage = document.querySelector("#inputPhoto");

const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
const sortSelect = document.querySelector("#sortSelect");

let editRowIndex = null;

let cartProducts = [];
if (window.localStorage.getItem("cartProducts") != null) {
  cartProducts = JSON.parse(window.localStorage.getItem("cartProducts"));
  cartProducts.forEach(addToCart);
}

if (window.localStorage.getItem("delivery") != null) {
  document.getElementById(
    window.localStorage.getItem("delivery")
  ).checked = true;
}

let price = null;
let vat = null;


// zmiana dostawy
for (option of deliveryOptions) {
  option.addEventListener("change", function () {
    if (this.checked === true) {
      window.localStorage.setItem("delivery", this.getAttribute("id"));
    }
    calculateTotalSum();
  });
}

// kup
document
  .querySelector(".modal-footer button")
  .addEventListener("click", function () {
    const cartTable = document.querySelector(".cart-table");
    let length = cartTable.rows.length;
    for (let i = 1; i < length; i++) {
      cartTable.deleteRow(1);
    }
    cartProducts = [];
    calculateTotalSum();
    window.localStorage.clear();
    document.querySelector("#post").checked = true;
    showToast("Dziękujemy za zakupy. Zapraszamy ponownie.");
  });

//zmiana widoku
document
  .querySelector("#product-list-view")
  .addEventListener("change", function () {
    if (this.value === "list") {
      document.querySelector("#table-div").style.display = "initial";
      document.querySelector(".gallery").style.display = "none";
    } else {
      document.querySelector("#table-div").style.display = "none";
      document.querySelector(".gallery").style.display = "flex";
    }
  });

//wczytanie jsona
const input = document.querySelector("#myFile");
input.addEventListener(
  "change",
  function () {
    const reader = new FileReader();
    reader.onload = function () {
      const jsonFile = reader.result;
      let jsonProducts = JSON.parse(jsonFile);
      for (let i = 0; i < jsonProducts.length; i++) {
        addRow(jsonProducts[i]);
        addToGallery(jsonProducts[i]);
      }
    };
    reader.readAsText(input.files[0]);
  },
  false
);

// tablesorter settings
$(function () {
  $(".product-table").tablesorter({
    theme: "ice",
    headers: {
      // disable sorting of the first & second column - before we would have to had made two entries
      // note that "first-name" is a class on the span INSIDE the first column th cell
      ".photo, .code, .priceNetto, .vat, .category, .option, .buttons": {
        // disable it by setting the property sorter to false
        sorter: false,
      },
    },

    widgets: ["zebra"], // initialize zebra striping of the table
    widgetOptions: {
      zebra: ["normal-row", "alt-row"],
    },
  });
});

// validation listeners

inputName.addEventListener("blur", function () {
  isNameValid();
});

inputCode.addEventListener("blur", function () {
  isCodeValid();
});

inputPrice.addEventListener("blur", function () {
  if (isPriceValid() === 0) {
    if (vat != null) {
      inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2);
    }
  }
});

inputVAT.addEventListener("blur", function () {
  if (isVATValid() === 0) {
    if (price != null) {
      inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2);
    }
  }
});

inputCategory.addEventListener("blur", function () {
  isCategoryValid();
});

for (let i = 0; i < options.length; i++) {
  let isOptionCorrect;
  options[i].addEventListener("change", function () {
    isOptionsValid();
  });
}

//adding new product
addButton.addEventListener("click", function () {
  if (isOptionsValid !== 0) {
    // 0 - valid, 1 - invalid
    document.querySelector(".option-feedback").style.display = "block";
    document.querySelector(".add-feedback").style.display = "block";
  } else {
    document.querySelector(".option-feedback").style.display = "none";
  }

  if (isProductValid()) {
    if (isProductUnique()) {
      let optionList = document.querySelectorAll(".option:checked+label");

      let options = [];
      for (let i = 0; i < optionList.length; i++) {
        options.push(optionList[i].innerText);
      }

      let product = {
        photo: inputPhoto.value,
        name: inputName.value,
        code: inputCode.value,
        price: inputPrice.value,
        vat: inputVAT.value,
        priceBrutto: inputPriceBrutto.value,
        category: inputCategory.value,
        options: options,
        rate: document.querySelector('input[name="rate"]:checked').value,
      };

      if (editRowIndex !== null) {
        editRow(product);
        resort = true;
        $(".product-table").tablesorter().trigger("update", resort);
        showToast("Uaktualniono produkt");
        editRowIndex = null;
        addButton.innerText = "Dodaj";
      } else {
        addRow(product);
        addToGallery(product);
        showToast("Dodano nowy produkt.");
      }

      resetForm();
      document.querySelector(".add-feedback").style.display = "none";
    } else {
      showToast("Produkt o podanej nazwie już istnieje.");
    }
  } else {
    document.querySelector(".add-feedback").style.display = "block";
  }
});

function isProductValid() {
  if (
    isNameValid() +
      isCodeValid() +
      isPriceValid() +
      isVATValid() +
      isCategoryValid() +
      isOptionsValid() !=
    0
  ) {
    return false;
  } else if (editRowIndex > 0) {
    return true;
  } else {
    return true;
  }
}

//add row
function addRow(product) {
  let options = document.createElement("ul");
  for (let item of product.options) {
    let element = document.createElement("li");
    element.innerHTML = item;
    options.appendChild(element);
  }

  let row =
      "<tr><td><img src='" +
      product.photo +
      "'></td><td class='name'>" +
      product.name +
      "</td><td>" +
      product.code +
      "</td><td>" +
      product.price +
      "</td><td>" +
      product.vat +
      "</td><td class='price-brutto'>" +
      product.priceBrutto +
      "</td><td>" +
      product.category +
      "</td><td>" +
      options.outerHTML +
      "</td><td>" +
      product.rate +
      "</td><td><button class='btn btn-small btn-dark button-edit'>Edytuj</button>" +
      "<button class='btn btn-small btn-dark button-delete'>Usuń</button>" +
      "<button class='btn btn-small btn-dark button-add-to-cart'>Dodaj do koszyka</button></td></tr>",
    $row = $(row),
    // resort table using the current sort; set to false to prevent resort, otherwise
    // any other value in resort will automatically trigger the table resort.
    resort = true;
  $(".product-table")
    .find("tbody")
    .append($row)
    .trigger("addRows", [$row, resort]);

  deleteButtons = document.querySelectorAll(".button-delete");

  deleteButtons[deleteButtons.length - 1].addEventListener(
    "click",
    function () {
      let rowNumber = this.closest("tr").rowIndex;
      deleteElement(rowNumber);
    }
  );

  addToCartButtons = document.querySelectorAll(".button-add-to-cart");

  addToCartButtons[addToCartButtons.length - 1].addEventListener(
    "click",
    function () {
      let index = this.closest("tr").rowIndex;
      addElementToCart(index);
    }
  );

  editButtons = document.querySelectorAll(".button-edit");

  editButtons[editButtons.length - 1].addEventListener("click", function () {
    resetForm();
    let index = this.closest("tr").rowIndex;
    editElementOnClick(index);
  });

  return false;
}

sortSelect.addEventListener("change", function () {
  $(".product-table").trigger("update");

  const map = new Map([
    ["priceAsc", [[[5, 0]]]],
    ["priceDesc", [[[5, 1]]]],
    ["rateAsc", [[[8, 0]]]],
    ["rateDesc", [[[8, 1]]]],
    ["nameA", [[[1, 0]]]],
    ["nameZ", [[[1, 1]]]],
  ]);

  for (let [key, value] of map) {
    if (this.value === key) {
      $(".product-table").trigger("sorton", value);
      break;
    }
  }
});

// reset form
function resetForm() {
  document.querySelector("form").reset();
  const inputs = document.querySelectorAll("form input");
  inputCategory.classList.remove("is-valid");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("is-valid");
  }
}

// checking is product unique
function isProductUnique() {
  const names = document.querySelectorAll(".name");
  for (let i = 0; i < names.length; i++) {
    if (names[i].innerText === inputName.value) {
      if (editRowIndex !== null) {
        if (i !== editRowIndex) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

function addToCart(product) {
  let newRow = document.createElement("TR");
  newRow.innerHTML =
    "<td>" +
    product.name +
    "</td><td class='cart-price-brutto'>" +
    product.price +
    "</td><td><input type='number' min='0' value =" +
    product.numberOfitems +
    " class='numberOfProducts'><button class='delete'>x</button></button></td>";
  document.querySelector(".cart-table").appendChild(newRow);
  calculateTotalSum();

  productCountInputs = document.querySelectorAll(
    ".modal input.numberOfProducts"
  );

  for (let i = 0; i < productCountInputs.length; i++) {
    productCountInputs[i].addEventListener("change", function () {
      // zmiana liczby sztuk
      if (this.value <= 0 || this.value === "") {
        this.value = 1;
        // alert("Wprowadzono nieprawidłową liczbę sztuk. Liczba sztuk została automatycznie ustawiona na 1");
        //showToast("Wprowadzono nieprawidłową liczbę sztuk. Liczba sztuk została automatycznie ustawiona na 1");
        $(".cart-toast-div .toast").toast("show");
        setTimeout(() => {
          document.querySelector(".cart-toast-div .toast").style.display = "none";
          $(".cart-toast-div .toast").toast("hide");
        }, 3000);
      }
      let itemIndex = this.closest("tr").rowIndex;
      let itemName = document.querySelector(".cart-table").rows[itemIndex]
        .cells[0].innerText;
      cartProducts.find(
        (element) => element.name === itemName
      ).numberOfitems = parseInt(this.value);
      window.localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
      calculateTotalSum();
    });
  }

  deleteFromCartButtons = document.querySelectorAll(".cart-table .delete");
  for (let i = 0; i < deleteFromCartButtons.length; i++) {
    deleteFromCartButtons[i].addEventListener("click", function () {
      // usuwanie produktu z koszyka
      let itemIndex = this.closest("tr").rowIndex;
      let rowToDelete = document.querySelector(".cart-table").rows[itemIndex];
      cartProducts.splice(itemIndex - 1, 1);
      document.querySelector(".cart-table").removeChild(rowToDelete);
      calculateTotalSum();
      window.localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
      // WAŻNE zeby jeszcze przetestować bo nie jestem pewna czy działa w 100%
    });
  }
}

function editRow(product) {
  let options = document.createElement("ul");
  for (let item of product.options) {
    let element = document.createElement("li");
    element.innerHTML = item;
    options.appendChild(element);
  }

  const table = document.querySelector(".product-table");
  table.rows[editRowIndex].cells[0].firstElementChild.setAttribute(
    "src",
    product.photo
  );
  table.rows[editRowIndex].cells[1].innerText = product.name;
  table.rows[editRowIndex].cells[2].innerText = product.code;
  table.rows[editRowIndex].cells[3].innerText = product.price;
  table.rows[editRowIndex].cells[4].innerText = product.vat;
  table.rows[editRowIndex].cells[5].innerText = product.priceBrutto;
  table.rows[editRowIndex].cells[6].innerText = product.category;
  table.rows[editRowIndex].cells[7].innerHTML = options.outerHTML;
  table.rows[editRowIndex].cells[8].innerText = product.rate;

  const galleryProduct = document.querySelectorAll(".gallery .gallery-info")[
    editRowIndex - 1
  ];
  galleryProduct.innerHTML = `<div class='img-div'><img class='img-fluid' src='${product.photo}'></div><h5>${product.name}</h5><span>${product.price} zł (${product.priceBrutto} zł)</span>`;
}

function calculateTotalSum() {
  if (cartProducts.length === 0) {
    document.querySelector(".to-pay").innerText = parseFloat("0").toFixed(2);
  } else {
    let toPay = parseFloat(
      document.querySelector('input[name="delivery"]:checked').value
    );
    let numbersOfProducts = document.querySelectorAll(".modal td input");
    for (let j = 0; j < numbersOfProducts.length; j++) {
      toPay +=
        parseFloat(numbersOfProducts[j].value) *
        parseFloat(
          document.querySelector(".cart-table").rows[j + 1].cells[1].innerText
        );
    }
    document.querySelector(".to-pay").innerText = toPay.toFixed(2);
  }
}

function addToGallery(product) {
  let newElement = document.createElement("div");
  newElement.classList.add("col-md-3");
  newElement.classList.add("col-sm-4");
  newElement.classList.add("col-xs-6");
  newElement.classList.add("gallery-element");
  newElement.innerHTML =
    "<div class='gallery-info'><div class='img-div'><img class='img-fluid' src='" +
    product.photo +
    "'></div><h5>" +
    product.name +
    "</h5><span>" +
    product.price +
    " zł (" +
    product.priceBrutto +
    " zł)</span></div>" +
    "<div><button class='btn btn-small btn-dark button-edit-g'>Edytuj</button>" +
    "<button class='btn btn-small btn-dark button-delete-g'>Usuń</button>" +
    "<button class='btn btn-small btn-dark button-add-to-cart-g'>Dodaj do koszyka</button></div>";
  document.querySelector("#product-list .gallery").appendChild(newElement);

  deleteButtons = document.querySelectorAll(".button-delete-g");

  deleteButtons[deleteButtons.length - 1].addEventListener(
    "click",
    function () {
      let rowNumber;
      let name = this.parentElement.parentElement.children[0].children[1]
        .innerText;
      let productTableRows = document.querySelectorAll(".product-table tr");
      for (let i = 0; i < productTableRows.length; i++) {
        if (productTableRows[i].cells[1].innerText === name) {
          rowNumber = i;
        }
      }
      deleteElement(rowNumber);
    }
  );

  addToCartButtons = document.querySelectorAll(".button-add-to-cart-g");

  addToCartButtons[addToCartButtons.length - 1].addEventListener(
    "click",
    function () {
      let rowNumber;
      let name = this.parentElement.parentElement.children[0].children[1]
        .innerText;
      let productTableRows = document.querySelectorAll(".product-table tr");
      for (let i = 0; i < productTableRows.length; i++) {
        if (productTableRows[i].cells[1].innerText === name) {
          rowNumber = i;
        }
      }
      addElementToCart(rowNumber);
    }
  );

  editButtons = document.querySelectorAll(".button-edit-g");

  editButtons[editButtons.length - 1].addEventListener("click", function () {
    resetForm();
    let rowNumber;
    let name = this.parentElement.parentElement.children[0].children[1]
      .innerText;
    let productTableRows = document.querySelectorAll(".product-table tr");
    for (let i = 0; i < productTableRows.length; i++) {
      if (productTableRows[i].cells[1].innerText === name) {
        rowNumber = i;
      }
    }
    editElementOnClick(rowNumber);
  });
}

function deleteElement(rowNumber) {
  document.querySelector(".product-table").deleteRow(rowNumber);
  let galleryElement = document.querySelectorAll(".gallery>div")[rowNumber - 1];
  galleryElement.remove();
  resort = true;
  $(".product-table").tablesorter().trigger("update", resort);
  // alert("Usunięto produkt.");
  showToast("Usunięto produkt.");
}

function addElementToCart(index) {
  let cartProduct = {
    name: document.querySelector(".product-table").rows[index].cells[1]
      .innerText,
    price: document.querySelector(".product-table").rows[index].cells[5]
      .innerText,
    numberOfitems: 1,
  };

  if (cartProducts.find((element) => element.name === cartProduct.name)) {
    let found = cartProducts.find(
      (element) => element.name === cartProduct.name
    );
    found.numberOfitems++;
    let cartRows = document.querySelector(".cart-table").rows;
    for (let i = 1; i < cartRows.length; i++) {
      if (cartRows[i].cells[0].innerText === cartProduct.name) {
        let prevItemCount = cartRows[i].cells[2].firstElementChild.getAttribute(
          "value"
        );
        cartRows[i].cells[2].firstElementChild.setAttribute(
          "value",
          parseInt(prevItemCount) + 1
        );
      }
    }
  } else {
    cartProducts.push(cartProduct);
    addToCart(cartProduct);
  }

  window.localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

  showToast("Przedmiot zostal dodany do koszyka.");
}

function editElementOnClick(index) {
  const table = document.querySelector(".product-table");
  inputPhoto.value = table.rows[index].cells[0].firstElementChild.getAttribute(
    "src"
  );
  inputName.value = table.rows[index].cells[1].innerText;
  inputCode.value = table.rows[index].cells[2].innerText;
  inputPrice.value = table.rows[index].cells[3].innerText;
  inputVAT.value = table.rows[index].cells[4].innerText;
  inputPriceBrutto.value = table.rows[index].cells[5].innerText;
  inputCategory.value = table.rows[index].cells[6].innerText;
  vat = inputVAT.value;
  price = inputPrice.value;

  let options = [];
  let liElements = table.rows[index].cells[7].firstElementChild.children;

  for (element of liElements) {
    options.push(element.innerText);
  }

  const labels = document.querySelectorAll("#options label");

  for (element of options) {
    for (label of labels) {
      if (element === label.innerText) {
        label.parentElement.firstElementChild.checked = true;
      }
    }
  }

  let rate = table.rows[index].cells[8].innerText;

  let radioButtons = document.querySelectorAll("#rates input");

  for (element of radioButtons) {
    if (element.value === rate) {
      element.checked = true;
    }
  }
  editRowIndex = index;
  addButton.innerText = "Edytuj";

  // wyczyszczenie invalid messages jeśli były
  const inputs = document.querySelectorAll("form input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("is-invalid");
    inputs[i].classList.add("is-valid");
  }
  inputCategory.classList.remove("is-invalid");
  inputCategory.classList.add("is-valid");

  document.querySelector(".option-feedback").style.display = "none";

  document.querySelector(".add-feedback").style.display = "none";
}

function showToast(alert) {
  document.querySelector(".toast-div .toast-body .toast-message").innerText = alert;
  document.querySelector(".toast-div .toast").style.display = "flex";
  $(".toast-div .toast").toast("show");
  setTimeout(() => {
    document.querySelector(".toast-div .toast").style.display = "none";
    $(".toast-div .toast").toast("hide");
  }, 3000);
}
