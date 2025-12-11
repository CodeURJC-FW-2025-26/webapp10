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

function showError(input, message) {
    // Mark the input as invalid
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');

    // Search the feedback element, based on seeing if the parent has one with class 'invalid-feedback'
    let feedback = input.parentElement.querySelector('.invalid-feedback');

    // Create the feedback element if it doesn't exist (that will be the case, the first time)
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback');
        input.parentElement.appendChild(feedback);
    }

    // Set the message
    feedback.textContent = message;
}

// For groups of inputs (like checkboxes/radio buttons)
function showGroupError(container, message) {
    // Mark the container as invalid
    container.classList.add('border', 'border-danger', 'rounded');

    // Search existing feedback element
    let feedback = container.querySelector('.invalid-feedback');

    if (!feedback) {
        feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback', 'd-block');
        container.appendChild(feedback);
    }

    // Set the message
    feedback.textContent = message;
}

function showValid(input) {
    // Mark the input as valid
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');

    // Search the feedback element, based on seeing if the parent has one with class 'invalid-feedback'
    let feedback = input.parentElement.querySelector('.invalid-feedback');

    // Remove the feedback element if it exists
    if (feedback) {
        feedback.remove();
    }
}

// For groups of inputs (like checkboxes/radio buttons)
function showGroupValid(container) {
    // Remove invalid markings from the container
    container.classList.remove('border', 'border-danger', 'rounded');

    // Search the feedback element, based on seeing if the parent has one with class 'invalid-feedback'
    let feedback = container.querySelector('.invalid-feedback');

    // Remove the feedback element if it exists
    if (feedback) {
        feedback.remove();
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

// Form validation for CreateGame form
const gameForm = document.getElementById('createGameForm');
// Input elements v-----------------------------------------------------------------v
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const short_descriptionInput = document.getElementById('short_description');
const developerInput = document.getElementById('developer');
const editorInput = document.getElementById('editor');
const imageInput = document.getElementById('imageFilename');
const priceInput = document.getElementById('price');
const release_dateInput = document.getElementById('release_date');
const age_classificationInput = document.getElementById('age_classification');
const ratingInput = document.getElementById('rating');

    // Special ones for groups of checkboxes v------------------------------v
    const platformContainer = document.getElementById('platforms');
    const platformInputs = document.querySelectorAll('input[name="platform[]"]');

    const genreContainer = document.getElementById('genres');
    const genreInputs = document.querySelectorAll('input[name="genre[]"]');

    const gamemodContainer = document.getElementById('modes');
    const gamemodInputs = document.querySelectorAll('input[name="gamemod[]"]');
    // ^--------------------------------------------------------------------^
// ^--------------------------------------------------------------------------------^

// Event listeners for validation
titleInput.addEventListener('blur', async () => {
    const title = titleInput.value.trim();
    if (title.length === 0) return; // no validar si está vacío

    try {
        const response = await fetch('/check-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        const data = await response.json();

        if (data.exists) {
            showError(titleInput, 'Ya existe un videojuego con ese nombre.');
        } else {
            showValid(titleInput);
        }

    } catch (err) {
        console.error('Error validando título:', err);
        // opcional: mostrar mensaje genérico
    }
});

gameForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Validate required fields and length constraints v------------------------------v
        // Title: between 1 and 75 characters
        if (titleInput.value.trim() === '' || titleInput.value.trim().length < 1 || titleInput.value.trim().length > 75) {
            showError(titleInput, 'El título debe tener entre 1 y 75 caracteres');
        } else {
            showValid(titleInput);
        }

        // Description: between 250 and 1500 characters
        if (descriptionInput.value.trim() === '' || descriptionInput.value.trim().length < 250 || descriptionInput.value.trim().length > 1500) {
            showError(descriptionInput, 'La descripción debe tener entre 250 y 1500 caracteres');
        } else {
            showValid(descriptionInput);
        }

        // Short Description: between 100 and 500 characters
        if (short_descriptionInput.value.trim() === '' || short_descriptionInput.value.trim().length < 100 || short_descriptionInput.value.trim().length > 500) {
            showError(short_descriptionInput, 'La descripción corta debe tener entre 100 y 500 caracteres');
        } else {
            showValid(short_descriptionInput);
        }

        // Developer: between 1 and 50 characters
        if (developerInput.value.trim() === '' || developerInput.value.trim().length < 1 || developerInput.value.trim().length > 50) {
            showError(developerInput, 'El nombre del desarrollador debe tener entre 1 y 50 caracteres');
        } else {
            showValid(developerInput);
        }

        // Editor: between 1 and 50 characters
        if (editorInput.value.trim() === '' || editorInput.value.trim().length < 1 || editorInput.value.trim().length > 50) {
            showError(editorInput, 'El nombre del editor debe tener entre 1 y 50 caracteres');
        } else {
            showValid(editorInput);
        }

        // Price: number between 0 and 1000 with up to 2 decimals
        if (priceInput.value.trim() === '' || isNaN(priceInput.value) || Number(priceInput.value) < 0 || Number(priceInput.value) > 1000 || !/^\d+(\.\d{1,2})?$/.test(priceInput.value)) {
            showError(priceInput, 'El precio debe ser un número mayor o igual a 0 y menor o igual a 1.000, con hasta dos decimales');
        } else {
            showValid(priceInput);
        }

        // Release Date: valid date
        if (release_dateInput.value.trim() === '' || isNaN(Date.parse(release_dateInput.value))) {
            showError(release_dateInput, 'La fecha de lanzamiento es obligatoria');
        } else {
            showValid(release_dateInput);
        }

        // Age Classification: not empty
        if (age_classificationInput.value.trim() === '') {
            showError(age_classificationInput, 'La clasificación por edad es obligatoria');
        } else {
            showValid(age_classificationInput);
        }

        // Rating: number between 0 and 5, can be decimal with 0,5 increments
        if (ratingInput.value.trim() === '' || isNaN(ratingInput.value) || Number(ratingInput.value) < 0 || Number(ratingInput.value) > 5 || ratingInput.value % 0.5 !== 0) {
            showError(ratingInput, 'La calificación debe ser un número válido entre 0 y 5');
        } else {
            showValid(ratingInput);
        }
    // ^---------------------------------------------------------------------------------^

    // 2. Validate if the title starts with capital letter
    if (!/^[A-ZÁÉÍÓÚÑ]/.test(titleInput.value.trim())) {
        showError(titleInput, 'El título debe comenzar con una letra mayúscula');
    } else {
        showValid(titleInput);
    }

    // 3. Validate if an image file was uploaded
    if (imageInput.files.length === 0) {
        showError(imageInput, 'Debe subir una imagen para el videojuego');
    } else {
        showValid(imageInput);
    }

    // 4. Validate if at least one platform, gamemod and genre is selected v----------------------v
        // Transform "platformInputs" into an Array to use .some() and validate if any platform is checked
        const isPlatformChecked = Array.from(platformInputs).some(input => input.checked);
        if (!isPlatformChecked) {
            showGroupError(platformContainer, 'Debe seleccionar al menos una plataforma');
        } else {
            showGroupValid(platformContainer);
        }

        // Transform "gamemodInputs" into an Array to use .some() and validate if any gamemod is checked
        const isGamemodChecked = Array.from(gamemodInputs).some(input => input.checked);
        if (!isGamemodChecked) {
            showGroupError(gamemodContainer, 'Debe seleccionar al menos un modo de juego');
        } else {
            showGroupValid(gamemodContainer);
        }

        // Transform "genreInputs" into an Array to use .some() and validate if any genre is checked
        const isGenreChecked = Array.from(genreInputs).some(input => input.checked);
        if (!isGenreChecked) {
            showGroupError(genreContainer, 'Debe seleccionar al menos un género');
        } else {
            showGroupValid(genreContainer);
        }
    // ^------------------------------------------------------------------------------------------^

    // 5. Entsure the tilte is unique
    try {
        const response = await fetch('/check-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleInput.value.trim() })
        });
        const data = await response.json();

        if (data.exists) {
            showError(titleInput, 'Ya existe un videojuego con ese nombre.');
            valid = false;
        } else {
            showValid(titleInput);
        }
    } catch (err) {
        console.error('Error validando título:', err);
    }

    // 6. Finally, if there are no invalid inputs, submit the form
    const invalidInputs = gameForm.querySelectorAll('.is-invalid, .border-danger');
    if (invalidInputs.length === 0) {
        gameForm.submit();
    }
});