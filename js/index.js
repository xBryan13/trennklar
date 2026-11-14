
const searchForm = document.getElementById("productSearchBar");
const productInput = document.getElementById("productInput");
const statesDropdown = document.getElementById("states");

const productNameElement = document.getElementById("productName");
const binNameElement = document.getElementById("binName");
const binImageElement = document.getElementById("binImage");
const instructionsList = document.getElementById("instructionsList");

const defaultView = document.getElementById("defaultView");
const resultView = document.getElementById("resultView");

let trashData = [];

// JSON laden
async function loadTrashData() {
    try {
        const response = await fetch("trashList.json");

        if (!response.ok) {
            throw new Error("HTTP-Fehler: " + response.status);
        }

        const data = await response.json();

        if (!data.products || !Array.isArray(data.products)) {
            throw new Error("Die JSON-Datei enthält kein gültiges products-Array.");
        }

        trashData = data.products;

        console.log("Mülldaten erfolgreich geladen:", trashData);

    } catch (error) {
        console.error("Fehler beim Laden der Mülldaten:", error);
    }
}

// Produkt suchen
function searchProduct(product, state) {

    const searchTerm = product.toLowerCase().trim();

    const foundProduct = trashData.find(item =>
        item.productName.toLowerCase() === searchTerm ||
        item.searchTerms.some(term =>
            term.toLowerCase() === searchTerm
        )
    );

    // Produkt nicht gefunden
    if (!foundProduct) {
        showError("Produkt wurde nicht gefunden.");
        return;
    }

    // Bundesland-Daten ermitteln
    const stateData = foundProduct.states[state];

    if (!stateData) {
        showError("Für dieses Bundesland liegen keine Daten vor.");
        return;
    }

    updateFrontend(foundProduct, stateData);
}

// Frontend aktualisieren
function updateFrontend(product, stateData) {

    // Fenster umschalten
    defaultView.classList.add("hidden");
    resultView.classList.remove("hidden");

    // Bild anzeigen
    binImageElement.classList.remove("hidden");
    binImageElement.src = stateData.binImage;
    binImageElement.alt = stateData.binName;

    // Produktinformationen
    productNameElement.textContent = product.productName;
    binNameElement.textContent = stateData.binName;

    // Trennhinweise aktualisieren
    instructionsList.innerHTML = "";

    stateData.instructions.forEach(instruction => {

        const listItem = document.createElement("li");
        listItem.textContent = instruction;

        instructionsList.appendChild(listItem);
    });
}

// Fehlermeldung anzeigen
function showError(message) {

    defaultView.classList.add("hidden");
    resultView.classList.remove("hidden");

    productNameElement.textContent = message;
    binNameElement.textContent = "-";

    binImageElement.classList.add("hidden");

    instructionsList.innerHTML = "";
}

// Default-Fenster anzeigen
function showDefaultView() {

    defaultView.classList.remove("hidden");
    resultView.classList.add("hidden");
}

// Formular-Event
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const product = productInput.value.trim();
    const state = statesDropdown.value;

    // Prüfen, ob ein Bundesland ausgewählt wurde
    if (!state) {
        statesDropdown.classList.add("input-error");
        return; // Suche abbrechen – Ergebnisfenster bleibt geschlossen
    }

    // Rote Markierung entfernen, sobald ein Bundesland ausgewählt ist
    statesDropdown.classList.remove("input-error");

    if (!product) {
        productInput.focus();
        return;
    }

    if (trashData.length === 0) {
        await loadTrashData();
    }

    if (trashData.length === 0) {
        showError("Die Produktdaten konnten nicht geladen werden.");
        return;
    }

    searchProduct(product, state);
});

statesDropdown.addEventListener("change", function() {
    if (statesDropdown.value) {
        statesDropdown.classList.remove("input-error");
    }
});

// Initialisierung
showDefaultView();
loadTrashData();
