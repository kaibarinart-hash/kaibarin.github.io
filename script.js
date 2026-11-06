
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
   KAIBARIN — SUPABASE GALLERY
   ========================================= */

async function loadGallery() {
    const galleryGrid = document.getElementById("gallery-grid");

    // This page doesn't contain the gallery.
    if (!galleryGrid) return;

    const supabaseClient = window.kaibarinSupabase;

    if (!supabaseClient) {
        console.error("Kaibarin: Supabase client is not initialized.");
        galleryGrid.textContent = "The gallery is temporarily unavailable.";
        return;
    }

    galleryGrid.textContent = "Loading artwork...";

    try {
        const { data: artworks, error } = await supabaseClient
            .from("artworks")
            .select("id, title, description, category, image_path, display_order")
            .eq("published", true)
            .order("display_order", { ascending: true });

        if (error) throw error;

        galleryGrid.replaceChildren();

        if (!artworks || artworks.length === 0) {
            galleryGrid.textContent = "No artwork published yet. Check back soon!";
            return;
        }

        artworks.forEach((artwork) => {
            // Turn the Storage file path into a public image URL.
            const { data: imageData } = supabaseClient.storage
                .from("artwork-images")
                .getPublicUrl(artwork.image_path);

            console.log("Image path in database:", artwork.image_path);
console.log("Generated image URL:", imageData.publicUrl);

            const card = document.createElement("article");
            card.className = "artwork-card";
            card.dataset.category = artwork.category || "other";

            const image = document.createElement("img");
            console.log("Artwork path:", artwork.image_path);
console.log("Generated image URL:", imageData.publicUrl);
            image.src = imageData.publicUrl;
            image.alt = artwork.title || "Kaibarin artwork";
            image.loading = "lazy";

            image.addEventListener("error", () => {
                image.alt = "Image could not be loaded";
                console.error(
                    "Kaibarin: Could not load artwork image:",
                    artwork.image_path
                );
            });

            const details = document.createElement("div");
            details.className = "artwork-info";

            const title = document.createElement("h3");
            title.textContent = artwork.title || "Untitled";

            details.appendChild(title);

            if (artwork.description) {
                const description = document.createElement("p");
                description.textContent = artwork.description;
                details.appendChild(description);
            }

            card.append(image, details);
            galleryGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Kaibarin: Gallery failed to load:", error);
        galleryGrid.textContent =
            "Couldn't load the gallery. Please try again later.";
    }
}

document.addEventListener("DOMContentLoaded", loadGallery);

/* =========================================
   KAIBARIN — ART GUMBALL MACHINE
========================================= */

async function loadGumballMachine() {
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

    // Only run on pages containing the machine.
    if (!machine || !ballContainer || !knob) return;

    const supabaseClient = window.kaibarinSupabase;

    if (!supabaseClient) {
        ballContainer.textContent = "The machine is taking a little nap!";
        knob.disabled = true;
        return;
    }

    let artworks = [];
    let selectedArtwork = null;
    let isDispensing = false;

    try {
        const { data, error } = await supabaseClient
            .from("artworks")
            .select("id, title, description, category, image_path, display_order")
            .eq("published", true)
            .order("display_order", { ascending: true });

        if (error) throw error;

        artworks = (data || []).map((artwork) => {
            const { data: imageData } = supabaseClient.storage
                .from("artwork-images")
                .getPublicUrl(artwork.image_path);

            return {
                ...artwork,
                imageUrl: imageData.publicUrl
            };
        });

        if (artworks.length === 0) {
            ballContainer.textContent = "No gumballs yet! Check back soon ♡";
            knob.disabled = true;
            return;
        }

        // Fill the dome with artwork previews.
        ballContainer.replaceChildren();

        const visibleBalls = Math.min(artworks.length, 14);

        for (let i = 0; i < visibleBalls; i++) {
            const artwork = artworks[i];

            const ball = document.createElement("div");
            ball.className = "gumball-ball";

            // Scatter the gumballs around the dome.
            const left = 8 + Math.random() * 76;
            const top = 12 + Math.random() * 72;

            ball.style.left = `${left}%`;
            ball.style.top = `${top}%`;
            ball.style.animationDelay = `${Math.random() * 2}s`;

            const image = document.createElement("img");
            image.src = artwork.imageUrl;
            image.alt = "";
            image.loading = "lazy";

            ball.appendChild(image);
            ballContainer.appendChild(ball);
        }

    } catch (error) {
        console.error("Kaibarin: Gumball machine failed to load:", error);
        ballContainer.textContent = "The machine is temporarily unavailable.";
        knob.disabled = true;
        return;
    }

    function openArtworkPreview(artwork) {
        if (!artwork || !modal) return;

        modalImage.src = artwork.imageUrl;
        modalImage.alt = artwork.title || "Kaibarin artwork";
        modalTitle.textContent = artwork.title || "Untitled";
        modalDescription.textContent =
            artwork.description || "A little creation by Kaibarin ♡";

        modal.showModal();
    }

    function dispenseGumball() {
        if (isDispensing || artworks.length === 0) return;

        isDispensing = true;
        knob.disabled = true;

        // Pick a random published artwork.
        selectedArtwork =
            artworks[Math.floor(Math.random() * artworks.length)];

        // Reset the machine animation so it can play again.
        machine.classList.remove("shaking");
        void machine.offsetWidth;
        machine.classList.add("shaking");

        caption.textContent = "Mixing up your surprise...";

        dispensedButton.hidden = true;
        againButton.hidden = true;

        window.setTimeout(() => {
            dispensedImage.src = selectedArtwork.imageUrl;
            dispensedImage.alt = selectedArtwork.title || "Your artwork surprise";

            dispensedButton.hidden = false;
            againButton.hidden = false;

            caption.textContent = "You got: " +
                (selectedArtwork.title || "A mystery artwork!") +
                " ♡";

            knob.disabled = false;
            isDispensing = false;
        }, 650);
    }

    knob.addEventListener("click", dispenseGumball);

    dispensedButton.addEventListener("click", () => {
        openArtworkPreview(selectedArtwork);
    });

    againButton.addEventListener("click", dispenseGumball);

    modalClose.addEventListener("click", () => {
        modal.close();
    });

    // Clicking the backdrop closes the preview.
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
        }
    });
}

document.addEventListener("DOMContentLoaded", loadGumballMachine);

const gachaArtworks = [
    {
        title: "L30",
        image: "images/gacha/L30.png",
        description: "L30"
    },
    {
      
