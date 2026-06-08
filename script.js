const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

const languageConfig = {
  de: { htmlLang: "de-AT", label: "Deutsch (AT)" },
  it: { htmlLang: "it-IT", label: "Italiano" },
  hr: { htmlLang: "hr-HR", label: "Hrvatski" },
  sr: { htmlLang: "sr-Latn-RS", label: "Srpski" },
};

window.hotmessTextOriginals = window.hotmessTextOriginals || new WeakMap();

const translations = {
  it: {
    "Sprache": "Lingua",
    "Vision": "Visione",
    "Experience": "Esperienza",
    "Waitlist": "Lista d'attesa",
    "Tickets": "Biglietti",
    "Account": "Account",
    "Profil": "Profilo",
    "Profilbesucher": "Visitatori del profilo",
    "Vertrieb": "Vendite",
    "Chat": "Chat",
    "Mitglieder": "Membri",
    "Nachrichten": "Messaggi",
    "Logout": "Esci",
    "Login": "Accedi",
    "Member access": "Accesso membri",
    "Account erstellen": "Crea account",
    "Vorname": "Nome",
    "Nachname": "Cognome",
    "E-Mail": "E-mail",
    "Geburtsdatum": "Data di nascita",
    "Telefon": "Telefono",
    "Land": "Paese",
    "Land auswählen": "Seleziona paese",
    "PLZ": "CAP",
    "Stadt / Ort": "Citta / Localita",
    "Straße und Hausnummer": "Via e numero civico",
    "Instagram Handle": "Nome utente Instagram",
    "Profilbild": "Foto profilo",
    "Du kannst ein Foto aus der Galerie wählen oder mit der Kamera aufnehmen.": "Puoi scegliere una foto dalla galleria o scattarne una con la fotocamera.",
    "Passwort": "Password",
    "Ich folge HOTMESS BLKN auf Instagram.": "Seguo HOTMESS BLKN su Instagram.",
    "Instagram-Profil öffnen": "Apri il profilo Instagram",
    "Schon registriert?": "Gia registrato?",
    "Einloggen": "Accedi",
    "Passwort anzeigen": "Mostra password",
    "Passwort verbergen": "Nascondi password",
    "Land wählen, dann Ort oder PLZ eingeben. Vorschläge werden automatisch aus öffentlichen Adressdaten geladen.": "Seleziona il paese, poi inserisci localita o CAP. I suggerimenti vengono caricati automaticamente da dati di indirizzi pubblici.",
    "Bitte fülle alle Pflichtfelder aus, bestätige den Instagram-Follow und nutze mindestens 8 Zeichen Passwort.": "Compila tutti i campi obbligatori, conferma di seguire Instagram e usa una password di almeno 8 caratteri.",
    "Account erstellt. Bitte bestätige E-Mail und Telefonnummer.": "Account creato. Conferma e-mail e numero di telefono.",
    "Diese E-Mail ist bereits registriert.": "Questa e-mail e gia registrata.",
    "Albanien": "Albania",
    "Andorra": "Andorra",
    "Armenien": "Armenia",
    "Aserbaidschan": "Azerbaigian",
    "Belgien": "Belgio",
    "Bosnien und Herzegowina": "Bosnia ed Erzegovina",
    "Bulgarien": "Bulgaria",
    "Dänemark": "Danimarca",
    "Deutschland": "Germania",
    "Estland": "Estonia",
    "Finnland": "Finlandia",
    "Frankreich": "Francia",
    "Georgien": "Georgia",
    "Griechenland": "Grecia",
    "Irland": "Irlanda",
    "Island": "Islanda",
    "Italien": "Italia",
    "Kosovo": "Kosovo",
    "Kroatien": "Croazia",
    "Lettland": "Lettonia",
    "Liechtenstein": "Liechtenstein",
    "Litauen": "Lituania",
    "Luxemburg": "Lussemburgo",
    "Malta": "Malta",
    "Moldau": "Moldavia",
    "Monaco": "Monaco",
    "Montenegro": "Montenegro",
    "Niederlande": "Paesi Bassi",
    "Nordmazedonien": "Macedonia del Nord",
    "Norwegen": "Norvegia",
    "Österreich": "Austria",
    "Polen": "Polonia",
    "Portugal": "Portogallo",
    "Rumänien": "Romania",
    "San Marino": "San Marino",
    "Schweden": "Svezia",
    "Schweiz": "Svizzera",
    "Serbien": "Serbia",
    "Slowakei": "Slovacchia",
    "Slowenien": "Slovenia",
    "Spanien": "Spagna",
    "Tschechien": "Cechia",
    "Türkei": "Turchia",
    "Ukraine": "Ucraina",
    "Ungarn": "Ungheria",
    "Vereinigtes Königreich": "Regno Unito",
    "Zypern": "Cipro",
    "@deinname": "@tuonome",
    "+43 ...": "+39 ..."
  },
  hr: {
    "Sprache": "Jezik",
    "Vision": "Vizija",
    "Experience": "Iskustvo",
    "Waitlist": "Lista čekanja",
    "Tickets": "Ulaznice",
    "Account": "Račun",
    "Profil": "Profil",
    "Profilbesucher": "Posjetitelji profila",
    "Vertrieb": "Prodaja",
    "Chat": "Chat",
    "Mitglieder": "Članovi",
    "Nachrichten": "Poruke",
    "Logout": "Odjava",
    "Login": "Prijava",
    "Member access": "Pristup za članove",
    "Account erstellen": "Izradi račun",
    "Vorname": "Ime",
    "Nachname": "Prezime",
    "E-Mail": "E-mail",
    "Geburtsdatum": "Datum rođenja",
    "Telefon": "Telefon",
    "Land": "Država",
    "Land auswählen": "Odaberi državu",
    "PLZ": "Poštanski broj",
    "Stadt / Ort": "Grad / mjesto",
    "Straße und Hausnummer": "Ulica i kućni broj",
    "Instagram Handle": "Instagram korisničko ime",
    "Profilbild": "Profilna fotografija",
    "Du kannst ein Foto aus der Galerie wählen oder mit der Kamera aufnehmen.": "Možeš odabrati fotografiju iz galerije ili je snimiti kamerom.",
    "Passwort": "Lozinka",
    "Ich folge HOTMESS BLKN auf Instagram.": "Pratim HOTMESS BLKN na Instagramu.",
    "Instagram-Profil öffnen": "Otvori Instagram profil",
    "Schon registriert?": "Već si registriran?",
    "Einloggen": "Prijavi se",
    "Passwort anzeigen": "Prikaži lozinku",
    "Passwort verbergen": "Sakrij lozinku",
    "Land wählen, dann Ort oder PLZ eingeben. Vorschläge werden automatisch aus öffentlichen Adressdaten geladen.": "Odaberi državu, zatim unesi mjesto ili poštanski broj. Prijedlozi se automatski učitavaju iz javnih adresnih podataka.",
    "Bitte fülle alle Pflichtfelder aus, bestätige den Instagram-Follow und nutze mindestens 8 Zeichen Passwort.": "Ispuni sva obavezna polja, potvrdi praćenje na Instagramu i koristi lozinku od najmanje 8 znakova.",
    "Account erstellt. Bitte bestätige E-Mail und Telefonnummer.": "Račun je izrađen. Potvrdi e-mail i telefonski broj.",
    "Diese E-Mail ist bereits registriert.": "Ova e-mail adresa je već registrirana.",
    "Albanien": "Albanija",
    "Andorra": "Andora",
    "Armenien": "Armenija",
    "Aserbaidschan": "Azerbajdžan",
    "Belgien": "Belgija",
    "Bosnien und Herzegowina": "Bosna i Hercegovina",
    "Bulgarien": "Bugarska",
    "Dänemark": "Danska",
    "Deutschland": "Njemačka",
    "Estland": "Estonija",
    "Finnland": "Finska",
    "Frankreich": "Francuska",
    "Georgien": "Gruzija",
    "Griechenland": "Grčka",
    "Irland": "Irska",
    "Island": "Island",
    "Italien": "Italija",
    "Kosovo": "Kosovo",
    "Kroatien": "Hrvatska",
    "Lettland": "Latvija",
    "Liechtenstein": "Lihtenštajn",
    "Litauen": "Litva",
    "Luxemburg": "Luksemburg",
    "Malta": "Malta",
    "Moldau": "Moldavija",
    "Monaco": "Monako",
    "Montenegro": "Crna Gora",
    "Niederlande": "Nizozemska",
    "Nordmazedonien": "Sjeverna Makedonija",
    "Norwegen": "Norveška",
    "Österreich": "Austrija",
    "Polen": "Poljska",
    "Portugal": "Portugal",
    "Rumänien": "Rumunjska",
    "San Marino": "San Marino",
    "Schweden": "Švedska",
    "Schweiz": "Švicarska",
    "Serbien": "Srbija",
    "Slowakei": "Slovačka",
    "Slowenien": "Slovenija",
    "Spanien": "Španjolska",
    "Tschechien": "Češka",
    "Türkei": "Turska",
    "Ukraine": "Ukrajina",
    "Ungarn": "Mađarska",
    "Vereinigtes Königreich": "Ujedinjeno Kraljevstvo",
    "Zypern": "Cipar",
    "@deinname": "@tvojeime",
    "+43 ...": "+385 ..."
  },
  sr: {
    "Sprache": "Jezik",
    "Vision": "Vizija",
    "Experience": "Iskustvo",
    "Waitlist": "Lista čekanja",
    "Tickets": "Karte",
    "Account": "Nalog",
    "Profil": "Profil",
    "Profilbesucher": "Posetioci profila",
    "Vertrieb": "Prodaja",
    "Chat": "Čet",
    "Mitglieder": "Članovi",
    "Nachrichten": "Poruke",
    "Logout": "Odjava",
    "Login": "Prijava",
    "Member access": "Pristup za članove",
    "Account erstellen": "Napravi nalog",
    "Vorname": "Ime",
    "Nachname": "Prezime",
    "E-Mail": "E-mail",
    "Geburtsdatum": "Datum rođenja",
    "Telefon": "Telefon",
    "Land": "Država",
    "Land auswählen": "Izaberi državu",
    "PLZ": "Poštanski broj",
    "Stadt / Ort": "Grad / mesto",
    "Straße und Hausnummer": "Ulica i kućni broj",
    "Instagram Handle": "Instagram korisničko ime",
    "Profilbild": "Profilna slika",
    "Du kannst ein Foto aus der Galerie wählen oder mit der Kamera aufnehmen.": "Možeš izabrati sliku iz galerije ili je napraviti kamerom.",
    "Passwort": "Lozinka",
    "Ich folge HOTMESS BLKN auf Instagram.": "Pratim HOTMESS BLKN na Instagramu.",
    "Instagram-Profil öffnen": "Otvori Instagram profil",
    "Schon registriert?": "Već si registrovan?",
    "Einloggen": "Prijavi se",
    "Passwort anzeigen": "Prikaži lozinku",
    "Passwort verbergen": "Sakrij lozinku",
    "Land wählen, dann Ort oder PLZ eingeben. Vorschläge werden automatisch aus öffentlichen Adressdaten geladen.": "Izaberi državu, zatim unesi mesto ili poštanski broj. Predlozi se automatski učitavaju iz javnih adresnih podataka.",
    "Bitte fülle alle Pflichtfelder aus, bestätige den Instagram-Follow und nutze mindestens 8 Zeichen Passwort.": "Popuni sva obavezna polja, potvrdi praćenje na Instagramu i koristi lozinku od najmanje 8 znakova.",
    "Account erstellt. Bitte bestätige E-Mail und Telefonnummer.": "Nalog je napravljen. Potvrdi e-mail i broj telefona.",
    "Diese E-Mail ist bereits registriert.": "Ova e-mail adresa je već registrovana.",
    "Albanien": "Albanija",
    "Andorra": "Andora",
    "Armenien": "Jermenija",
    "Aserbaidschan": "Azerbejdžan",
    "Belgien": "Belgija",
    "Bosnien und Herzegowina": "Bosna i Hercegovina",
    "Bulgarien": "Bugarska",
    "Dänemark": "Danska",
    "Deutschland": "Nemačka",
    "Estland": "Estonija",
    "Finnland": "Finska",
    "Frankreich": "Francuska",
    "Georgien": "Gruzija",
    "Griechenland": "Grčka",
    "Irland": "Irska",
    "Island": "Island",
    "Italien": "Italija",
    "Kosovo": "Kosovo",
    "Kroatien": "Hrvatska",
    "Lettland": "Letonija",
    "Liechtenstein": "Lihtenštajn",
    "Litauen": "Litvanija",
    "Luxemburg": "Luksemburg",
    "Malta": "Malta",
    "Moldau": "Moldavija",
    "Monaco": "Monako",
    "Montenegro": "Crna Gora",
    "Niederlande": "Holandija",
    "Nordmazedonien": "Severna Makedonija",
    "Norwegen": "Norveška",
    "Österreich": "Austrija",
    "Polen": "Poljska",
    "Portugal": "Portugal",
    "Rumänien": "Rumunija",
    "San Marino": "San Marino",
    "Schweden": "Švedska",
    "Schweiz": "Švajcarska",
    "Serbien": "Srbija",
    "Slowakei": "Slovačka",
    "Slowenien": "Slovenija",
    "Spanien": "Španija",
    "Tschechien": "Češka",
    "Türkei": "Turska",
    "Ukraine": "Ukrajina",
    "Ungarn": "Mađarska",
    "Vereinigtes Königreich": "Ujedinjeno Kraljevstvo",
    "Zypern": "Kipar",
    "@deinname": "@tvojeime",
    "+43 ...": "+381 ..."
  }
};

const getOriginalText = (node, key) => {
  const attributeName = `data-i18n-original-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (!node.getAttribute || !node.setAttribute) {
    return "";
  }
  if (!node.getAttribute(attributeName)) {
    node.setAttribute(attributeName, node.getAttribute(key) || "");
  }
  return node.getAttribute(attributeName) || "";
};

const translateValue = (value, language) => {
  if (language === "de") {
    return value;
  }
  return translations[language]?.[value.trim()] || value;
};
window.hotmessTranslateValue = translateValue;

const getSavedLanguage = () => {
  try {
    return window.localStorage?.getItem("hotmess_language") || "de";
  } catch {
    return "de";
  }
};

const saveLanguage = (language) => {
  try {
    window.localStorage?.setItem("hotmess_language", language);
  } catch {
    return;
  }
};

const applyLanguage = (language) => {
  const config = languageConfig[language] || languageConfig.de;
  const debug = { language, htmlLang: config.htmlLang, textNodes: 0, translatedTextNodes: 0 };
  document.documentElement.lang = config.htmlLang;
  document.body.setAttribute("lang", config.htmlLang);

  document.querySelectorAll("input, textarea, select").forEach((field) => {
    field.setAttribute("lang", config.htmlLang);
    field.spellcheck = language !== "de" || field.type !== "password";
  });

  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((field) => {
    const original = getOriginalText(field, "placeholder");
    field.setAttribute("placeholder", translateValue(original, language));
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const original = element.getAttribute("data-i18n") || element.textContent.trim();
    element.textContent = translateValue(original, language);
  });

  document.querySelectorAll("option").forEach((option) => {
    if (!option.getAttribute("data-i18n-option")) {
      option.setAttribute("data-i18n-option", option.textContent.trim());
    }
    const original = option.getAttribute("data-i18n-option") || "";
    option.textContent = translateValue(original, language);
  });

  document.querySelectorAll("[aria-label]").forEach((element) => {
    const original = getOriginalText(element, "aria-label");
    element.setAttribute("aria-label", translateValue(original, language));
  });

  document.querySelectorAll("[title]").forEach((element) => {
    const original = getOriginalText(element, "title");
    element.setAttribute("title", translateValue(original, language));
  });

  document.querySelectorAll("h1, h2, h3, h4, p, span, small, strong, button, a, option, th, td, li").forEach((element) => {
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName || "")) {
      return;
    }
    if (!element.dataset.i18nOriginalText) {
      element.dataset.i18nOriginalText = element.textContent.trim();
    }
    const original = element.dataset.i18nOriginalText;
    const translated = translateValue(original, language);
    if (translated !== original) {
      debug.translatedTextNodes += 1;
      element.textContent = translated;
    } else if (language === "de" && element.textContent.trim() !== original) {
      element.textContent = original;
    }
  });

  const textNodes = [];
  const collectTextNodes = (node) => {
    if (!node) {
      return;
    }
    if (node.nodeType === 3) {
      if (node.nodeValue.trim() && !["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(node.parentElement?.tagName || "")) {
        textNodes.push(node);
      }
      return;
    }
    if (node.nodeType !== 1 || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(node.tagName || "")) {
      return;
    }
    Array.from(node.childNodes).forEach(collectTextNodes);
  };
  try {
    collectTextNodes(document.body);
  } catch {
    debug.textNodes = 0;
  }

  textNodes.forEach((node) => {
    if (!window.hotmessTextOriginals.has(node)) {
      window.hotmessTextOriginals.set(node, node.nodeValue);
    }
    const original = window.hotmessTextOriginals.get(node);
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const clean = original.trim();
    const translated = clean ? translateValue(clean, language) : clean;
    if (translated !== clean) {
      debug.translatedTextNodes += 1;
    }
    node.nodeValue = clean ? `${leading}${translated}${trailing}` : original;
  });

  debug.textNodes = textNodes.length;
  window.hotmessLanguageDebug = debug;
};

const languageSwitcher = document.querySelector("[data-language-switcher]");
const savedLanguage = getSavedLanguage();
let activeLanguage = languageConfig[savedLanguage] ? savedLanguage : "de";
if (languageSwitcher) {
  languageSwitcher.value = activeLanguage;
  languageSwitcher.addEventListener("change", () => {
    activeLanguage = languageConfig[languageSwitcher.value] ? languageSwitcher.value : "de";
    saveLanguage(activeLanguage);
    applyLanguage(activeLanguage);
  });
  setInterval(() => {
    if (languageSwitcher.value !== activeLanguage && languageConfig[languageSwitcher.value]) {
      activeLanguage = languageSwitcher.value;
      saveLanguage(activeLanguage);
      applyLanguage(activeLanguage);
    }
  }, 250);
}
applyLanguage(activeLanguage);

document.documentElement.classList.add("js-ready");
document.body.classList.add("page-visible");

requestAnimationFrame(() => {
  document.body.classList.add("page-visible");
});

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll('input[type="password"]').forEach((input) => {
  if (input.closest(".password-field")) {
    return;
  }

  const wrapper = document.createElement("span");
  wrapper.className = "password-field";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "password-toggle";
  toggle.setAttribute("aria-label", "Passwort anzeigen");
  toggle.setAttribute("title", "Passwort anzeigen");
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  wrapper.appendChild(toggle);

  toggle.addEventListener("click", () => {
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    toggle.classList.toggle("is-visible", !isVisible);
    toggle.setAttribute("aria-label", isVisible ? "Passwort anzeigen" : "Passwort verbergen");
    toggle.setAttribute("title", isVisible ? "Passwort anzeigen" : "Passwort verbergen");
  });
});

applyLanguage(activeLanguage);

document.querySelectorAll("[data-address-helper]").forEach((helper) => {
  const country = helper.querySelector("[data-address-country]");
  const postal = helper.querySelector("[data-address-postal]");
  const city = helper.querySelector("[data-address-city]");
  const street = helper.querySelector("[data-address-street]");
  const postalList = document.getElementById("postal-code-suggestions");
  const cityList = document.getElementById("city-suggestions");
  const streetList = document.getElementById("street-suggestions");

  if (!country || !postal || !city || !street || !postalList || !cityList || !streetList) {
    return;
  }

  const suggestionMap = new Map();
  let addressTimer;

  const selectedCountryCode = () => country.options[country.selectedIndex]?.dataset.countryCode || "";

  const debounceAddress = (callback) => {
    clearTimeout(addressTimer);
    addressTimer = setTimeout(callback, 420);
  };

  const addressLabel = (address) => {
    const road = address.road || address.pedestrian || address.footway || address.path || "";
    const houseNumber = address.house_number || "";
    return [road, houseNumber].filter(Boolean).join(" ");
  };

  const applyAddress = (place) => {
    const address = place.address || {};
    const nextPostal = address.postcode || "";
    const nextCity = address.city || address.town || address.village || address.municipality || address.hamlet || "";
    const nextStreet = addressLabel(address);

    if (nextPostal) {
      postal.value = nextPostal;
    }
    if (nextCity) {
      city.value = nextCity;
    }
    if (nextStreet) {
      street.value = nextStreet;
    }
  };

  const renderOptions = (list, places, mode) => {
    list.innerHTML = "";
    const seenValues = new Set();
    places.forEach((place) => {
      const address = place.address || {};
      const option = document.createElement("option");
      let value = "";

      if (mode === "postal") {
        const nextCity = address.city || address.town || address.village || address.municipality || "";
        value = address.postcode || "";
        option.label = [nextCity, address.country].filter(Boolean).join(", ");
      } else if (mode === "city") {
        value = address.city || address.town || address.village || address.municipality || address.hamlet || "";
        option.label = [address.postcode, address.country].filter(Boolean).join(", ");
      } else {
        value = addressLabel(address) || place.display_name;
        option.label = [address.postcode, address.city || address.town || address.village, address.country].filter(Boolean).join(", ");
      }

      if (!value) {
        return;
      }

      const uniqueKey = `${mode}:${value}:${option.label}`;
      if (seenValues.has(uniqueKey)) {
        return;
      }
      seenValues.add(uniqueKey);

      option.value = value;
      suggestionMap.set(value, place);
      list.appendChild(option);
    });
  };

  const searchAddress = async (query, mode) => {
    const countryCode = selectedCountryCode();
    if (!countryCode || query.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "8",
      countrycodes: countryCode,
    });

    if (mode === "postal") {
      params.set("postalcode", postal.value.trim());
      if (city.value.trim()) {
        params.set("city", city.value.trim());
      }
    } else if (mode === "city") {
      params.set("city", city.value.trim());
      if (postal.value.trim()) {
        params.set("postalcode", postal.value.trim());
      }
    } else {
      params.set("street", street.value.trim());
      if (city.value.trim()) {
        params.set("city", city.value.trim());
      }
      if (postal.value.trim()) {
        params.set("postalcode", postal.value.trim());
      }
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!response.ok) {
        return [];
      }
      const places = await response.json();
      return Array.isArray(places) ? places : [];
    } catch {
      return [];
    }
  };

  const refreshCityPostal = () => {
    debounceAddress(async () => {
      const query = [postal.value, city.value].filter(Boolean).join(" ");
      const mode = postal.value.trim() && !city.value.trim() ? "postal" : "city";
      const places = await searchAddress(query, mode);
      renderOptions(cityList, places, "city");
      renderOptions(postalList, places, "postal");
      const exact = places.find((place) => {
        const address = place.address || {};
        const placeCity = address.city || address.town || address.village || address.municipality || "";
        return (postal.value && address.postcode === postal.value) || (city.value && placeCity.toLowerCase() === city.value.toLowerCase());
      });
      if (exact) {
        applyAddress(exact);
      }
    });
  };

  const refreshStreet = () => {
    debounceAddress(async () => {
      const query = [street.value, postal.value, city.value].filter(Boolean).join(" ");
      const places = await searchAddress(query, "street");
      renderOptions(streetList, places, "street");
    });
  };

  country.addEventListener("change", () => {
    postal.value = "";
    city.value = "";
    street.value = "";
    postalList.innerHTML = "";
    cityList.innerHTML = "";
    streetList.innerHTML = "";
    suggestionMap.clear();
  });

  postal.addEventListener("input", refreshCityPostal);
  city.addEventListener("input", refreshCityPostal);
  street.addEventListener("input", refreshStreet);

  [postal, city, street].forEach((input) => {
    input.addEventListener("change", () => {
      const place = suggestionMap.get(input.value);
      if (place) {
        applyAddress(place);
      }
    });
  });
});

const revealTargets = document.querySelectorAll(
  ".intro-section, .image-band, .section, .waitlist-section, .auth-panel, .account-card, .member-table-wrap, .dashboard-hero"
);

revealTargets.forEach((target) => target.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);

revealTargets.forEach((target) => revealObserver.observe(target));

setTimeout(() => {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}, 900);

const heroImage = document.querySelector(".hero-image");

window.addEventListener(
  "scroll",
  () => {
    if (!heroImage) {
      return;
    }

    const y = Math.min(window.scrollY, 700);
    heroImage.style.transform = `scale(1.06) translateY(${y * 0.08}px)`;
  },
  { passive: true }
);

const bulkForm = document.querySelector("[data-bulk-form]");

if (bulkForm) {
  const checkboxes = [...bulkForm.querySelectorAll("[data-member-checkbox]")];
  const selectAllControls = [...bulkForm.querySelectorAll("[data-select-visible]")];
  const selectedCount = bulkForm.querySelector("[data-selected-count]");

  const updateSelectedState = () => {
    const count = checkboxes.filter((checkbox) => checkbox.checked).length;
    if (selectedCount) {
      selectedCount.textContent = `${count} ausgewählt`;
    }
    selectAllControls.forEach((control) => {
      control.checked = count > 0 && count === checkboxes.length;
      control.indeterminate = count > 0 && count < checkboxes.length;
    });
  };

  selectAllControls.forEach((control) => {
    control.addEventListener("change", () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = control.checked;
      });
      updateSelectedState();
    });
  });

  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateSelectedState));

  bulkForm.addEventListener("submit", (event) => {
    const count = checkboxes.filter((checkbox) => checkbox.checked).length;
    if (count === 0) {
      event.preventDefault();
      alert("Bitte wähle mindestens einen Bewerber aus.");
      return;
    }

    if (!confirm(`Möchten Sie den Status von ${count} ausgewählten Bewerbern wirklich ändern?`)) {
      event.preventDefault();
    }
  });

  updateSelectedState();
}

if (document.querySelector(".chat-window")) {
  const messageList = document.querySelector(".message-list");
  const scrollBottomButton = document.querySelector("[data-scroll-bottom]");
  window.HotMessChat = {
    ...(window.HotMessChat || {}),
    reportScreenshotEvent: async (eventPayload = {}) => {
      const activeChat = document.querySelector(".chat-window");
      const conversationId = eventPayload.conversation_id || activeChat?.getAttribute("data-active-conversation-id") || "";
      const contentId = eventPayload.content_id || activeChat?.getAttribute("data-active-chat-content-id") || `chat:${conversationId}`;

      if (!conversationId || !contentId || document.hidden) {
        return { ok: false, skipped: true };
      }

      const payload = {
        conversation_id: Number(conversationId),
        content_id: contentId,
        captured_at: eventPayload.captured_at || new Date().toISOString(),
        client_event_id: eventPayload.client_event_id || `chat-${conversationId}-${contentId}-${Date.now()}`,
      };

      const response = await fetch("/api/chat/screenshot-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  };
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight;
  }

  const isAtChatBottom = () => {
    if (!messageList) return true;
    return messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 48;
  };

  const updateScrollBottomButton = () => {
    if (!messageList || !scrollBottomButton) return;
    const messageCount = messageList.querySelectorAll(".message").length;
    scrollBottomButton.hidden = isAtChatBottom() || messageCount <= 3;
  };

  const scrollToLatestMessage = () => {
    if (!messageList) return;
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
    setTimeout(updateScrollBottomButton, 220);
  };

  messageList?.addEventListener("scroll", updateScrollBottomButton, { passive: true });
  scrollBottomButton?.addEventListener("click", scrollToLatestMessage);
  updateScrollBottomButton();

  const mediaMenu = document.querySelector("[data-media-menu]");
  const mediaMenuToggle = document.querySelector("[data-media-menu-toggle]");

  const closeMediaMenu = () => {
    if (!mediaMenu || !mediaMenuToggle) return;
    mediaMenu.hidden = true;
    mediaMenuToggle.classList.remove("is-open");
    mediaMenuToggle.setAttribute("aria-expanded", "false");
  };

  const toggleMediaMenu = () => {
    if (!mediaMenu || !mediaMenuToggle) return;
    const nextOpen = mediaMenu.hidden;
    mediaMenu.hidden = !nextOpen;
    mediaMenuToggle.classList.toggle("is-open", nextOpen);
    mediaMenuToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
  };

  mediaMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMediaMenu();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (mediaMenu && !mediaMenu.hidden && !mediaMenu.contains(target) && !target.closest("[data-media-menu-toggle]")) {
      closeMediaMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMediaMenu();
  });

  document.querySelectorAll(".media-button input[type='file'], .chat-media-option input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
      const button = input.closest(".media-button") || input.closest(".chat-media-option");
      if (button && input.files && input.files.length > 0) {
        button.classList.add("has-file");
        button.setAttribute("title", input.files[0].name);
        closeMediaMenu();
      }
    });
  });

  const chatInput = document.querySelector("[data-chat-input]");
  const sendButton = document.querySelector("[data-send-button]");
  const voiceButton = document.querySelector(".chat-voice-inline[data-voice-record]") || document.querySelector("[data-voice-record]");
  const audioInput = document.querySelector("input[name='media_audio']");
  const voiceStatus = document.querySelector("[data-voice-status]");
  const voiceTimer = document.querySelector("[data-voice-timer]");
  const voiceStopButton = document.querySelector("[data-voice-stop]");
  let mediaRecorder = null;
  let recordedChunks = [];
  let voiceStartedAt = 0;
  let voiceTimerInterval = null;

  const formatVoiceTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const updateComposeState = () => {
    if (!chatInput || !sendButton || !voiceButton) return;
    const hasText = chatInput.value.trim().length > 0;
    sendButton.hidden = !hasText;
    voiceButton.hidden = hasText;
  };

  const autoResizeTextarea = () => {
    if (!chatInput) return;
    chatInput.style.height = "auto";
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
  };

  chatInput?.addEventListener("input", () => {
    autoResizeTextarea();
    updateComposeState();
  });
  autoResizeTextarea();
  updateComposeState();

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const startVoiceRecording = async () => {
    if (!voiceButton || !audioInput || mediaRecorder?.state === "recording") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      });
      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        const file = new File([blob], `hotmess-voice-${Date.now()}.webm`, { type: blob.type });
        const transfer = new DataTransfer();
        transfer.items.add(file);
        audioInput.files = transfer.files;
        if (voiceTimerInterval) clearInterval(voiceTimerInterval);
        if (voiceStatus) voiceStatus.hidden = true;
        voiceButton.classList.remove("is-recording");
        voiceButton.classList.add("has-file");
        voiceButton.setAttribute("title", "Sprachnachricht bereit");
        stream.getTracks().forEach((track) => track.stop());
      });
      mediaRecorder.start();
      closeMediaMenu();
      voiceStartedAt = Date.now();
      if (voiceStatus) voiceStatus.hidden = false;
      if (voiceTimer) voiceTimer.textContent = "00:00";
      if (voiceTimerInterval) clearInterval(voiceTimerInterval);
      voiceTimerInterval = setInterval(() => {
        if (voiceTimer) voiceTimer.textContent = formatVoiceTime(Math.floor((Date.now() - voiceStartedAt) / 1000));
      }, 250);
      voiceButton.classList.add("is-recording");
      voiceButton.setAttribute("title", "Loslassen zum Anhängen");
    } catch {
      alert("Mikrofonzugriff ist nicht verfügbar. Du kannst stattdessen eine Audiodatei über MIC anhängen.");
    }
  };

  voiceButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (mediaRecorder && mediaRecorder.state === "recording") {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });
  voiceStopButton?.addEventListener("click", stopVoiceRecording);

  window.HotMessChat = {
    ...(window.HotMessChat || {}),
    reportScreenshotEvent: async (eventPayload = {}) => {
      const activeChat = document.querySelector(".chat-window");
      const conversationId = eventPayload.conversation_id || activeChat?.getAttribute("data-active-conversation-id") || "";
      const contentId = eventPayload.content_id || activeChat?.getAttribute("data-active-chat-content-id") || `chat:${conversationId}`;

      if (!conversationId || !contentId || document.hidden) {
        return { ok: false, skipped: true };
      }

      const payload = {
        conversation_id: Number(conversationId),
        content_id: contentId,
        captured_at: eventPayload.captured_at || new Date().toISOString(),
        client_event_id: eventPayload.client_event_id || `chat-${conversationId}-${contentId}-${Date.now()}`,
      };

      const response = await fetch("/api/chat/screenshot-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  };

  document.querySelectorAll("[data-confirm]").forEach((control) => {
    control.addEventListener("click", (event) => {
      const message = control.getAttribute("data-confirm") || "Diese Aktion ausführen?";
      if (!confirm(message)) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll("[data-copy-message]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy-message") || "";
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Kopiert";
        setTimeout(() => {
          button.textContent = "Kopieren";
        }, 1400);
      } catch {
        window.prompt("Nachricht kopieren", text);
      }
    });
  });

  const replyTarget = document.querySelector("[data-reply-target]");
  const replyPreview = document.querySelector(".reply-compose-preview");
  const replyPreviewText = replyPreview ? replyPreview.querySelector("span") : null;

  document.querySelectorAll("[data-reply-message]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!replyTarget || !replyPreview || !replyPreviewText) return;
      replyTarget.value = button.getAttribute("data-reply-message") || "";
      replyPreviewText.textContent = button.getAttribute("data-reply-preview") || "Antwort";
      replyPreview.hidden = false;
      document.querySelector(".message-form textarea")?.focus();
    });
  });

  document.querySelector("[data-clear-reply]")?.addEventListener("click", () => {
    if (!replyTarget || !replyPreview) return;
    replyTarget.value = "";
    replyPreview.hidden = true;
  });

  const conversationContextMenu = document.querySelector("[data-conversation-context-menu]");
  const conversationContextBackdrop = document.querySelector("[data-conversation-context-backdrop]");
  const messageActionMenu = document.querySelector("[data-message-action-menu]");
  const messageActionBackdrop = document.querySelector("[data-message-action-backdrop]");
  let activeContextConversation = null;
  let activeMessageBubble = null;
  let longPressTimer = null;

  const setContextConversation = (conversation) => {
    activeContextConversation = conversation;
    const conversationId = conversation.getAttribute("data-conversation-id") || "";
    const memberId = conversation.getAttribute("data-member-id") || "";
    const isPinned = conversation.getAttribute("data-pinned") === "1";
    const isMuted = conversation.getAttribute("data-muted") === "1";

    document.querySelectorAll("[data-overview-conversation-id]").forEach((input) => {
      input.value = conversationId;
    });

    const pinButton = document.querySelector("[data-overview-pin-action]");
    const muteButton = document.querySelector("[data-overview-mute-action]");

    if (pinButton) {
      pinButton.value = isPinned ? "unpin_conversation" : "pin_conversation";
      const label = pinButton.querySelector("span");
      if (label) label.textContent = isPinned ? "Fixierung lösen" : "Fixieren";
    }

    if (muteButton) {
      muteButton.value = isMuted ? "unmute_conversation" : "mute_conversation";
      const label = muteButton.querySelector("span");
      if (label) label.textContent = isMuted ? "Stummschaltung aufheben" : "Stummschalten";
    }

    const memberLink = document.querySelector("[data-overview-member-link]");
    if (memberLink) {
      memberLink.setAttribute("href", memberId && memberId !== "0" ? `/profile.php?id=${memberId}` : "/profile.php");
    }
  };

  const closeConversationContextMenu = () => {
    if (conversationContextMenu) conversationContextMenu.hidden = true;
    if (conversationContextBackdrop) conversationContextBackdrop.hidden = true;
    activeContextConversation = null;
  };

  const closeMessageActionMenu = () => {
    if (messageActionMenu) messageActionMenu.hidden = true;
    if (messageActionBackdrop) messageActionBackdrop.hidden = true;
    activeMessageBubble = null;
  };

  const placeFloatingMenu = (menu, target) => {
    const rect = target.getBoundingClientRect();
    const menuWidth = Math.min(310, window.innerWidth - 28);
    const left = Math.min(Math.max(14, rect.left + rect.width / 2 - menuWidth / 2), window.innerWidth - menuWidth - 14);
    const preferredTop = rect.bottom + 10;
    const top = preferredTop + 250 > window.innerHeight ? Math.max(14, rect.top - 250) : preferredTop;

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  };

  const openConversationContextMenu = (conversation) => {
    if (!conversationContextMenu || !conversationContextBackdrop) return;
    closeMessageActionMenu();
    setContextConversation(conversation);
    placeFloatingMenu(conversationContextMenu, conversation);
    conversationContextMenu.hidden = false;
    conversationContextBackdrop.hidden = false;
  };

  const setMessageAction = (bubble) => {
    activeMessageBubble = bubble;
    const messageId = bubble.getAttribute("data-message-id") || "";
    const canRecall = bubble.getAttribute("data-can-recall") === "1";
    const canEdit = bubble.getAttribute("data-can-edit") === "1";

    document.querySelectorAll("[data-message-action-id]").forEach((input) => {
      input.value = messageId;
    });

    const recallForm = document.querySelector("[data-message-action-recall-form]");
    const editButton = document.querySelector("[data-message-action-edit]");
    if (recallForm) recallForm.hidden = !canRecall;
    if (editButton) editButton.hidden = !canEdit;
  };

  const openMessageActionMenu = (bubble) => {
    if (!messageActionMenu || !messageActionBackdrop) return;
    closeConversationContextMenu();
    setMessageAction(bubble);
    placeFloatingMenu(messageActionMenu, bubble);
    messageActionMenu.hidden = false;
    messageActionBackdrop.hidden = false;
  };

  document.querySelectorAll("[data-conversation-context]").forEach((conversation) => {
    conversation.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openConversationContextMenu(conversation);
    });
    conversation.addEventListener("pointerdown", () => {
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => openConversationContextMenu(conversation), 520);
    });
    conversation.addEventListener("pointerup", () => clearTimeout(longPressTimer));
    conversation.addEventListener("pointerleave", () => clearTimeout(longPressTimer));
  });

  document.querySelectorAll("[data-message-action-context]").forEach((bubble) => {
    bubble.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openMessageActionMenu(bubble);
    });
    bubble.addEventListener("pointerdown", () => {
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => openMessageActionMenu(bubble), 520);
    });
    bubble.addEventListener("pointerup", () => clearTimeout(longPressTimer));
    bubble.addEventListener("pointerleave", () => clearTimeout(longPressTimer));
  });

  conversationContextBackdrop?.addEventListener("click", closeConversationContextMenu);
  messageActionBackdrop?.addEventListener("click", closeMessageActionMenu);
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (conversationContextMenu && !conversationContextMenu.hidden) {
      if (!conversationContextMenu.contains(target) && !target.closest("[data-conversation-context]")) {
        closeConversationContextMenu();
      }
    }
    if (messageActionMenu && !messageActionMenu.hidden) {
      if (!messageActionMenu.contains(target) && !target.closest("[data-message-action-context]")) {
        closeMessageActionMenu();
      }
    }
  });

  document.querySelector("[data-message-action-reply]")?.addEventListener("click", () => {
    if (!activeMessageBubble || !replyTarget || !replyPreview || !replyPreviewText) return;
    replyTarget.value = activeMessageBubble.getAttribute("data-message-id") || "";
    replyPreviewText.textContent = activeMessageBubble.getAttribute("data-message-preview") || "Antwort";
    replyPreview.hidden = false;
    closeMessageActionMenu();
    document.querySelector(".message-form textarea")?.focus();
  });

  document.querySelector("[data-message-action-copy]")?.addEventListener("click", async () => {
    const text = activeMessageBubble?.getAttribute("data-message-text") || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Chat-Beitrag kopieren", text);
    }
    closeMessageActionMenu();
  });

  document.querySelector("[data-message-action-edit]")?.addEventListener("click", () => {
    if (!activeMessageBubble) return;
    const currentText = activeMessageBubble.getAttribute("data-message-text") || "";
    const nextText = window.prompt("Chat-Beitrag bearbeiten", currentText);
    closeMessageActionMenu();
    if (nextText === null || nextText.trim() === "" || nextText === currentText) return;

    const csrfToken = document.querySelector("input[name='csrf_token']")?.value || "";
    const conversationId = document.querySelector(".message-form input[name='conversation_id']")?.value || "";
    const messageId = activeMessageBubble.getAttribute("data-message-id") || "";
    const form = document.createElement("form");
    form.method = "post";
    form.style.display = "none";
    [
      ["csrf_token", csrfToken],
      ["conversation_id", conversationId],
      ["message_id", messageId],
      ["action", "edit_message"],
      ["edited_body", nextText],
    ].forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  });

  setInterval(() => {
    const activeElement = document.activeElement;
    const hasPendingFile = [...document.querySelectorAll(".media-button input[type='file'], .chat-media-option input[type='file']")].some(
      (input) => input.files && input.files.length > 0
    );
    const isTyping = activeElement && ["TEXTAREA", "INPUT", "SELECT"].includes(activeElement.tagName);

    if (!document.hidden && !isTyping && !hasPendingFile) {
      window.location.reload();
    }
  }, 15000);
}

document.querySelectorAll("[data-revenue-comparison-filter]").forEach((form) => {
  const eventInputs = [...form.querySelectorAll("input[name='revenueEvents[]']")];
  const sourceInputs = [...form.querySelectorAll("input[name='revenueSourceTypes[]']")];
  const allSourceInput = sourceInputs.find((input) => input.value === "all");

  const syncEventLimit = (changedInput) => {
    const selected = eventInputs.filter((input) => input.checked);
    if (selected.length > 3 && changedInput) {
      changedInput.checked = false;
      window.alert("Du kannst maximal 3 Events vergleichen.");
    }
    eventInputs.forEach((input) => {
      const card = input.closest(".revenue-event-option");
      if (card) card.classList.toggle("is-active", input.checked);
    });
  };

  const syncSourceTypes = (changedInput) => {
    if (!allSourceInput) return;
    if (changedInput && changedInput.value === "all" && changedInput.checked) {
      sourceInputs.forEach((input) => {
        if (input !== allSourceInput) input.checked = false;
      });
    } else if (changedInput && changedInput.value !== "all" && changedInput.checked) {
      allSourceInput.checked = false;
    }

    const selectedSpecific = sourceInputs.filter((input) => input.value !== "all" && input.checked);
    if (selectedSpecific.length === 0) {
      allSourceInput.checked = true;
    }

    sourceInputs.forEach((input) => {
      const chip = input.closest(".revenue-chip");
      if (!chip) return;
      chip.classList.toggle("is-active", input.checked);
      chip.classList.toggle("is-soft-disabled", allSourceInput.checked && input.value !== "all");
    });
  };

  eventInputs.forEach((input) => input.addEventListener("change", () => syncEventLimit(input)));
  sourceInputs.forEach((input) => input.addEventListener("change", () => syncSourceTypes(input)));
  syncEventLimit();
  syncSourceTypes();
});
