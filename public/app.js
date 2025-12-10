async function securemessage(event) {
    event.preventDefault();
    
    const confirmed = window.confirm("¿Está seguro de que desea borrar el juego? Esta acción no se puede deshacer.");
    if (confirmed) {
        showLoadingSpinner();
        event.target.submit();
    }
}

function showLoadingSpinner() {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'spinner-container';
        spinner.innerHTML = `
            <div class="spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="spinner-text">Borrando juego...</p>
            </div>
        `;
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}