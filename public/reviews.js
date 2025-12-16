async function securemessage(event) {
  event.preventDefault();

  const confirmed = window.confirm(
    "¿Está seguro de que desea borrar el juego? Esta acción no se puede deshacer."
  );
  if (confirmed) {
    showLoadingSpinner();

    const gameId = event.target.action.split("/")[4];

    try {
      const response = await fetch(`/game/${gameId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = `/game/${gameId}/deleted`;
      } else {
        hideLoadingSpinner();
        showBootstrapAlert(
          "❌ Error: " +
            (data.message || "No se ha podido realizar el borrado del juego"),
          "danger"
        );
      }
    } catch (error) {
      hideLoadingSpinner();
      showBootstrapAlert(
        "❌ Error: No se ha podido realizar el borrado del juego. Intenta nuevamente.",
        "danger"
      );
    }
  }
}

function showLoadingSpinner() {
  let spinner = document.getElementById("loading-spinner");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "loading-spinner";
    spinner.className = "spinner-container";
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
  spinner.style.display = "flex";
}

function hideLoadingSpinner() {
  let spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = "none";
  }
}

function showBootstrapAlert(message, type = "danger", timeout = 6000) {
  let container = document.getElementById("bootstrap-alert-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "bootstrap-alert-container";
    container.style.position = "fixed";
    container.style.top = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "1080";
    container.style.maxWidth = "calc(100% - 2rem)";
    document.body.appendChild(container);
  }

  const alertEl = document.createElement("div");
  alertEl.className = `alert alert-${type} alert-dismissible fade show`;
  alertEl.setAttribute("role", "alert");
  alertEl.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

  container.appendChild(alertEl);

  if (timeout > 0) {
    setTimeout(() => {
      try {
        alertEl.remove();
      } catch (e) {}
    }, timeout);
  }
}

async function createreview(event) {
  event.preventDefault();

  const form = event.target;
  const gameId = event.target.action.split("/")[4];

  // Clear previous errors
  clearFormErrors(form);

  // Validate form
  if (!validateForm(form, false)) {
    return;
  }

  showLoadingSpinner();

  const formData = new FormData(form);

  try {
    const response = await fetch(`/game/${gameId}/review/create`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.success) {
      // Clear form fields
      form.reset();
      const clearBtn = document.getElementById("clearReviewImage");
      if (clearBtn) clearBtn.click();
      hideLoadingSpinner();
      showBootstrapAlert("✅ Reseña creada exitosamente.", "success");
      // Add the new review to the page dynamically
      if (data.review) {
        addReviewToPage(data.review, gameId);
      }
    } else {
      hideLoadingSpinner();
      // Show error in modal
      const errorMessage = data.errors
        ? data.errors.join(". ")
        : data.message || "No se ha podido crear la reseña";
      showErrorModal(errorMessage);
    }
  } catch (error) {
    hideLoadingSpinner();
    showErrorModal(
      "No se ha podido crear la reseña. Intenta nuevamente. Detalles: " +
        error.message
    );
  }
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll(".invalid-feedback");
  errorElements.forEach((el) => (el.textContent = ""));
  const inputs = form.querySelectorAll(".form-control");
  inputs.forEach((input) => input.classList.remove("is-invalid"));
  // Reset touched state used by realtime validation
  inputs.forEach((input) => input.removeAttribute("data-touched"));
}

// Validate a single input element and show/hide its error message
function validateField(input, isEdit = false) {
  if (!input) return true;

  const name = input.name;
  const value = input.value;
  const touched = input.getAttribute("data-touched") === "true";

  // Helper to clear error
  function clear() {
    input.classList.remove("is-invalid");
    const err =
      input.parentNode && input.parentNode.querySelector(".invalid-feedback");
    if (err) err.textContent = "";
  }

  // Helper to set error
  function setError(msg) {
    input.classList.add("is-invalid");
    const err =
      input.parentNode && input.parentNode.querySelector(".invalid-feedback");
    if (err) err.textContent = msg;
  }

  // Only show "required" errors if user has touched the control (blurred)
  // But format/length errors are shown in real-time.
  switch (name) {
    case "user_name":
      if (!value.trim()) {
        if (touched) {
          setError("El nombre de usuario es obligatorio.");
          return false;
        }
        clear();
        return false;
      }
      if (value.length > 50) {
        setError("El nombre de usuario no puede exceder 50 caracteres.");
        return false;
      }
      clear();
      return true;

    case "comment_description":
      if (!value.trim()) {
        if (touched) {
          setError("El comentario es obligatorio.");
          return false;
        }
        clear();
        return false;
      }
      if (value.length < 25) {
        setError("El comentario debe tener al menos 25 caracteres.");
        return false;
      }
      if (value.length > 500) {
        setError("El comentario no puede exceder 500 caracteres.");
        return false;
      }
      clear();
      return true;

    case "rating": {
      const rv = parseFloat(value);
      if (isNaN(rv) || rv < 0 || rv > 5) {
        if (touched) {
          setError("La calificación debe estar entre 0 y 5.");
          return false;
        }
        clear();
        return false;
      }
      clear();
      return true;
    }

    case "imageFilename": {
      const files = input.files;
      if (!isEdit) {
        // create: required
        if (!files || files.length === 0) {
          if (touched) {
            setError("Debe seleccionar una imagen.");
            return false;
          }
          clear();
          return false;
        }
      }
      if (files && files.length > 0) {
        const file = files[0];
        if (!file.type.startsWith("image/")) {
          setError("El archivo debe ser una imagen.");
          return false;
        }
      }
      clear();
      return true;
    }

    default:
      clear();
      return true;
  }
}

// Attach realtime validation to a form: 'input' and 'blur' handlers
function attachRealTimeValidation(form, isEdit = false) {
  if (!form) return;

  const inputs = form.querySelectorAll(
    'input[name="user_name"], textarea[name="comment_description"], input[name="rating"], input[name="imageFilename"]'
  );

  inputs.forEach((input) => {
    // On input -> validate format and lengths in real time
    input.addEventListener("input", (e) => {
      validateField(input, isEdit);
    });

    // On change (for file inputs) -> validate
    input.addEventListener("change", (e) => {
      input.setAttribute("data-touched", "true");
      validateField(input, isEdit);
    });

    // On blur -> mark touched and validate required constraints
    input.addEventListener("blur", (e) => {
      input.setAttribute("data-touched", "true");
      validateField(input, isEdit);
    });
  });
}

function validateForm(form, isEdit = false) {
  let isValid = true;

  // Validate user_name
  const userName = form.querySelector('[name="user_name"]');
  if (!userName || !userName.value.trim()) {
    if (userName)
      showFieldError(userName, "El nombre de usuario es obligatorio.");
    isValid = false;
  } else if (userName.value.length > 50) {
    showFieldError(
      userName,
      "El nombre de usuario no puede exceder 50 caracteres."
    );
    isValid = false;
  }

  // Validate comment_description
  const comment = form.querySelector('[name="comment_description"]');
  if (!comment || !comment.value.trim()) {
    if (comment) showFieldError(comment, "El comentario es obligatorio.");
    isValid = false;
  } else if (comment.value.length < 25) {
    showFieldError(comment, "El comentario debe tener al menos 25 caracteres.");
    isValid = false;
  } else if (comment.value.length > 500) {
    showFieldError(comment, "El comentario no puede exceder 500 caracteres.");
    isValid = false;
  }

  // Validate rating
  const rating = form.querySelector('[name="rating"]');
  const ratingValue = rating ? parseFloat(rating.value) : NaN;
  if (!rating || isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
    if (rating)
      showFieldError(rating, "La calificación debe estar entre 0 y 5.");
    isValid = false;
  }

  // Validate imageFilename (required when creating, optional when editing)
  const image = form.querySelector('[name="imageFilename"]');
  if (!isEdit) {
    if (!image || !image.files || image.files.length === 0) {
      if (image) showFieldError(image, "Debe seleccionar una imagen.");
      isValid = false;
    } else {
      const file = image.files[0];
      if (!file.type.startsWith("image/")) {
        showFieldError(image, "El archivo debe ser una imagen.");
        isValid = false;
      }
    }
  } else {
    // editing: image optional, but if provided must be an image
    if (image && image.files && image.files.length > 0) {
      const file = image.files[0];
      if (!file.type.startsWith("image/")) {
        showFieldError(image, "El archivo debe ser una imagen.");
        isValid = false;
      }
    }
  }

  return isValid;
}

function showFieldError(input, message) {
  input.classList.add("is-invalid");
  const errorDiv = input.parentNode.querySelector(".invalid-feedback");
  if (errorDiv) {
    errorDiv.textContent = message;
  }
}

function showErrorModal(message) {
  const modalBody = document.getElementById("errorModalBody");
  modalBody.textContent = message;
  const modal = new bootstrap.Modal(document.getElementById("errorModal"));
  modal.show();
}

function calcRating(rating) {
  let ratingt = Math.trunc(rating);
  let starFull = [];
  let starHalf = [];
  let starEmpty = [];

  // Full stars based on integer part
  for (let i = 0; i < ratingt; i++) {
    starFull.push("1");
  }

  // If there is a fractional part, add one half star
  if (rating % 1 !== 0) {
    starHalf.push("1");
  }

  // Calculate empty stars to reach 5 stars total
  const totalFilled = starFull.length + starHalf.length;
  const emptyCount = 5 - totalFilled;

  for (let i = 0; i < emptyCount; i++) {
    starEmpty.push("1");
  }

  return { starFull, starHalf, starEmpty };
}

function addReviewToPage(review, gameId) {
  const reviewsContainer = document.getElementById("reseñas");
  if (!reviewsContainer) return;

  const stars = calcRating(review.rating);

  const reviewHtml = `
    <div class="review" data-review-id="${review._id}">
        <div class="game-title">
            <h4>${review.date} - ${
    review.username
  } <i class="bi bi-person-check-fill text-info"></i></h4>
        </div>
        <div class="rating-stars">
            ${stars.starFull
              .map(() => '<i class="bi bi-star-fill text-danger"></i>')
              .join("")}
            ${stars.starHalf
              .map(() => '<i class="bi bi-star-half text-danger"></i>')
              .join("")}
            ${stars.starEmpty
              .map(() => '<i class="bi bi-star text-danger"></i>')
              .join("")}
        </div>
        <p>${review.comment}</p>
        <div>
            <img src="/game/${gameId}/review/${
    review._id
  }/image" width="300" height="200" alt="Imagen de reseña">
        </div>
        <div class="m-3 justify-content-start d-flex gap-2">
            <form action="/game/${gameId}/review/delete" method="POST" style="display: inline;">
                <input type="hidden" name="review_id" value="${review._id}">
                <input type="submit" class="btn btn-primary" value="Borrar">
            </form>
            <a href="/game/${gameId}/review_editor/${
    review._id
  }" class="btn btn-primary">Editar</a>
        </div>
    </div>
`;

  reviewsContainer.insertAdjacentHTML("beforeend", reviewHtml);
}

// Helper: build the stars HTML for a given numeric rating
function buildStarsHtml(rating) {
  const stars = calcRating(parseFloat(rating) || 0);
  return `${stars.starFull
    .map(() => '<i class="bi bi-star-fill text-danger"></i>')
    .join("")}
            ${stars.starHalf
              .map(() => '<i class="bi bi-star-half text-danger"></i>')
              .join("")}
            ${stars.starEmpty
              .map(() => '<i class="bi bi-star text-danger"></i>')
              .join("")}`;
}

// Helper: extract rating number from the rating-stars element inside a review
function extractRatingFromNode(ratingNode) {
  if (!ratingNode) return 0;
  const full = ratingNode.querySelectorAll(".bi-star-fill").length;
  const half = ratingNode.querySelectorAll(".bi-star-half").length;
  return full + (half > 0 ? 0.5 : 0);
}

// Event delegation for clicking on 'Editar' links inside reviews
document.addEventListener("click", function (event) {
  const target = event.target.closest("a");
  if (!target) return;
  const href = target.getAttribute("href");
  if (!href) return;

  const match = href.match(/\/game\/(.*?)\/review_editor\/(.*)/);
  if (!match) return; // not a review editor link

  event.preventDefault();
  const gameId = match[1];
  const reviewId = match[2];

  // Prevent multiple edits simultaneously
  if (document.querySelector(".review-edit-form")) return;

  // Work inside the review container (server-rendered or dynamically created)
  const reviewContainer = target.closest(".review");
  if (!reviewContainer) return;

  const wrapper = reviewContainer; // use existing container as wrapper

  // Build inline edit form pre-filled with current values
  const titleNode = wrapper.querySelector(".game-title");
  const ratingNode = wrapper.querySelector(".rating-stars");
  const commentNode = wrapper.querySelector("p");
  const imgNode = wrapper.querySelector("img");
  const buttons = wrapper.querySelector(".buttons");
  // Extract current values
  let username = "";
  const titleText = titleNode ? titleNode.textContent.trim() : "";
  if (titleText) {
    const colonIndex = titleText.indexOf(":");
    if (colonIndex !== -1) {
      // If the title begins with a date (YYYY-MM-DD-username:), strip the date prefix
      if (titleText.length > 10 && titleText[10] === "-") {
        username = titleText.substring(11, colonIndex).trim();
      } else {
        // Fallback: capture text after the last dash up to ':'
        const m = titleText.match(/-([^:]+):/);
        username = m ? m[1].trim() : titleText.substring(0, colonIndex).trim();
      }
    }
  }
  const currentComment = commentNode ? commentNode.textContent.trim() : "";
  const currentRating = extractRatingFromNode(ratingNode);

  const existingImgSrc = imgNode ? imgNode.src : "";
  const formHtml = `
        <form class="review-edit-form d-grid p-3" enctype="multipart/form-data">
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Nombre:</label>
                <div class="col-sm-9"><input type="text" name="user_name" class="form-control" maxlength="50" value="${username}" required>
                    <div class="invalid-feedback"></div>
                </div>
            </div>
            <div class="row mb-2">
                <label class="col-sm-3 col-form-label">Comentario:</label>
                <div class="col-sm-9"><textarea name="comment_description" class="form-control" rows="3" minlength="25" maxlength="500" required>${currentComment}</textarea>
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
  const formContainer = document.createElement("div");
  formContainer.innerHTML = formHtml;
  wrapper.appendChild(formContainer);

  // Hide the original parts (we kept them inside wrapper, so hide them)
  const originalNodes = wrapper.querySelectorAll(
    ".game-title, .rating-stars, p, img, .buttons"
  );
  originalNodes.forEach((n) => {
    if (
      !n.classList.contains("review-edit-form") &&
      !n.closest(".review-edit-form")
    )
      n.style.display = "none";
  });

  // Add event handlers for the form buttons
  const editForm = wrapper.querySelector(".review-edit-form");
  const cancelBtn = wrapper.querySelector(".btn-cancel-edit");

  // Attach realtime validation to the inline edit form (image optional)
  attachRealTimeValidation(editForm, true);
  cancelBtn.addEventListener("click", (e) => {
    // Remove form and show original content
    editForm.remove();
    originalNodes.forEach((n) => (n.style.display = ""));
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    clearFormErrors(form);

    // Inline validation for edit: image optional
    const userName = form.querySelector('[name="user_name"]');
    const comment = form.querySelector('[name="comment_description"]');
    const rating = form.querySelector('[name="rating"]');
    let skipSubmit = false;
    if (!userName.value.trim()) {
      showFieldError(userName, "El nombre de usuario es obligatorio.");
      skipSubmit = true;
    } else if (userName.value.length > 50) {
      showFieldError(
        userName,
        "El nombre de usuario no puede exceder 50 caracteres."
      );
      skipSubmit = true;
    }
    if (!comment.value.trim()) {
      showFieldError(comment, "El comentario es obligatorio.");
      skipSubmit = true;
    } else if (comment.value.length < 25) {
      showFieldError(
        comment,
        "El comentario debe tener al menos 25 caracteres."
      );
      skipSubmit = true;
    } else if (comment.value.length > 500) {
      showFieldError(comment, "El comentario no puede exceder 500 caracteres.");
      skipSubmit = true;
    }
    const ratingVal = parseFloat(rating.value);
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
      showFieldError(rating, "La calificación debe estar entre 0 y 5.");
      skipSubmit = true;
    }
    if (skipSubmit) return;

    showLoadingSpinner();
    try {
      const formData = new FormData(form);
      const response = await fetch(
        `/game/${gameId}/review_editor/${reviewId}/edit`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        // Try to parse JSON error response (sent by server on validation errors)
        const contentType = response.headers.get("content-type") || "";
        hideLoadingSpinner();
        if (contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          const message = data.errors
            ? data.errors.join(". ")
            : data.message || "No se pudo editar la reseña.";
          showErrorModal(message);
        } else {
          const text = await response.text();
          showErrorModal("No se pudo editar la reseña. " + text);
        }
        return;
      }

      // Success: update UI locally
      const newDate = new Date().toISOString().split("T")[0];
      titleNode.querySelector(
        "h4"
      ).innerHTML = `${newDate}-${userName.value}:<i class="bi bi-person-check-fill text-info"></i>`;
      commentNode.textContent = comment.value;
      ratingNode.innerHTML = buildStarsHtml(ratingVal);
      if (imgNode) {
        // Force reload of image from server (cache bust)
        imgNode.src = `/game/${gameId}/review/${reviewId}/image?cache=${Date.now()}`;
      }

      hideLoadingSpinner();
      showBootstrapAlert("✅ Reseña editada con éxito.", "success");

      // Remove inline form and show original content
      editForm.remove();
      originalNodes.forEach((n) => (n.style.display = ""));
    } catch (err) {
      hideLoadingSpinner();
      showErrorModal("Error al editar la reseña: " + err.message);
    }
  });

  // File input preview handling: when user chooses a new file, show it; otherwise keep existing preview
  const fileInput = wrapper.querySelector(
    'input[type="file"][name="imageFilename"]'
  );
  const previewImg = wrapper.querySelector(".edit-image-preview");
  const originalImg = existingImgSrc;
  if (fileInput && previewImg) {
    fileInput.addEventListener("change", (ev) => {
      const f = fileInput.files && fileInput.files[0];
      if (f) {
        const reader = new FileReader();
        reader.onload = function (e) {
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

// Function to set up image preview
function setupImagePreview(inputId, previewContainerId, previewImgId) {
  const input = document.getElementById(inputId);
  if (!input) return; // if input not found, exit

  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById(previewContainerId);
    const previewImg = document.getElementById(previewImgId);

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = "none";
    }
  });
}

// Function to clear image in the review
document.addEventListener("DOMContentLoaded", function () {
  // Preview for creating/editing game
  setupImagePreview("imageFilename", "imagePreview", "previewImg");

  // Preview for reviews (if present on the page)
  setupImagePreview("imageFilename", "reviewImagePreview", "reviewPreviewImg");

  const clearBtn = document.getElementById("clearReviewImage");
  const input = document.getElementById("imageFilename");
  const preview = document.getElementById("reviewImagePreview");
  const previewImg = document.getElementById("reviewPreviewImg");

  if (clearBtn && input) {
    // Disabled if no file selected
    clearBtn.disabled = !(input.files && input.files.length > 0);

    // On input change, enable/disable the button based on file presence
    input.addEventListener("change", () => {
      clearBtn.disabled = !(input.files && input.files.length > 0);
    });

    // On click, clear selection and hide preview
    clearBtn.addEventListener("click", () => {
      input.value = "";
      if (preview) preview.style.display = "none";
      if (previewImg) previewImg.src = "";
      clearBtn.disabled = true;
    });
  }
});

// Delegated handler: intercept review delete forms and perform AJAX delete
document.addEventListener("submit", async (e) => {
  const form = e.target;
  
  if (!form || !form.action || form.action.indexOf("/review/delete") === -1)
    return;

  const match = form.action.match(/\/game\/([^\/]+)\/review\/delete/);
  const gameId = match ? match[1] : null;
  if (!gameId) return;

  e.preventDefault();

  // Prevent double-submission
  if (form.getAttribute("data-deleting") === "true") return;
  form.setAttribute("data-deleting", "true");

  // Find the delete button to disable/reenable it
  const submitBtn = form.querySelector(
    'input[type="submit"], button[type="submit"]'
  );
  if (submitBtn) submitBtn.disabled = true;

  showLoadingSpinner();

  try {
    const formData = new FormData(form);

    const response = await fetch(`/game/${gameId}/review/delete`, {
      method: "POST",
      body: new URLSearchParams(formData),
    });

    // Try parse JSON response when possible
    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      const text = await response.text();
      // If server returned non-JSON but with 200 OK, treat as success
      if (!response.ok) {
        throw new Error(text || "Error al eliminar la reseña");
      }
    }

    if (!response.ok || (data && data.success === false)) {
      const msg =
        data && (data.message || (data.errors && data.errors.join(". ")))
          ? data.message || data.errors.join(". ")
          : "Error al eliminar la reseña.";
      hideLoadingSpinner();
      showErrorModal(msg);
      return;
    }

    // Success: remove review element from DOM
    const reviewId = form.querySelector('[name="review_id"]')
      ? form.querySelector('[name="review_id"]').value
      : data && data.review_id
      ? data.review_id
      : null;
    let reviewEl = null;
    if (reviewId)
      reviewEl = document.querySelector(
        `.review[data-review-id="${reviewId}"]`
      );
    if (!reviewEl) reviewEl = form.closest(".review");
    if (reviewEl) {

      reviewEl.remove();
    }

    hideLoadingSpinner();
    showBootstrapAlert("✅ Reseña eliminada con éxito.", "success");
  } catch (err) {
    hideLoadingSpinner();
    showErrorModal(
      "No se ha podido eliminar la reseña. Detalles: " + (err.message || err)
    );
  } finally {
    form.removeAttribute("data-deleting");
    if (submitBtn) submitBtn.disabled = false;
  }
});
