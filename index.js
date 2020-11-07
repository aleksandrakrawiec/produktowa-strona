const lettersOnlyExpression = /^[A-Za-zĄąĆćĘęŁłÓóŻżŻż]+$/;
const numbersOnlyExpression = /^[0-9]{1,}$/;
const moneyExpression = /^[0-9]{1,}\.[0-9]{2}$/;
const productCodeExpression = /^[a-zA-Z0-9A-Za-zĄąĆćĘęŁłÓóŻżŻż]{2}-[a-zA-Z0-9A-Za-zĄąĆćĘęŁłÓóŻżŻż]{2}$/;

var addButton = document.querySelector(".add-btn");
var inputName = document.querySelector("#inputName");
var inputCode = document.querySelector("#inputCode");
var inputPrice = document.querySelector("#inputPrice");
var inputVAT = document.querySelector("#inputVAT");
var inputPriceBrutto = document.querySelector("#inputPriceBrutto");
var inputPhoto = document.querySelector("#inputPhoto");
var inputCategory = document.querySelector("#inputCategory");
var options = document.querySelectorAll(".option");
var rates = document.querySelectorAll(".rate");
var inputImage = document.querySelector("#inputPhoto");
var deleteButtons = document.querySelectorAll(".button-delete");
var addToCartButtons = document.querySelectorAll(".button-add-to-cart");
var editButtons = document.querySelectorAll(".button-edit");
var editRowIndex = null;
var modalInputs = document.querySelectorAll(".modal input");

var validationMap = new Map([
  ["name", false],
  ["code", false],
  ["price", false],
  ["vat", false],
  ["category", false],
  ["option", false],
  ["rate", false],
]);

var cartProducts = [];
if (window.localStorage.getItem("cartProducts") != null) {
  cartProducts = JSON.parse(window.localStorage.getItem("cartProducts"));
  cartProducts.forEach(addToCart);
}

var price = null;
var vat = null;

var sortSelect = document.querySelector("#sortSelect");


document.querySelector(".modal-footer button").addEventListener("click", function() {
  var cartTable = document.querySelector(".cart-table");
  var length = cartTable.rows.length;
  for(var i=1; i<length; i++) {
    cartTable.deleteRow(1);
  }
  cartProducts = [];
  window.localStorage.clear();
  document.querySelector('#post').checked = true;
  alert("Dziękujemy za zakupy. Zapraszamy ponownie.");

})


document.querySelector("#product-list-view").addEventListener("change", function() {
  if(this.value === "list") {
    document.querySelector("#table-div").style.display = "initial";
    document.querySelector(".gallery").style.display = "none";
  }
  else {
    document.querySelector("#table-div").style.display = "none";
    document.querySelector(".gallery").style.display = "inline-flex";
  }

})

// var product = {
//   photo: "product-photo.jpg",
//   name: "Fotel",
//   code: "12-34",
//   price: 240.0,
//   vat: 23,
//   priceBrutto: (240 * (1 + 23 / 100)).toFixed(2),
//   category: "Kategoria 1",
//   options: ["Opcja 2", "Opcja 4"],
//   rate: "3",
// };

// addRow(product);

// product = {
//   photo: "product-photo.jpg",
//   name: "Kanapa",
//   code: "21-34",
//   price: 1200.0,
//   vat: 18,
//   priceBrutto: (1200 * (1 + 18 / 100)).toFixed(2),
//   category: "Kategoria 3",
//   options: ["Opcja 1", "Opcja 3", "Opcja 4"],
//   rate: "5",
// };

// addRow(product);

const input = document.querySelector("#myFile");
input.addEventListener("change", function() {
  const reader = new FileReader();
  reader.onload = function() {
    const jsonFile = reader.result;
    var jsonProducts = JSON.parse(jsonFile);
    for (var i = 0; i < jsonProducts.length; i++) {
      addRow(jsonProducts[i]);
      addToGallery(jsonProducts[i]);
    }
  }
  reader.readAsText(input.files[0]);
}, false);


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

// VALIDATION

inputName.addEventListener("blur", function () {
  validationMap.set("name", testExpression(this, lettersOnlyExpression));
});

inputCode.addEventListener("blur", function () {
  validationMap.set("code", testExpression(this, productCodeExpression));
});

inputPrice.addEventListener("blur", function () {
  var text = this.value;
  var isPriceCorrect;
  var result = moneyExpression.test(text);
  if (result == false) {
    result = numbersOnlyExpression.test(text);
    if (result == false) {
      inputPrice.classList.add("is-invalid");
      isPriceCorrect = false;
    } else {
      this.value += ".00";
      inputPrice.classList.remove("is-invalid");
      inputPrice.classList.add("is-valid");
      isPriceCorrect = true;
      price = this.value;
      if (vat != null) {
        inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2); // toFixed - round to n decimal places
      }
    }
  } else {
    inputPrice.classList.remove("is-invalid");
    inputPrice.classList.add("is-valid");
    isPriceCorrect = true;
    price = this.value;
    if (vat != null) {
      inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2);
    }
  }

  validationMap.set("price", isPriceCorrect);
});

inputVAT.addEventListener("blur", function () {
  var isVATCorrect;
  if ((isVATCorrect = testExpression(this, numbersOnlyExpression))) {
    vat = this.value;
    if (price != null) {
      inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2);
    }
  }
  validationMap.set("vat", isVATCorrect);
});

inputCategory.addEventListener("blur", function () {
  var isCategoryCorrect;
  if (this.value == "default") {
    inputCategory.classList.add("is-invalid");
    isCategoryCorrect = false;
  } else {
    inputCategory.classList.remove("is-invalid");
    inputCategory.classList.add("is-valid");
    isCategoryCorrect = true;
  }
  validationMap.set("category", isCategoryCorrect);
});

for (var i = 0; i < options.length; i++) {
  var isOptionCorrect;
  options[i].addEventListener("change", function () {
    var checkedOptions = document.querySelectorAll(".option:checked").length;

    if (checkedOptions >= 2) {
      document.querySelector(".option-feedback").style.display = "none";
      isOptionCorrect = true;
    } else {
      document.querySelector(".option-feedback").style.display = "block";
      isOptionCorrect = false;
    }
    validationMap.set("option", isOptionCorrect);
  });
}

for (var i = 0; i < rates.length; i++) {
  rates[i].addEventListener("change", function () {
    validationMap.set("rate", true);
    document.querySelector(".rate-feedback").style.display = "none";
  });
}

//adding new product
addButton.addEventListener("click", function () {
  if (!validationMap.get("rate")) {
    document.querySelector(".rate-feedback").style.display = "block";
    document.querySelector(".add-feedback").style.display = "block";
  } else {
    document.querySelector(".rate-feedback").style.display = "none";
  }
  if (!validationMap.get("option")) {
    document.querySelector(".option-feedback").style.display = "block";
    document.querySelector(".add-feedback").style.display = "block";
  } else {
    document.querySelector(".option-feedback").style.display = "none";
  }

  if (isProductValid()) {
    if (isProductUnique() || editRowIndex !== null) {
      var optionList = document.querySelectorAll(".option:checked+label");

      var options = [];
      for (var i = 0; i < optionList.length; i++) {
        options.push(optionList[i].innerText);
      }

      var product = {
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
        alert("Uaktualniono produkt");
        editRowIndex = null;
        addButton.innerText = "Dodaj";
      } else {
        addRow(product);
        addToGallery(product);
        alert("Dodano nowy produkt.");
      }

      resetForm();
      document.querySelector(".add-feedback").style.display = "none";
    } else {
      if (editRowIndex === null) {
        alert("Produkt o podanej nazwie już istnieje.");
      }
    }
  } else {
    document.querySelector(".add-feedback").style.display = "block";
  }
});




// FUNCTIONS

//validadion
function testExpression(input, expression) {
  var text = input.value;
  var result = expression.test(text);
  if (result == false) {
    input.classList.add("is-invalid");
    return false;
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    return true;
  }
}

function isProductValid() {
  for (var [key, value] of validationMap) {
    if (value === false) {
      return false;
    }
  }
  return true;
}

//add row
function addRow(product) {
  var options = document.createElement("ul");
  for (var item of product.options) {
    var element = document.createElement("li");
    element.innerHTML = item;
    options.appendChild(element);
  }

  var row =
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
      var rowNumber = this.closest("tr").rowIndex;
      document.querySelector(".product-table").deleteRow(rowNumber);
      alert("Usunięto produkt.");
    }
  );

  addToCartButtons = document.querySelectorAll(".button-add-to-cart");

  addToCartButtons[addToCartButtons.length - 1].addEventListener(
    "click",
    function () {
      var index = this.closest("tr").rowIndex;
      var cartProduct = {
        name: document.querySelector(".product-table").rows[index].cells[1]
          .innerText,
        price: document.querySelector(".product-table").rows[index].cells[5]
          .innerText,
        numberOfitems: 1,
      };

      
      cartProducts.push(cartProduct);

      window.localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

      addToCart(cartProduct);

      alert("Przedmiot zostal dodany do koszyka.");
    }
  );

  editButtons = document.querySelectorAll(".button-edit");

  editButtons[editButtons.length - 1].addEventListener("click", function () {
    resetForm();

    var index = this.closest("tr").rowIndex;
    var table = document.querySelector(".product-table");
    inputPhoto.value = table.rows[
      index
    ].cells[0].firstElementChild.getAttribute("src");
    inputName.value = table.rows[index].cells[1].innerText;
    inputCode.value = table.rows[index].cells[2].innerText;
    inputPrice.value = table.rows[index].cells[3].innerText;
    inputVAT.value = table.rows[index].cells[4].innerText;
    inputPriceBrutto.value = table.rows[index].cells[5].innerText;
    inputCategory.value = table.rows[index].cells[6].innerText;
    vat = inputVAT.value;
    price = inputPrice.value;

    var options = [];
    var liElements = table.rows[index].cells[7].firstElementChild.children;

    for (element of liElements) {
      options.push(element.innerText);
    }

    var labels = document.querySelectorAll("#options label");

    for (element of options) {
      for (label of labels) {
        if (element === label.innerText) {
          label.parentElement.firstElementChild.checked = true;
        }
      }
    }

    var rate = table.rows[index].cells[8].innerText;

    var radioButtons = document.querySelectorAll("#rates input");

    for (element of radioButtons) {
      if (element.value === rate) {
        element.checked = true;
      }
    }
    editRowIndex = index;
    addButton.innerText = "Edytuj";

    for (var [key, value] of validationMap) {
      validationMap.set(key, true);
    }

    var inputs = document.querySelectorAll("form input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].classList.remove("is-invalid");
      inputs[i].classList.add("is-valid");
    }
  });

  return false;
}

sortSelect.addEventListener("change", function () {
  $(".product-table").trigger("update");

  var map = new Map([
    ["priceAsc", [[[5, 0]]]],
    ["priceDesc", [[[5, 1]]]],
    ["rateAsc", [[[8, 0]]]],
    ["rateDesc", [[[8, 1]]]],
    ["nameA", [[[1, 0]]]],
    ["nameZ", [[[1, 1]]]],
  ]);

  for (var [key, value] of map) {
    if (this.value === key) {
      $(".product-table").trigger("sorton", value);
      break;
    }
  }
});

// reset form
function resetForm() {
  document.querySelector("form").reset();
  var inputs = document.querySelectorAll("form input");
  inputCategory.classList.remove("is-valid");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("is-valid");
  }

  for (var [key, value] of validationMap) {
    validationMap.set(key, false);
  }
}

// checking is product unique
function isProductUnique() {
  var names = document.querySelectorAll(".name");
  for (var i = 0; i < names.length; i++) {
    if (names[i].innerText === inputName.value) {
      return false;
    }
  }
  return true;
}

function addToCart(product) {
  var newRow = document.createElement("TR");
  newRow.innerHTML =
    "<td>" +
    product.name +
    "</td><td class='cart-price-brutto'>" +
    product.price +
    "</td><td><input type='number' value =" + product.numberOfitems + " class='numberOfProducts'></td>";
  document.querySelector(".cart-table").appendChild(newRow);
  calculateTotalSum();

  modalInputs = document.querySelectorAll(".modal input");

  for(var i=0; i<modalInputs.length; i++) {
    modalInputs[i].addEventListener("change", function(){
      calculateTotalSum();
    })
  }

}

function editRow(product) { // dodać tu edytowanie w galerii
  var options = document.createElement("ul");
  for (var item of product.options) {
    var element = document.createElement("li");
    element.innerHTML = item;
    options.appendChild(element);
  }


  var table = document.querySelector(".product-table");
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

  var galleryProduct = document.querySelectorAll(".gallery figure")[editRowIndex-1];
  galleryProduct.innerHTML = "<div class='img-div'><img class='img-fluid' src='" + product.photo + "'></div><h5>" + 
  product.name +"</h5>" + product.price + " zł (" + product.priceBrutto + " zł)";
}

function calculateTotalSum() {
  var toPay = parseFloat(document.querySelector('input[name="delivery"]:checked').value);
  var numbersOfProducts = document.querySelectorAll(".modal td input");
  for(var j=0; j<numbersOfProducts.length; j++) {
    toPay += parseFloat(numbersOfProducts[j].value) * parseFloat(document.querySelector(".cart-table").rows[j+1].cells[1].innerText);
  }
  document.querySelector(".to-pay").innerText = toPay.toFixed(2);
}

function addToGallery(product) {
  var newElement = document.createElement("figure");
  newElement.classList.add("col-md-3");
  newElement.classList.add("col-sm-4");
  newElement.classList.add("col-xs-6");
  newElement.classList.add("img-thumbnail");
  newElement.classList.add("gallery-element");
  newElement.innerHTML = "<div class='img-div'><img class='img-fluid' src='" + product.photo + "'></div><h5>" + 
  product.name +"</h5>" + product.price + " zł (" + product.priceBrutto + " zł)";
  document.querySelector("#product-list .gallery").appendChild(newElement);
}