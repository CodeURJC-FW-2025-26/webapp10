// Infinite Scroll functions
let currentPage = 1;
let isLoading = false;
let hasMore = true;

async function loadMore() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    
    // show loading indicator
    const btn = document.getElementById('loadMore');
    if (btn) {
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cargando...';
        btn.disabled = true;
    }
    
    try {
        // Get search/filter parameters
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || '';
        const genre = urlParams.get('genre') || '';
        const platform = urlParams.get('platform') || '';
        
        // Increment page
        currentPage++;
        
        // Make request
        const params = new URLSearchParams({
            page: currentPage,
            q: query,
            genre: genre,
            platform: platform
        });
        
        const response = await fetch(`/games/load?${params}`);
        const data = await response.json();
        
        // Update if there are more pages
        hasMore = data.hasMore;
        
        if (data.games && data.games.length > 0) {
            // Add games to DOM
            const container = document.querySelector('.games.row ul');
            if (container) {
                data.games.forEach(game => {
                    const gameHTML = createGameHTML(game);
                    container.insertAdjacentHTML('beforeend', gameHTML);
                });
            }
            
            // Hide traditional pagination
            const pagination = document.querySelector('.pagination');
            if (pagination) pagination.style.display = 'none';
            
            // If no more games, hide button
            if (!hasMore && btn) {
                btn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error cargando más juegos:', error);
        currentPage--; // Revert if error
        
        if (btn) {
            btn.innerHTML = 'Error - Intenta de nuevo';
            btn.disabled = false;
        }
    } finally {
        isLoading = false;
        
        if (btn && hasMore) {
            btn.innerHTML = 'Cargar más';
            btn.disabled = false;
        }
    }
}

// Create HTML for a game
function createGameHTML(game) {
    const starsHTML = renderStars(game.stars);
    
    return `
        <li class="game-card col-12 col-sm-6 col-lg-3 mb-3">
            <div class="game-title">${escapeHTML(game.title)}</div>
            ${game.imageFilename ? 
                `<a href="/game/${game._id}">
                    <img class="game-image" src="/game/${game._id}/image" alt="${escapeHTML(game.title)}" width="150" height="200">
                </a>` : ''
            }
            <div class="game-price">${game.price}€</div>
            <div class="rating-stars">${starsHTML}</div>
        </li>
    `;
}

// Helper functions
function renderStars(stars) {
    let html = '';
    if (stars && stars.starFull) {
        for (let i = 0; i < stars.starFull.length; i++) 
            html += '<i class="bi bi-star-fill text-danger"></i>';
        for (let i = 0; i < stars.starHalf.length; i++) 
            html += '<i class="bi bi-star-half text-danger"></i>';
        for (let i = 0; i < stars.starEmpty.length; i++) 
            html += '<i class="bi bi-star text-danger"></i>';
    }
    return html;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Infinite scroll
function initInfiniteScroll() {
    const contentContainer = document.querySelector('.content'); 
    
    if (!contentContainer) {
        console.error('Contenedor de juegos no encontrado');
        return;
    }
    
    contentContainer.addEventListener("scroll", () => {
        const containerHeight = contentContainer.clientHeight;
        const scrollTop = contentContainer.scrollTop;
        const scrollHeight = contentContainer.scrollHeight;
        
        if ((scrollTop + containerHeight >= scrollHeight - 100)) {
            loadMore();
        }
    });
}


// Initialize
document.addEventListener("DOMContentLoaded", function() {
    // Initialize current page from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    
    // Initialize hasMore from global variable
    hasMore = window.hasMore || true;
    
    // Configure button
    const btn = document.getElementById('loadMore');
    if (btn) {
        btn.addEventListener('click', loadMore);
    }
    
    // Initialize infinite scroll (only if not a search)
    // Or always, as you prefer
    initInfiniteScroll();
    
    console.log('Scroll infinito inicializado. Página:', currentPage);
});