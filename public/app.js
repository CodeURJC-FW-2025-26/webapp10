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
    if (!validateForm(form, false)) {
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

function validateForm(form, isEdit = false) {
    let isValid = true;

    // Validate user_name
    const userName = form.querySelector('[name="user_name"]');
    if (!userName || !userName.value.trim()) {
        if (userName) showFieldError(userName, 'El nombre de usuario es obligatorio.');
        isValid = false;
    } else if (userName.value.length > 50) {
        showFieldError(userName, 'El nombre de usuario no puede exceder 50 caracteres.');
        isValid = false;
    }

    // Validate comment_description
    const comment = form.querySelector('[name="comment_description"]');
    if (!comment || !comment.value.trim()) {
        if (comment) showFieldError(comment, 'El comentario es obligatorio.');
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
    const ratingValue = rating ? parseFloat(rating.value) : NaN;
    if (!rating || isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        if (rating) showFieldError(rating, 'La calificación debe estar entre 0 y 5.');
        isValid = false;
    }

    // Validate imageFilename (required when creating, optional when editing)
    const image = form.querySelector('[name="imageFilename"]');
    if (!isEdit) {
        if (!image || !image.files || image.files.length === 0) {
            if (image) showFieldError(image, 'Debe seleccionar una imagen.');
            isValid = false;
        } else {
            const file = image.files[0];
            if (!file.type.startsWith('image/')) {
                showFieldError(image, 'El archivo debe ser una imagen.');
                isValid = false;
            }
        }
    } else {
        // editing: image optional, but if provided must be an image
        if (image && image.files && image.files.length > 0) {
            const file = image.files[0];
            if (!file.type.startsWith('image/')) {
                showFieldError(image, 'El archivo debe ser una imagen.');
                isValid = false;
            }
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
            <div class="review" data-review-id="${review._id}">
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
            </div>
    `;

    reviewsContainer.insertAdjacentHTML('beforeend', reviewHtml);
}

// Helper: build the stars HTML for a given numeric rating
function buildStarsHtml(rating) {
    const stars = calcRating(parseFloat(rating) || 0);
    return `${stars.starFull.map(() => '<i class="bi bi-star-fill text-danger"></i>').join('')}
            ${stars.starHalf.map(() => '<i class="bi bi-star-half text-danger"></i>').join('')}
            ${stars.starEmpty.map(() => '<i class="bi bi-star text-danger"></i>').join('')}`;
}

// Helper: extract rating number from the rating-stars element inside a review
function extractRatingFromNode(ratingNode) {
    if (!ratingNode) return 0;
    const full = ratingNode.querySelectorAll('.bi-star-fill').length;
    const half = ratingNode.querySelectorAll('.bi-star-half').length;
    return full + (half > 0 ? 0.5 : 0);
}

// Event delegation for clicking on 'Editar' links inside reviews
document.addEventListener('click', function(event) {
    const target = event.target.closest('a');
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href) return;

    const match = href.match(/\/game\/(.*?)\/review_editor\/(.*)/);
    if (!match) return; // not a review editor link

    event.preventDefault();
    const gameId = match[1];
    const reviewId = match[2];

    // Prevent multiple edits simultaneously
    if (document.querySelector('.review-edit-form')) return;

    // Work inside the review container (server-rendered or dynamically created)
    const reviewContainer = target.closest('.review');
    if (!reviewContainer) return;

    const wrapper = reviewContainer; // use existing container as wrapper

    // Build inline edit form pre-filled with current values
    const titleNode = wrapper.querySelector('.game-title');
    const ratingNode = wrapper.querySelector('.rating-stars');
    const commentNode = wrapper.querySelector('p');
    const imgNode = wrapper.querySelector('img');

    // Extract current values
    let username = '';
    const titleText = titleNode ? titleNode.textContent.trim() : '';
    if (titleText) {
        const colonIndex = titleText.indexOf(':');
        if (colonIndex !== -1) {
            // If the title begins with a date (YYYY-MM-DD-username:), strip the date prefix
            if (titleText.length > 10 && titleText[10] === '-') {
                username = titleText.substring(11, colonIndex).trim();
            } else {
                // Fallback: capture text after the last dash up to ':'
                const m = titleText.match(/-([^:]+):/);
                username = m ? m[1].trim() : titleText.substring(0, colonIndex).trim();
            }
        }
    }
    const currentComment = commentNode ? commentNode.textContent.trim() : '';
    const currentRating = extractRatingFromNode(ratingNode);

    const existingImgSrc = imgNode ? imgNode.src : '';
    const formHtml = `
        <form class="review-edit-form d-grid p-3 border rounded bg-light" enctype="multipart/form-data">
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Nombre:</label>
                <div class="col-sm-9"><input type="text" name="user_name" class="form-control" maxlength="50" value="${username}" required>
                    <div class="invalid-feedback"></div>
                </div>
            </div>
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Comentario:</label>
                <div class="col-sm-9"><textarea name="comment_description" class="form-control" rows="3" minlength="25" maxlength="200" required>${currentComment}</textarea>
                    <div class="invalid-feedback"></div>
                </div>
            </div>
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Calificación:</label>
                <div class="col-sm-5"><input type="number" name="rating" class="form-control" min="0" max="5" step="0.5" value="${currentRating}" required>
                    <div class="invalid-feedback"></div>
                </div>
            </div>
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Imagen actual / Cambiar:</label>
                <div class="col-sm-9 d-flex flex-column">
                    <img src="${existingImgSrc}" class="edit-image-preview mb-2" width="300" height="200">
                    <input type="file" name="imageFilename" class="form-control" accept="image/*">
                    <input type="hidden" name="existing_image" value="${existingImgSrc}">
                    <div class="invalid-feedback"></div>
                </div>
            </div>
            <div class="d-flex gap-2 mt-2">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary btn-cancel-edit">Cancelar</button>
            </div>
        </form>`;

    // Create form container and insert
    const formContainer = document.createElement('div');
    formContainer.innerHTML = formHtml;
    wrapper.appendChild(formContainer);

    // Hide the original parts (we kept them inside wrapper, so hide them)
    const originalNodes = wrapper.querySelectorAll('.game-title, .rating-stars, p, img, .m-3');
    originalNodes.forEach(n => { if (!n.classList.contains('review-edit-form') && !n.closest('.review-edit-form')) n.style.display = 'none'; });

    // Add event handlers for the form buttons
    const editForm = wrapper.querySelector('.review-edit-form');
    const cancelBtn = wrapper.querySelector('.btn-cancel-edit');
    cancelBtn.addEventListener('click', (e) => {
        // Remove form and show original content
        editForm.remove();
        originalNodes.forEach(n => n.style.display = '');
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        clearFormErrors(form);
        
        // Inline validation for edit: image optional
        const userName = form.querySelector('[name="user_name"]');
        const comment = form.querySelector('[name="comment_description"]');
        const rating = form.querySelector('[name="rating"]');
        let skipSubmit = false;
        if (!userName.value.trim()) { showFieldError(userName, 'El nombre de usuario es obligatorio.'); skipSubmit = true; }
        else if (userName.value.length > 50) { showFieldError(userName, 'El nombre de usuario no puede exceder 50 caracteres.'); skipSubmit = true; }
        if (!comment.value.trim()) { showFieldError(comment, 'El comentario es obligatorio.'); skipSubmit = true; }
        else if (comment.value.length < 25) { showFieldError(comment, 'El comentario debe tener al menos 25 caracteres.'); skipSubmit = true; }
        else if (comment.value.length > 200) { showFieldError(comment, 'El comentario no puede exceder 200 caracteres.'); skipSubmit = true; }
        const ratingVal = parseFloat(rating.value);
        if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) { showFieldError(rating, 'La calificación debe estar entre 0 y 5.'); skipSubmit = true; }
        if (skipSubmit) return;

        showLoadingSpinner();
        try {
            const formData = new FormData(form);
            const response = await fetch(`/game/${gameId}/review_editor/${reviewId}/edit`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                // Try to parse JSON error response (sent by server on validation errors)
                const contentType = response.headers.get('content-type') || '';
                hideLoadingSpinner();
                if (contentType.indexOf('application/json') !== -1) {
                    const data = await response.json();
                    const message = data.errors ? data.errors.join('. ') : (data.message || 'No se pudo editar la reseña.');
                    showErrorModal(message);
                } else {
                    const text = await response.text();
                    showErrorModal('No se pudo editar la reseña. ' + text);
                }
                return;
            }

            // Success: update UI locally
            const newDate = new Date().toISOString().split('T')[0];
            titleNode.querySelector('h4').innerHTML = `${newDate}-${userName.value}:<i class="bi bi-person-check-fill text-info"></i>`;
            commentNode.textContent = comment.value;
            ratingNode.innerHTML = buildStarsHtml(ratingVal);
            if (imgNode) {
                // Force reload of image from server (cache bust)
                imgNode.src = `/game/${gameId}/review/${reviewId}/image?cache=${Date.now()}`;
            }

            hideLoadingSpinner();
            showBootstrapAlert('✅ Reseña editada con éxito.', 'success');

            // Remove inline form and show original content
            editForm.remove();
            originalNodes.forEach(n => n.style.display = '');

        } catch (err) {
            hideLoadingSpinner();
            showErrorModal('Error al editar la reseña: ' + err.message);
        }
    });

    // File input preview handling: when user chooses a new file, show it; otherwise keep existing preview
    const fileInput = wrapper.querySelector('input[type="file"][name="imageFilename"]');
    const previewImg = wrapper.querySelector('.edit-image-preview');
    const originalImg = existingImgSrc;
    if (fileInput && previewImg) {
        fileInput.addEventListener('change', (ev) => {
            const f = fileInput.files && fileInput.files[0];
            if (f) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                };
                reader.readAsDataURL(f);
            } else {
                // no file selected -> show the old image
                previewImg.src = originalImg;
            }
        });
    }
});