console.log("=== RECIPE FINDER ===");

const API_URL = "https://dummyjson.com/recipes";

// ==========================
// DOM ELEMENTS
// ==========================

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const cuisineFilter = document.getElementById("cuisine-filter");
const difficultyFilter = document.getElementById("difficulty-filter");

const recipeGrid = document.getElementById("recipe-grid");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");

const recipeCount = document.getElementById("recipe-count");
const sectionTitle = document.getElementById("section-title");

const resetFilterButton =
    document.getElementById("reset-filter-button");

const favoriteButton =
    document.getElementById("favorite-button");

const favoriteCount =
    document.getElementById("favorite-count");

const recipeDialog =
    document.getElementById("recipe-dialog");

const closeDialog =
    document.getElementById("close-dialog");

const dialogContent =
    document.getElementById("dialog-content");


// ==========================
// DATA
// ==========================

let recipes = [];

let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

let showingFavorites = false;


// ==========================
// GET RECIPES FROM API
// ==========================

async function getRecipes() {

    try {

        loadingState.hidden = false;
        errorState.hidden = true;
        emptyState.hidden = true;
        recipeGrid.hidden = true;

        const response =
            await fetch(`${API_URL}?limit=0`);

        if (!response.ok) {
            throw new Error("Gagal mengambil data API");
        }

        const data =
            await response.json();

        recipes = data.recipes;

        createCuisineFilter();

        renderRecipes(recipes);

    } catch (error) {

        console.error(error);

        loadingState.hidden = true;
        errorState.hidden = false;
        recipeGrid.hidden = true;

    }
}


// ==========================
// CREATE CUISINE FILTER
// ==========================

function createCuisineFilter() {

    const cuisines =
        [...new Set(
            recipes.map(recipe => recipe.cuisine)
        )].sort();

    cuisineFilter.innerHTML =
        `<option value="">All Cuisine</option>`;

    cuisines.forEach(cuisine => {

        const option =
            document.createElement("option");

        option.value = cuisine;
        option.textContent = cuisine;

        cuisineFilter.appendChild(option);

    });
}


// ==========================
// RENDER RECIPES
// ==========================

function renderRecipes(dataRecipes) {

    loadingState.hidden = true;
    errorState.hidden = true;

    if (!dataRecipes.length) {

        recipeGrid.hidden = true;
        emptyState.hidden = false;

        recipeCount.textContent = "0 recipes";

        return;
    }

    emptyState.hidden = true;
    recipeGrid.hidden = false;

    recipeCount.textContent =
        `${dataRecipes.length} recipes`;

    recipeGrid.innerHTML =
        dataRecipes.map(recipe => {

            const isFavorite =
                favorites.some(
                    favorite => favorite.id === recipe.id
                );

            return `
                <article class="recipe-card">

                    <img
                        class="recipe-image"
                        src="${recipe.image}"
                        alt="${recipe.name}"
                    >

                    <div class="recipe-body">

                        <span class="recipe-cuisine">
                            ${recipe.cuisine}
                        </span>

                        <h3 class="recipe-title">
                            ${recipe.name}
                        </h3>

                        <div class="recipe-meta">

                            <span>
                                ⭐ ${recipe.rating}
                            </span>

                            <span>
                                ⏱️ ${recipe.cookTimeMinutes} min
                            </span>

                            <span>
                                ${recipe.difficulty}
                            </span>

                        </div>

                        <div class="recipe-actions">

                            <button
                                class="detail-button"
                                onclick="showRecipeDetail(${recipe.id})"
                            >
                                View Detail
                            </button>

                            <button
                                class="like-button"
                                onclick="toggleFavorite(${recipe.id})"
                                title="Favorite"
                            >
                                ${isFavorite ? "❤️" : "♡"}
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");

    updateFavoriteCount();
}


// ==========================
// SEARCH + FILTER
// ==========================

function applyFilters() {

    const keyword =
        searchInput.value.trim().toLowerCase();

    const cuisine =
        cuisineFilter.value;

    const difficulty =
        difficultyFilter.value;

    let filteredRecipes = recipes;

    // SEARCH
    if (keyword) {

        filteredRecipes =
            filteredRecipes.filter(recipe =>
                recipe.name
                    .toLowerCase()
                    .includes(keyword)
            );
    }

    // CUISINE
    if (cuisine) {

        filteredRecipes =
            filteredRecipes.filter(
                recipe => recipe.cuisine === cuisine
            );
    }

    // DIFFICULTY
    if (difficulty) {

        filteredRecipes =
            filteredRecipes.filter(
                recipe => recipe.difficulty === difficulty
            );
    }

    showingFavorites = false;

    sectionTitle.textContent = "Explore Recipes";

    renderRecipes(filteredRecipes);

    updateResetButton();
}


// ==========================
// SEARCH EVENT
// ==========================

searchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        applyFilters();

    }
);


// ==========================
// FILTER EVENTS
// ==========================

cuisineFilter.addEventListener(
    "change",
    applyFilters
);

difficultyFilter.addEventListener(
    "change",
    applyFilters
);


// ==========================
// RESET FILTER
// ==========================

resetFilterButton.addEventListener(
    "click",
    function () {

        searchInput.value = "";
        cuisineFilter.value = "";
        difficultyFilter.value = "";

        showingFavorites = false;

        sectionTitle.textContent =
            "Explore Recipes";

        renderRecipes(recipes);

        updateResetButton();

    }
);


function updateResetButton() {

    const hasFilter =
        searchInput.value.trim() !== "" ||
        cuisineFilter.value !== "" ||
        difficultyFilter.value !== "";

    resetFilterButton.hidden = !hasFilter;
}


// ==========================
// FAVORITE
// ==========================

function toggleFavorite(id) {

    const recipe =
        recipes.find(recipe => recipe.id === id);

    if (!recipe) return;

    const favoriteIndex =
        favorites.findIndex(
            favorite => favorite.id === id
        );

    if (favoriteIndex === -1) {

        favorites.push(recipe);

    } else {

        favorites.splice(favoriteIndex, 1);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    updateFavoriteCount();

    if (showingFavorites) {

        showFavorites();

    } else {

        applyFilters();

    }
}


// ==========================
// SHOW FAVORITES
// ==========================

favoriteButton.addEventListener(
    "click",
    showFavorites
);


function showFavorites() {

    showingFavorites = true;

    searchInput.value = "";
    cuisineFilter.value = "";
    difficultyFilter.value = "";

    sectionTitle.textContent =
        "Favorite Recipes";

    renderRecipes(favorites);

    resetFilterButton.hidden = true;

}


// ==========================
// FAVORITE COUNT
// ==========================

function updateFavoriteCount() {

    favoriteCount.textContent =
        favorites.length;

}


// ==========================
// RECIPE DETAIL
// ==========================

function showRecipeDetail(id) {

    const recipe =
        recipes.find(recipe => recipe.id === id);

    if (!recipe) return;

    dialogContent.innerHTML = `

        <img
            class="dialog-image"
            src="${recipe.image}"
            alt="${recipe.name}"
        >

        <div class="dialog-body">

            <span class="recipe-cuisine">
                ${recipe.cuisine}
            </span>

            <h2>
                ${recipe.name}
            </h2>

            <div class="dialog-meta">

                <span>
                    ⭐ ${recipe.rating}
                </span>

                <span>
                    ⏱️ ${recipe.cookTimeMinutes} minutes
                </span>

                <span>
                    Difficulty: ${recipe.difficulty}
                </span>

                <span>
                    👨‍🍳 ${recipe.servings} servings
                </span>

            </div>

            <h3>
                Ingredients
            </h3>

            <ul class="ingredients">

                ${recipe.ingredients.map(
                    ingredient =>
                        `<li>${ingredient}</li>`
                ).join("")}

            </ul>

            <h3>
                Instructions
            </h3>

            <div class="instructions">

                ${recipe.instructions.map(
                    (instruction, index) =>
                        `<p>
                            ${index + 1}. ${instruction}
                        </p>`
                ).join("")}

            </div>

        </div>

    `;

    recipeDialog.showModal();

}


// ==========================
// CLOSE DETAIL
// ==========================

closeDialog.addEventListener(
    "click",
    function () {

        recipeDialog.close();

    }
);


// ==========================
// CLOSE DIALOG WHEN CLICK
// OUTSIDE CONTENT
// ==========================



recipeDialog.addEventListener(
    "click",
    function (event) {

        if (event.target === recipeDialog) {

            recipeDialog.close();

        }

    }
);


// ==========================
// START APPLICATION
// ==========================

updateFavoriteCount();

getRecipes();