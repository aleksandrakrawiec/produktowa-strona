const lettersOnlyExpression = /^[A-Za-z]+$/;
const numbersOnlyExpression = /^[0-9]{1,}$/;
const moneyExpression = /^[0-9]{1,}\.[0-9]{2}$/;
const productCodeExpression = /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{2}$/;

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
var addToBasketButtons = document.querySelectorAll(".button-add-to-basket");
var checkedOptions = 0;

var validationMap = new Map([
  ["name", false],
  ["code", false],
  ["price", false],
  ["vat", false],
  ["category", false],
  ["option", false],
  ["rate", false],
]);

// var cartProducts = JSON.parse(window.localStorage.getItem("cartProducts"));
var cartProducts = [];
if(window.localStorage.getItem("cartProducts") != null) {
  cartProducts = JSON.parse(window.localStorage.getItem("cartProducts"));
  cartProducts.forEach(addToCart);
}

// var isNameCorrect = false;
// var isCodeCorrect = false;
// var isPriceCorrect = false;
// var isVATCorrect = false;
// var isCategoryCorrect = false;
// var isOptionCorrect = false;
// var isRateCorrect = false;

var price = null;
var vat = null;

var sortSelect = document.querySelector("#sortSelect");

var product = {
  "photo" : "product-photo.jpg",
  "name" : "Fotel",
  "code" : "12-34",
  "price" : "21.37",
  "vat" : "12",
  "priceBrutto" : "34",
  "category" : "elo",
  "options" : "Opcja 2",
  "rate" : "3",
}

addRow(product);

product = {
  "photo" : "product-photo.jpg",
  "name" : "Kanapa",
  "code" : "21-34",
  "price" : "12.37",
  "vat" : "22",
  "priceBrutto" : "41",
  "category" : "elo siema",
  "options" : "Opcja 5",
  "rate" : "5",
}

addRow(product);


$(function () {
  $(".product-table").tablesorter({
    theme: "ice",
    headers: {
        // disable sorting of the first & second column - before we would have to had made two entries
        // note that "first-name" is a class on the span INSIDE the first column th cell
        '.photo, .code, .priceNetto, .vat, .category, .option, .buttons' : {
          // disable it by setting the property sorter to false
          sorter: false
        }
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
    if (this.checked) {
      checkedOptions++;
    } else {
      checkedOptions--;
    }

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

  if (
    isProductValid() && isProductUnique()
  ) {
    var optionList =  document.querySelectorAll('.option:checked+label');
    var finalOptions = ""; 

    for(var i=0; i<optionList.length; i++) {
        finalOptions += optionList[i].innerText + "<br>";
    }

    var product = {
      "photo" : inputPhoto.value,
      "name" : inputName.value,
      "code" : inputCode.value,
      "price" : inputPrice.value,
      "vat" : inputVAT.value,
      "priceBrutto" : inputPriceBrutto.value,
      "category" : inputCategory.value,
      "options" : finalOptions,
      "rate" : document.querySelector('input[name="rate"]:checked').value,
    }

    addRow(product);
    alert("Dodano nowy produkt.");
  } else {
    if(!isProductUnique()) {
        alert("Produkt o podanej nazwie już istnieje.")
    }
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
  for(var [key, value] of validationMap) {
    if(value === false) {
      return false;
    }
  }
  return true;
}

//add row
function addRow(product) {

    var row =
      "<tr><td><img src='" +
      product.photo +
      "'></td><td>" +
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
      product.options +
      "</td><td>" +
      product.rate +
      "</td><td><button class='btn btn-small btn-dark button-edit'>Edytuj</button>" +
      "<button class='btn btn-small btn-dark button-delete'>Usuń</button>" +
      "<button class='btn btn-small btn-dark button-add-to-basket'>Dodaj do koszyka</button></td></tr>",

      $row = $(row),
      // resort table using the current sort; set to false to prevent resort, otherwise
      // any other value in resort will automatically trigger the table resort.
      resort = true;
    $('.product-table')
      .find('tbody').append($row)
      .trigger('addRows', [$row, resort]);


      deleteButtons = document.querySelectorAll(".button-delete");

      deleteButtons[deleteButtons.length-1].addEventListener("click", function(){
        var rowNumber = this.closest('tr').rowIndex;
          document.querySelector(".product-table").deleteRow(rowNumber);
          alert("Usunięto produkt.");
        });
    
    
      addToBasketButtons = document.querySelectorAll(".button-add-to-basket");
      var index = addToBasketButtons.length-1;
      
      addToBasketButtons[index].addEventListener("click", function(){
        var cartProduct = {
          name : document.querySelector(".product-table").rows[index+1].cells[1].innerText,
          price : document.querySelector(".product-table").rows[index+1].cells[5].innerText,
          numberOfitems : 1
        };
        cartProducts.push(cartProduct);
        
        window.localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
      
        addToCart(cartProduct);
    
      })
    
        
        resetForm();
        document.querySelector(".add-feedback").style.display = "none";
        
    

    return false;

}


sortSelect.addEventListener("change", function () {
  $('.product-table').trigger('update');

  var map = new Map([
    ["priceAsc",  [[[5,0]]] ],
    ["priceDesc", [[[5,1]]] ],
    ["rateAsc",   [[[8,0]]] ],
    ["rateDesc",  [[[8,1]]] ],
    ["nameA",     [[[1,0]]] ],
    ["nameZ",     [[[1,1]]] ],
  ]);

  for(var [key, value] of map) {
    if (this.value === key) {
      $(".product-table").trigger("sorton", value);
      break;
    }
  }
});



// reset form
function resetForm() {
    document.querySelector("form").reset();
    var inputs= document.querySelectorAll("form input");
    inputCategory.classList.remove("is-valid");
    for(var i=0; i<inputs.length; i++) {
        inputs[i].classList.remove("is-valid");
    }
    checkedOptions = 0;
}

// checking is product unique
function isProductUnique() {
    var names = document.querySelectorAll(".name");
    for(var i=0; i<names.length; i++) {
        if(names[i].innerText === inputName.value) {
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
  "<tr><td>" +
  product.price +
  "<tr><td>" +
  product.numberOfitems +
  "</td>";
  document.querySelector(".basket-table").appendChild(newRow);
}