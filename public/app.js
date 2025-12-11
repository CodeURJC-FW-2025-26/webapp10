async function securemessage(event) {
    event.preventDefault();
    
    const confirmed = window.confirm("¿Está seguro de que desea borrar el juego? Esta acción no se puede deshacer.");
    if (confirmed) {
        showLoadingSpinner();
        console.log('Iniciando proceso de borrado del juego...');
        console.log('Evento recibido:', event.target.action);
        const gameId = event.target.action.split('/')[4];
        console.log('Borrando juego con ID:', gameId);

        try {
            const response = await fetch(`/game/${gameId}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = `/game/${gameId}/deleted`;
            } else {
                hideLoadingSpinner();
                showBootstrapAlert('❌ Error: ' + (data.message || 'No se ha podido realizar el borrado del juego'), 'danger');
            }
        } catch (error) {
            hideLoadingSpinner();
            showBootstrapAlert('❌ Error: No se ha podido realizar el borrado del juego. Intenta nuevamente.', 'danger');
            console.error('Error al borrar juego:', error);
        }
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

function hideLoadingSpinner() {
    let spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

function showBootstrapAlert(message, type = 'danger', timeout = 6000) {
    let container = document.getElementById('bootstrap-alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'bootstrap-alert-container';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '1080';
        container.style.maxWidth = 'calc(100% - 2rem)';
        document.body.appendChild(container);
    }

    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    alertEl.setAttribute('role', 'alert');
    alertEl.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

    container.appendChild(alertEl);

    if (timeout > 0) {
        setTimeout(() => {
            try { alertEl.remove(); } catch (e) {}
        }, timeout);
    }
}

async function createreview(event) {
    event.preventDefault();

    showLoadingSpinner();
    
    console.log('Evento recibido:', event.target.action);
    const gameId = event.target.action.split('/')[4];
    console.log('Creando reseña con ID:', reviewId);

    const form = event.target;
    const formData = new FormData(form);
    
    const response = await fetch(`/game/${reviewId}/review/create`, {
        method: "POST",
        body: new URLSearchParams(formData),
    })
    const data = await response.json();


    if (data.success) {
        window.location.href = `/game/${gameId}`;

    } else {
        hideLoadingSpinner();
        showBootstrapAlert('❌ Error: ' + (data.errors || 'No se ha podido crear la reseña'), 'danger');
    }

}





