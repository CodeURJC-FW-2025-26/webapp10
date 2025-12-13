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
                <p class="spinner-text">Cargando...</p>
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

    const form = event.target;
    const gameId = event.target.action.split('/')[4];

    // Clear previous errors
    clearFormErrors(form);


    // Validate form
    if (!validateForm(form)) {
        return;
    }

    showLoadingSpinner();
    
    console.log('Creando reseña para juego con ID:', gameId);

    const formData = new FormData(form);
    
    console.log('Datos del formulario preparados para envío.');
    console.log('Contenido del FormData:');
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
        const response = await fetch(`/game/${gameId}/review/create`, {
            method: "POST",
            body: formData,
        });
        console.log('Respuesta recibida del servidor para la creación de reseña.');
        console.log('Status:', response.status, 'OK:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Datos JSON:', data);

        if (data.success) {
            // Clear form fields
            form.reset();
            hideLoadingSpinner();
            showBootstrapAlert('✅ Reseña creada exitosamente.', 'success');
            // Add the new review to the page dynamically
            if (data.review) {
                addReviewToPage(data.review, gameId);
            }
        } else {
            hideLoadingSpinner();
            // Show error in modal
            const errorMessage = data.errors ? data.errors.join('. ') : (data.message || 'No se ha podido crear la reseña');
            showErrorModal(errorMessage);
        }
    } catch (error) {
        hideLoadingSpinner();
        console.error('Error completo:', error);
        showErrorModal('No se ha podido crear la reseña. Intenta nuevamente. Detalles: ' + error.message);
    }
}

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.invalid-feedback');
    errorElements.forEach(el => el.textContent = '');
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
}

function validateForm(form) {
    let isValid = true;

    // Validate user_name
    const userName = form.querySelector('[name="user_name"]');
    if (!userName.value.trim()) {
        showFieldError(userName, 'El nombre de usuario es obligatorio.');
        isValid = false;
    } else if (userName.value.length > 50) {
        showFieldError(userName, 'El nombre de usuario no puede exceder 50 caracteres.');
        isValid = false;
    }

    // Validate comment_description
    const comment = form.querySelector('[name="comment_description"]');
    if (!comment.value.trim()) {
        showFieldError(comment, 'El comentario es obligatorio.');
        isValid = false;
    } else if (comment.value.length < 25) {
        showFieldError(comment, 'El comentario debe tener al menos 25 caracteres.');
        isValid = false;
    } else if (comment.value.length > 200) {
        showFieldError(comment, 'El comentario no puede exceder 200 caracteres.');
        isValid = false;
    }

    // Validate rating
    const rating = form.querySelector('[name="rating"]');
    const ratingValue = parseFloat(rating.value);
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        showFieldError(rating, 'La calificación debe estar entre 0 y 5.');
        isValid = false;
    }

    // Validate imageFilename
    const image = form.querySelector('[name="imageFilename"]');
    if (!image.files || image.files.length === 0) {
        showFieldError(image, 'Debe seleccionar una imagen.');
        isValid = false;
    } else {
        const file = image.files[0];
        if (!file.type.startsWith('image/')) {
            showFieldError(image, 'El archivo debe ser una imagen.');
            isValid = false;
        }
    }

    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('is-invalid');
    const errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

function showErrorModal(message) {
    const modalBody = document.getElementById('errorModalBody');
    modalBody.textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
}

function calcRating(rating) {
    let ratingt = Math.trunc(rating);
    let starFull = [];
    let starHalf = [];
    let starEmpty = [];

    // Full stars based on integer part
    for (let i = 0; i < ratingt; i++) {
        starFull.push('1');
    }

    // If there is a fractional part, add one half star
    if (rating % 1 !== 0) {
        starHalf.push('1');
    }

    // Calculate empty stars to reach 5 stars total
    const totalFilled = starFull.length + starHalf.length;
    const emptyCount = 5 - totalFilled;

    for (let i = 0; i < emptyCount; i++) {
        starEmpty.push('1');
    }

    return { starFull, starHalf, starEmpty };
}

function addReviewToPage(review, gameId) {
    const reviewsContainer = document.getElementById('reseñas');
    if (!reviewsContainer) return;

    const stars = calcRating(review.rating);

    const reviewHtml = `
        <div class="game-title"><h4>${review.date}-${review.username}:<i class="bi bi-person-check-fill text-info"></i></div>
        
        <div class="rating-stars">
            ${stars.starFull.map(() => '<i class="bi bi-star-fill text-danger"></i>').join('')}
            ${stars.starHalf.map(() => '<i class="bi bi-star-half text-danger"></i>').join('')}
            ${stars.starEmpty.map(() => '<i class="bi bi-star text-danger"></i>').join('')}
        </div></h4>
        <p>${review.comment} </p>
        <div>
            <img src="/game/${gameId}/review/${review._id}/image" width="300" height="200">
        </div>
        <div class="m-3 justify-content-start d-flex">
            <form action="/game/${gameId}/review/delete" method="POST" >
                <input type="hidden" name="review_id" value="${review._id}">
                <input type="submit" class="btn btn-primary" value="Borrar">
                <a href="/game/${gameId}/review_editor/${review._id}" class="btn" >Editar</a>
            </form>
        </div>
    `;

    reviewsContainer.insertAdjacentHTML('beforeend', reviewHtml);
}