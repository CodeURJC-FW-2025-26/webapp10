// If we are editing, assume a hidden field with the game ID
const currentEditingGame_id = document.getElementById('game_id')?.value;

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
    container.classList.remove('border', 'border-success', 'rounded');
    container.classList.add('border', 'border-danger', 'rounded');

    // Search existing feedback element
    let feedback = container.querySelector('.invalid-feedback');

    // Create the feedback element if it doesn't exist (that will be the case, the first time)
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
    container.classList.add('border', 'border-success', 'rounded');

    // Search the feedback element, based on seeing if the parent has one with class 'invalid-feedback'
    let feedback = container.querySelector('.invalid-feedback');

    // Remove the feedback element if it exists
    if (feedback) {
        feedback.remove();
    }
}

// Function to show error modal with an array of errors
function showArrayErrorModal(errorsArray) {
    const modalBody = document.getElementById("errorModalBody");
    
    // 1. Transform the array of errors into an HTML list (<ul><li>...</li></ul>)
    const errorListHTML = errorsArray.map(err => `<li>${err}</li>`).join('');
    
    // 2. Use .innerHTML to inject the HTML list into the modal body
    modalBody.innerHTML = `<ul>${errorListHTML}</ul>`;
    
    // 3. Show the Bootstrap modal
    const modalElement = document.getElementById("errorModal");
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show();
}





// Drag-and-Drop functionality for image upload area v---------------------------------v
    const dropArea = document.getElementById('dropArea');

    // 1. Prevent default behaviour
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false); // Also at the body level to prevent navigation
    });

    function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
    }

    // 2. Resaltar la zona al arrastrar
    ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
    dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
    dropArea.classList.remove('highlight');
    }

    // 3. Manejar el archivo soltado
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files; // files es un objeto FileList con los archivos

    handleFiles(files); // Llama a una función para procesar los archivos
    }

    function handleFiles(files) {
    files = [...files]; // Convierte FileList a un array

    files.forEach(file => {
        // Aquí puedes hacer validaciones (como verificar que sea una imagen)
        if (file.type.startsWith('image/')) {
            // Por ejemplo, para mostrar una vista previa:
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                // Aquí añades img a tu galería o zona de vista previa
            };
            reader.readAsDataURL(file);
            
            // Aquí es donde enviarías el archivo al servidor (fetch o XMLHttpRequest)
            // uploadFile(file); 
        }
    });
    }
// ^-----------------------------------------------------------------------------------^


// Function to clear image in the review
document.addEventListener("DOMContentLoaded", function () {
    const clearBtn = document.getElementById("clearImage");
    const input = document.getElementById("imageFilename");
    const preview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");

    // Dishable if no file is selected
    if (clearBtn && input) {
        clearBtn.disabled = !(input.files && input.files.length > 0);
    }

    // Changing the input, enable/disable the button, depending on whether there is a file
    input.addEventListener("change", () => {
        clearBtn.disabled = !(input.files && input.files.length > 0);
    });

    // On click, clear selection and hide the preview
    clearBtn.addEventListener("click", () => {
        input.value = "";
        if (preview) preview.style.display = "none";
        if (previewImg) previewImg.src = "";
        clearBtn.disabled = true;
        showError(input, 'Debe subir una imagen para el videojuego');
    });
});





// Debounce implementation
// Delays the execution of a function until a certain amount of time has passed without further calls.
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args); // 'this' will be the element titleInput
        }, delay);
    };
}



// Synchronous client validation function for the title field
function validateTitleClient(titleInput) {
    
    // Title: between 1 and 75 characters
    if (titleInput.value.trim() === '' || titleInput.value.trim().length < 1 || titleInput.value.trim().length > 75) {
        showError(titleInput, 'El título debe tener entre 1 y 75 caracteres');
        return false;
    }
    
    // Title: starts with capital letter
    if (!/^[A-ZÁÉÍÓÚÑ]/.test(titleInput.value.trim())) {
        showError(titleInput, 'El título debe comenzar con una letra mayúscula');
        return false;
    }
    
    // If it passes the synchronous validations, show valid and return true to continue with the uniqueness validation.
    showValid(titleInput);
    return true;
}

// Asynchronous validation function (AJAX/Fetch) for Uniqueness
async function validateTitleUniqueness(event) {
    const titleInput = event.target;
    const title = titleInput.value.trim();

    // If the synchronous validation fails, do not make the API call
    if (!validateTitleClient(titleInput)) {
        return;
    }
    
    // Build the request URL
    let url = `/check-title-unique?title=${encodeURIComponent(title)}`;
    
    // If we are editing, add the game ID
    if (currentEditingGame_id) {
        url += `&game_id=${encodeURIComponent(currentEditingGame_id)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.isUnique === false) {
            // The game already exists (or there was an error)
            showError(titleInput, data.message || 'Error al verificar unicidad.');
        } else {
            // The game doesn't exist -> Valid
            showValid(titleInput);
        }

    } catch (error) {
        console.error('Error en la llamada AJAX:', error);
        // In case of network or server error:
        showError(titleInput, 'Error de conexión al servidor. Inténtalo de nuevo.');
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


// We call the uniqueness validation (which includes synchronous validation) with a delay
titleInput.addEventListener('input', debounce(validateTitleUniqueness, 500));

// Validate required description and length constraints
descriptionInput.addEventListener('input', () => {

    // Description: between 250 and 1500 characters
    if (descriptionInput.value.trim() === '' || descriptionInput.value.trim().length < 250 || descriptionInput.value.trim().length > 1500) {
        showError(descriptionInput, 'La descripción debe tener entre 250 y 1500 caracteres');
    } else {
        showValid(descriptionInput);
    }

});

// Validate required short description and length constraints
short_descriptionInput.addEventListener('input', () => {

    // Short Description: between 100 and 500 characters
    if (short_descriptionInput.value.trim() === '' || short_descriptionInput.value.trim().length < 100 || short_descriptionInput.value.trim().length > 500) {
        showError(short_descriptionInput, 'La descripción corta debe tener entre 100 y 500 caracteres');
    } else {
        showValid(short_descriptionInput);
    }

});

// Validate required developer and length constraints
developerInput.addEventListener('input', () => {

    // Developer: between 1 and 50 characters
    if (developerInput.value.trim() === '' || developerInput.value.trim().length < 1 || developerInput.value.trim().length > 50) {
        showError(developerInput, 'El nombre del desarrollador debe tener entre 1 y 50 caracteres');
    } else {
        showValid(developerInput);
    }

});

// Validate required editor and length constraints
editorInput.addEventListener('input', () => {

    // Editor: between 1 and 50 characters
    if (editorInput.value.trim() === '' || editorInput.value.trim().length < 1 || editorInput.value.trim().length > 50) {
        showError(editorInput, 'El nombre del editor debe tener entre 1 y 50 caracteres');
    } else {
        showValid(editorInput);
    }

});

// Validate required price and length constraints
priceInput.addEventListener('input', () => {

    // Price: number between 0 and 1000 with up to 2 decimals
    if (priceInput.value.trim() === '' || isNaN(priceInput.value) || Number(priceInput.value) < 0 || Number(priceInput.value) > 1000) {
        showError(priceInput, 'Debe ser un número entre 0 y 1.000, ambos incluidos');
    } else if (!/^\d+(\.\d{1,2})?$/.test(priceInput.value)) {
        showError(priceInput, 'Debe tener como máximo dos decimales');
    } else {
        showValid(priceInput);
    }

});

// Validate required release date and length constraints
release_dateInput.addEventListener('input', () => {

    // Release Date: valid date
    if (release_dateInput.value.trim() === '' || isNaN(Date.parse(release_dateInput.value))) {
        showError(release_dateInput, 'La fecha de lanzamiento es obligatoria');
    } else {
        showValid(release_dateInput);
    }

});

// Validate required age classification and length constraints
age_classificationInput.addEventListener('input', () => {

    // Age Classification: not empty
    if (age_classificationInput.value.trim() === '') {
        showError(age_classificationInput, 'La clasificación por edad es obligatoria');
    } else {
        showValid(age_classificationInput);
    }

});

// Validate required rating and length constraints
ratingInput.addEventListener('input', () => {

    // Rating: number between 0 and 5, can be decimal with 0,5 increments
    if (ratingInput.value.trim() === '' || isNaN(ratingInput.value) || Number(ratingInput.value) < 0 || Number(ratingInput.value) > 5) {
        showError(ratingInput, 'La calificación debe ser un número válido entre 0 y 5');
    } else if (ratingInput.value % 0.5 !== 0) {
        showError(ratingInput, 'Solo se admiten decimales en incrementos de 0.5');
    } else {
        showValid(ratingInput);
    }

});

// Validate image upload (required only when creating)
imageInput.addEventListener('change', () => {

    // Array of allowed image types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

    // If editing and no new file selected, keep current image -> valid
    if (currentEditingGame_id && imageInput.files.length === 0) {
        showValid(imageInput);
        return;
    }

    // When creating (no game id), image is required
    if (!currentEditingGame_id && imageInput.files.length === 0) {
        showError(imageInput, 'Debe subir una imagen para el videojuego');
        return;
    }

    // If a file is present (either creating or editing), validate type
    const file = imageInput.files[0];
    if (!file) {
        // Safety: treat as valid when editing, error when creating
        if (currentEditingGame_id) {
            showValid(imageInput);
        } else {
            showError(imageInput, 'Debe subir una imagen para el videojuego');
        }
        return;
    }

    const fileType = file.type;
    if (!fileType || !fileType.startsWith('image/')) {
        // The uploaded file is not an image
        showError(imageInput, 'El archivo subido no es una imagen válida');
    } else if (!allowedTypes.includes(fileType)) {
        // The uploaded file is not one of the allowed types
        showError(imageInput, 'Solo se permiten PNG, JPG/JPEG, SVG y WebP.');
    } else {
        showValid(imageInput);
    }

});

// Validate if at least one platform is selected
platformContainer.addEventListener('change', () => {

    // Transform "platformInputs" into an Array to use .some() and validate if any platform is checked
    const isPlatformChecked = Array.from(platformInputs).some(input => input.checked);
    if (!isPlatformChecked) {
        showGroupError(platformContainer, 'Debe seleccionar al menos una plataforma');
    } else {
        showGroupValid(platformContainer);
    }

});

// Validate if at least one gamemode is selected
gamemodContainer.addEventListener('change', () => {

    // Transform "gamemodInputs" into an Array to use .some() and validate if any gamemod is checked
    const isGamemodChecked = Array.from(gamemodInputs).some(input => input.checked);
    if (!isGamemodChecked) {
        showGroupError(gamemodContainer, 'Debe seleccionar al menos un modo de juego');
    } else {
        showGroupValid(gamemodContainer);
    }

});

// Validate if at least one genre is selected
genreContainer.addEventListener('change', () => {

    // Transform "genreInputs" into an Array to use .some() and validate if any genre is checked
    const isGenreChecked = Array.from(genreInputs).some(input => input.checked);
    if (!isGenreChecked) {
        showGroupError(genreContainer, 'Debe seleccionar al menos un género');
    } else {
        showGroupValid(genreContainer);
    }

});

// List of inputs that need the class 'is-valid'
const requiredValidInputs = [
    titleInput, descriptionInput, short_descriptionInput, developerInput, editorInput,
    priceInput, release_dateInput, age_classificationInput, ratingInput
].concat(currentEditingGame_id ? [] : [imageInput]);

// List of containers that need the class 'border-success'
const requiredValidContainers = [
    platformContainer, gamemodContainer, genreContainer
];

// Function to check if all fields have the success class
function checkAllClientValidations() {
    let allInputsValid = requiredValidInputs.every(input => input.classList.contains('is-valid'));
    let allContainersValid = requiredValidContainers.every(container => container.classList.contains('border-success'));
    
    return allInputsValid && allContainersValid;
}


// Form submission event
gameForm.addEventListener('submit', async (event) => {

    // 1. Prevent default submission to validate first
    event.preventDefault();

    // 00. If something is not valid, don't submit the form
    /*if (!checkAllClientValidations()) {

        // Show a general alert and don't submit the form
        alert('Por favor, corrija los errores en el formulario antes de enviarlo.');
        return;

    }*/

    // 2. AJAX submission v----------------------------------------------v
        // Show the loading spinner
        showLoadingSpinner();

        const formData = new FormData(gameForm);
        // Obteins the URL form acction (/game/create/:id)
        const formAction = gameForm.action;

        try {
            const response = await fetch(formAction, {
                method: 'POST',
                body: formData, // FormData manages the codification and the image automatically
            });
            
            // Hide the spinner before processing the response
            hideLoadingSpinner();

            // The server should respond with 200/201 (success) or 4xx/5xx (error)

            if (response.ok) {
                // Success: The server responded with 200-299
                
                // If the server sends a JSON with the new ID (or the edited ID)
                const data = await response.json(); 
                
                // Redirect to the detail page of the created/edited game
                // Assume the JSON response contains the game ID
                const gameId = data.gameId || data._id;

                if (gameId) {
                    window.location.href = `/game/${gameId}`;
                } else {
                    // If the ID is not in the response (just in case), redirect to the catalog
                    window.location.href = '/catalog';
                }

            } else if (response.status === 400) {
                // Error 400 (Bad Request) - Server Validation Failure
                
                // Show error in a dialog box
                const errorData = await response.json(); // Try to read the JSON with errors
                 
                showArrayErrorModal(errorData.errors);

                if (errorData.errors && Array.isArray(errorData.errors)) {
                    // If the server returns a list of errors
                    showArrayErrorModal(errorData.errors);
                } else {
                    // Fallback if the server didn't send the expected list of errors
                    showErrorModal(['Error desconocido en la validación del servidor.']);
                }
            
            } else {

                // Generic HTTP error (e.g., 404, 500)
                errorMessage = `Error ${response.status}: ${response.statusText}.`;
               
            }

        } catch (error) {
            // Network error (server not responding or connection fails)
            hideLoadingSpinner();
            console.error('Network or Parse Error:', error);
            showErrorModal('Error de conexión con el servidor. Por favor, inténtelo de nuevo.');
        }
    // ^-----------------------------------------------------------------^

});