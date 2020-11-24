function isNameValid() {
    var text = inputName.value;
    var result = lettersOnlyExpression.test(text);
    var feedbaackDiv = document.querySelector("#name-feedback");
    if (text === "")  {
      feedbaackDiv.innerText = "Pole obowiązkowe"
      inputName.classList.add("is-invalid");
      return 1;
    }
    else if (result == false) {
      feedbaackDiv.innerText = "Proszę wprowadzić same litery"
      inputName.classList.add("is-invalid");
      return 1;
    }
    else {
      inputName.classList.remove("is-invalid");
      inputName.classList.add("is-valid");
      return 0;
    }
}

function isPriceValid() {
    var text = inputPrice.value;
    var feedbaackDiv = document.querySelector("#price-feedback");
    var result = moneyExpression.test(text);
    if(text === "") {
      feedbaackDiv.innerText = "Pole obowiązkowe";
      inputPrice.classList.add("is-invalid");
      inputPriceBrutto.value = "";
      return 1;
    }
    else if (result == false) {
        feedbaackDiv.innerText = "Proszę wprowadzić liczbę";
        inputPrice.classList.add("is-invalid");
        inputPriceBrutto.value = "";
        return 1;
    } else {
      price = inputPrice.value;
      inputPrice.value = parseFloat(inputPrice.value).toFixed(2);
      inputPrice.classList.remove("is-invalid");
      inputPrice.classList.add("is-valid");
      return 0;
    }
}


function isCodeValid() {
    var text = inputCode.value;
    var result = productCodeExpression.test(text);
    var feedbaackDiv = document.querySelector("#code-feedback");
    if (text === "")  {
      feedbaackDiv.innerText = "Pole obowiązkowe"
      inputCode.classList.add("is-invalid");
      return 1;
    }
    else if (result == false) {
      feedbaackDiv.innerText = "Proszę wprowadzić kod w formacie XX-XX."
      inputCode.classList.add("is-invalid");
      return 1;
    }
    else {
      inputCode.classList.remove("is-invalid");
      inputCode.classList.add("is-valid");
      return 0;
    }
}


function isVATValid () {
    var text = inputVAT.value;
    var result = numbersOnlyExpression.test(text);
    var feedbaackDiv = document.querySelector("#vat-feedback");
  
    if (text === "")  {
      feedbaackDiv.innerText = "Pole obowiązkowe"
      inputVAT.classList.add("is-invalid");
      inputPriceBrutto.value = "";
      return 1;
    }
    else if (result == false) {
      feedbaackDiv.innerText = "Proszę wprowadzić liczbę"
      inputVAT.classList.add("is-invalid");
      inputPriceBrutto.value = "";
      return 1;
    }
    else {
      vat = inputVAT.value;
      inputVAT.classList.remove("is-invalid");
      inputVAT.classList.add("is-valid");
      return 0;
    }
}


function isCategoryValid () {
    if (inputCategory.value == "default") {
      inputCategory.classList.add("is-invalid");
      return 1;
    } else {
      inputCategory.classList.remove("is-invalid");
      inputCategory.classList.add("is-valid");
      return 0;
    }
}


function isOptionsValid () {
    var checkedOptions = document.querySelectorAll(".option:checked").length;
    if (checkedOptions >= 2) {
      document.querySelector(".option-feedback").style.display = "none";
      return 0;
    } else {
      document.querySelector(".option-feedback").style.display = "block";
      return 1;
    }
}