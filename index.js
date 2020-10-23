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
var checkedOptions = 0;
var isNameCorrect = false;
var isCodeCorrect = false;
var isPriceCorrect = false;
var isVATCorrect = false;
var isCategoryCorrect = false;
var isOptionCorrect = false;
var isRateCorrect = false;

var price = null;
var vat = null;

var sortSelect = document.querySelector("#sortSelect");


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
  isNameCorrect = testExpression(this, lettersOnlyExpression);
});

inputCode.addEventListener("blur", function () {
  isCodeCorrect = testExpression(this, productCodeExpression);
});

inputPrice.addEventListener("blur", function () {
  var text = this.value;
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
});

inputVAT.addEventListener("blur", function () {
  if ((isVATCorrect = testExpression(this, numbersOnlyExpression))) {
    vat = this.value;
    if (price != null) {
      inputPriceBrutto.value = (price * (1 + vat / 100)).toFixed(2);
    }
  }
});

inputCategory.addEventListener("blur", function () {
  if (this.value == "default") {
    inputCategory.classList.add("is-invalid");
    isCategoryCorrect = false;
  } else {
    inputCategory.classList.remove("is-invalid");
    inputCategory.classList.add("is-valid");
    isCategoryCorrect = true;
  }
});

for (var i = 0; i < options.length; i++) {
  options[i].addEventListener("change", function () {
    if (this.checked) {
      checkedOptions++;
    } else {
      checkedOptions--;
    }

    if (checkedOptions === 2) {
      document.querySelector(".option-feedback").style.display = "none";
      isOptionCorrect = true;
    } else {
      document.querySelector(".option-feedback").style.display = "block";
      isOptionCorrect = false;
    }
  });
}

for (var i = 0; i < rates.length; i++) {
  rates[i].addEventListener("change", function () {
    isRateCorrect = true;
    document.querySelector(".rate-feedback").style.display = "none";
  });
}

//adding new product
addButton.addEventListener("click", function () {
  if (!isRateCorrect) {
    document.querySelector(".rate-feedback").style.display = "block";
    document.querySelector(".add-feedback").style.display = "block";
  } else {
    document.querySelector(".rate-feedback").style.display = "none";
  }
  if (!isOptionCorrect) {
    document.querySelector(".option-feedback").style.display = "block";
    document.querySelector(".add-feedback").style.display = "block";
  } else {
    document.querySelector(".option-feedback").style.display = "none";
  }

  if (
    isNameCorrect &&
    isCodeCorrect &&
    isPriceCorrect &&
    isVATCorrect &&
    isCategoryCorrect &&
    isOptionCorrect &&
    isRateCorrect && isProductUnique()
  ) {
    addRow();
    resetForm();
    document.querySelector(".add-feedback").style.display = "none";
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

//add row
function addRow() {
    var optionList =  document.querySelectorAll('.option:checked+label');
    var finalOptions = ""; 

    for(var i=0; i<optionList.length; i++) {
        finalOptions += optionList[i].innerText + "<br>";
    }

    var row =
      "<tr><td><img src='" +
      inputImage.value +
      "'></td><td class='name'>" +
      inputName.value +
      "</td><td>" +
      inputCode.value +
      "</td><td>" +
      inputPrice.value +
      "</td><td>" +
      inputVAT.value +
      "</td><td>" +
      inputPriceBrutto.value +
      "</td><td>" +
      inputCategory.value +
      "</td><td>" +
      finalOptions +
      "</td><td>" +
      document.querySelector('input[name="rate"]:checked').value +
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
    return false;

}


sortSelect.addEventListener("change", function () {
  $('.product-table').trigger('sortReset');
  if (this.value === "priceAsc") {
    $("th.priceBrutto").click();
  }
  else if(this.value === "priceDesc") {
    $("th.priceBrutto").click()
    $("th.priceBrutto").click()
  }
  else if (this.value === "rateAsc") {
    $("th.rate").click();
  }
  else if(this.value === "rateDesc") {
    $("th.rate").click();
    $("th.rate").click();
  }
  else if (this.value === "nameA") {
    $("th.name").click();
  }
  else if(this.value === "nameZ") {
    $("th.name").click();
    $("th.name").click();
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

