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
                alert('❌ Error: ' + (data.message || 'No se ha podido realizar el borrado del juego'));
            }
        } catch (error) {
            hideLoadingSpinner();
            alert('❌ Error: No se ha podido realizar el borrado del juego. Intenta nuevamente.');
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