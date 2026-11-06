
/* =========================================
   KAIBARIN — COMMISSION PRICE CALCULATOR
   ========================================= */

const commissionType = document.getElementById("commission-type");
const complexBackground = document.getElementById("complex-background");
const extraCharacters = document.getElementById("extra-characters");
const estimatedPrice = document.getElementById("estimated-price");

// Base prices for each commission type
const commissionPrices = {
    bust: 20,
    halfbody: 25,
    fullbody: 35,
    chibi: 15
};

// Additional character fee: 50% of base price per character
const EXTRA_CHARACTER_RATE = 0.50;

// Complex background fee
const COMPLEX_BACKGROUND_PRICE = 15;

function updateEstimatedPrice() {
    // Make sure the calculator elements exist on this page
    if (
        !commissionType ||
        !complexBackground ||
        !extraCharacters ||
        !estimatedPrice
    ) {
        return;
    }

    const selectedType = commissionType.value;

    // Show a prompt until a commission type is selected
    if (!selectedType || commissionPrices[selectedType] === undefined) {
        estimatedPrice.textContent = "Select a commission type";
        return;
    }

    const basePrice = commissionPrices[selectedType];
    const numberOfExtras = Number(extraCharacters.value);

    const extraCharacterCost =
        basePrice * EXTRA_CHARACTER_RATE * numberOfExtras;

    const backgroundCost = complexBackground.checked
        ? COMPLEX_BACKGROUND_PRICE
        : 0;

    const total =
        basePrice + extraCharacterCost + backgroundCost;

    estimatedPrice.textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(total);
}





/* Attach calculator listeners only on request.html */
if (
    commissionType &&
    complexBackground &&
    extraCharacters &&
    estimatedPrice
) {
    commissionType.addEventListener("change", updateEstimatedPrice);
    complexBackground.addEventListener("change", updateEstimatedPrice);
    extraCharacters.addEventListener("change", updateEstimatedPrice);

    // Set the initial display
    updateEstimatedPrice();
}



/* =========================================
   KAIBARIN — ART GUMBALL MACHINE
========================================= */

// Your artwork collection!
// These paths match the files in your GitHub images folder.
const gachaArtworks = [
    {
        title: "Reese",
        image: "images/Reese.png",
        description: "Reese (by @erospistol)"
    },
    {
        title: "Marquis",
        image: "images/Marquis.png",
        description: "Marquis"
    }
    {
        title: "Nanna",
        image: "images/Nanna.png",
        description: "Nanna"
    }
  {
        title: "Towa",
        image: "images/Towa.png",
        description: "Towa"
    }
   
];

function loadGumballMachine() {
    const machine = document.getElementById("gumball-machine");
    const ballContainer = document.getElementById("gumball-balls");
    const knob = document.getElementById("gumball-knob");
    const dispensedButton = document.getElementById("dispensed-gumball");
    const dispensedImage = document.getElementById("dispensed-image");
    const caption = document.getElementById("gumball-caption");
    const againButton = document.getElementById("gumball-again");

    const modal = document.getElementById("gumball-modal");
    const modalImage = document.getElementById("modal-artwork-image");
    const modalTitle = document.getElementById("modal-artwork-title");
    const modalDescription = document.getElementById("modal-artwork-description");
    const modalClose = document.getElementById("gumball-modal-close");

    // Only run if the machine exists on this page.
    if (!machine || !ballContainer || !knob) return;

    let selectedArtwork = null;
    let isDispensing = false;

    // Populate the machine with floating artwork balls.
    ballContainer.replaceChildren();

    gachaArtworks.forEach((artwork) => {
        const ball = document.createElement("div");
        ball.className = "gumball-ball";

        ball.style.left = `${8 + Math.random() * 76}%`;
        ball.style.top = `${12 + Math.random() * 72}%`;
        ball.style.animationDelay = `${Math.random() * 2}s`;

        const image = document.createElement("img");
        image.src = artwork.image;
        image.alt = artwork.title;
        image.loading = "eager";

        image.onerror = () => {
            console.error("Could not load gacha image:", artwork.image);
        };

        ball.appendChild(image);
        ballContainer.appendChild(ball);
    });

    function openArtworkPreview(artwork) {
        if (!artwork || !modal) return;

        modalImage.src = artwork.image;
        modalImage.alt = artwork.title;
        modalTitle.textContent = artwork.title;
        modalDescription.textContent =
            artwork.description || "A little creation by Kaibarin ♡";

        modal.showModal();
    }

    function dispenseGumball() {
        if (isDispensing || gachaArtworks.length === 0) return;

        isDispensing = true;
        knob.disabled = true;

        selectedArtwork =
            gachaArtworks[
                Math.floor(Math.random() * gachaArtworks.length)
            ];

        // Restart the shaking animation.
        machine.classList.remove("shaking");
        void machine.offsetWidth;
        machine.classList.add("shaking");

        caption.textContent = "Mixing up your surprise...";

        dispensedButton.hidden = true;
        againButton.hidden = true;

        window.setTimeout(() => {
            dispensedImage.src = selectedArtwork.image;
            dispensedImage.alt = selectedArtwork.title;

            dispensedButton.hidden = false;
            againButton.hidden = false;

            caption.textContent =
                `You got: ${selectedArtwork.title} ♡`;

            knob.disabled = false;
            isDispensing = false;
        }, 650);
    }

    knob.addEventListener("click", dispenseGumball);

    dispensedButton.addEventListener("click", () => {
        openArtworkPreview(selectedArtwork);
    });

    againButton.addEventListener("click", dispenseGumball);

    if (modalClose && modal) {
        modalClose.addEventListener("click", () => {
            modal.close();
        });

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", loadGumballMachine);
