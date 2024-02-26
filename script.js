"use strict";

//elements selection
const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const optionsList = document.querySelector("#options-list");
const optionsInput = optionsList.previousElementSibling;
const searchParameterElement = document.querySelector("#search-parameter");

//Global variables
let option;
let searchParameter = "name";

///////////////////////////////////////

//render Error Function
const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  countriesContainer.style.opacity = "1";
};

//render country html Function if class assigned to neighbour will render a neighbour country
const renderCountry = function (data, className = "") {
  const html = `
    <article class="country ${className}">
          <img class="country__img" src="${data.flags.png}" />
          <div class="country__data">
          <h3 class="country__name">${data.name.common}</h3>
          <h4 class="country__region">${data.region}</h4>
          <p class="country__row"><span>👫</span>${(
            +data.population / 1000000
          ).toFixed(1)}</p>
          <p class="country__row"><span>🗣️</span>${Object.values(
            data.languages
          )}</p>
          <p class="country__row"><span>💰</span>${
            Object.values(data.currencies)[0].name
          }</p>
          </div>
      </article>
  
    `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = "1";
};

///////////////////////////////////////

//getting neighbouring countries information and rendering them one by one function
const renderingNeighbours = function (data) {
  //get neighbour countries
  const neighbours = data.borders;

  //if no neighbours then stop
  if (neighbours.length === 0 || !neighbours) return;

  //render all neighbours
  neighbours.forEach(async (neighbour) => {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${neighbour}`
      );
      const [data] = await response.json();
      //render neighbour with the neighbour className
      renderCountry(data, "neighbour");
    } catch (err) {
      renderError(`something went wrong : ${err}`);
    }
  });
};

//getting countries information and rendering it and redering them
const gettingCountryInfo = async function () {
  //dont implement if no option
  if (!option) return;
  //request link variable
  let reqLink;

  //request link variable assigned according to search parameter
  if (searchParameter === "name") {
    reqLink = "https://restcountries.com/v3.1/name/";
  }
  if (searchParameter === "region") {
    reqLink = "https://restcountries.com/v3.1/region/";
  }
  if (searchParameter === "subregion") {
    reqLink = "https://restcountries.com/v3.1/subregion/";
  }
  if (searchParameter === "language") {
    reqLink = "https://restcountries.com/v3.1/lang/";
  }

  try {
    //getting country information from RestApi using the request link and option
    const response = await fetch(`${reqLink}${option}`);
    if (!response.ok) {
      throw new Error(
        `countries information were not obtained ${response.status}`
      );
    }
    const data = await response.json();

    //render contries
    data.forEach((singleData) => {
      renderCountry(singleData);
    });
    //if only one country... render its neighbours as well
    if (data.length === 1 && searchParameter === "name") {
      renderingNeighbours(data[0]);
    }
  } catch (err) {
    renderError(`something went wrong : ${err}`);
  }
};

///////////////////////////////////////

//load all countries information to render a list of options on data list element
async function loadAllCountriesData() {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/independent?status=true&fields=languages,name,region,subregion`
    );
    if (!response.ok) {
      throw new Error(`countries data were not obtained ${response.status}`);
    }
    const data = await response.json();

    //changing data to be compatible as information for the list items
    const countriesNames = data.map((singleData) => {
      return singleData.name.common;
    });
    const countriesRegions = new Set(
      data.map((singleData) => {
        return singleData.region;
      })
    );
    const countriesSubregions = new Set(
      data.map((singleData) => {
        return singleData.subregion;
      })
    );
    const countryLanguages = new Set(
      data
        .map((singleData) => {
          return Object.values(singleData.languages);
        })
        .flat()
    );
    //final data variable
    let finalData;
    //according to search parameter final data variable will assigned to respective information
    if (searchParameter === "name") {
      finalData = countriesNames;
    }
    if (searchParameter === "region") {
      finalData = countriesRegions;
    }
    if (searchParameter === "subregion") {
      finalData = countriesSubregions;
    }
    if (searchParameter === "language") {
      finalData = countryLanguages;
    }

    //sorting final data after converting it to array
    finalData = Array.from(finalData).sort();
    finalData.sort();
    //resetting options list html content
    optionsList.innerHTML = "";
    //resetting options element value
    optionsInput.value = "";
    // resetting option global variable
    option = "";
    //redering list items
    finalData.forEach((singleData) => {
      const html = `<option value="${singleData}">${singleData}</option>`;
      optionsList.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    renderError(`something went wrong : ${err}`);
  }
}

//load all countries data on change of parameter to insert paramter information into the options list on loading the page
loadAllCountriesData();

//event listener to click on main button
btn.addEventListener("click", (event) => {
  event.preventDefault();
  countriesContainer.innerHTML = "";
  gettingCountryInfo();
});

//change event listeners to assign values to variables
optionsInput.addEventListener("change", () => {
  option = optionsInput.value;
});
searchParameterElement.addEventListener("change", () => {
  searchParameter = searchParameterElement.value;
  //when parameter changed option variable is sel to empty string
  option = "";
  //load all countries data on change of parameter to insert paramter information into the options list
  loadAllCountriesData();
});
