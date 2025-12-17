// public/reviews.js
// JavaScript for handling reviews: create, edit, delete with confirmation, validation, image preview, and dynamic UI updates.

// Function to show a confirmation modal
function showConfirmModal(message, onConfirm) {
  let confirmModal = document.getElementById("ConfirmModal");
  
  // If it doesn't exist, create it
  if (!confirmModal) {
    confirmModal = document.createElement("div");
    confirmModal.id = "ConfirmModal";
    confirmModal.setAttribute("class", "modal fade");
    confirmModal.setAttribute("tabindex", "-1");
    confirmModal.setAttribute("aria-hidden", "true");
    document.body.appendChild(confirmModal);
  }

  // Set modal content
  confirmModal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar acción</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" id="confirmActionBtn">Confirmar</button>
        </div>
      </div>
    </div>
  `;

  // Show the modal
  const modal = new bootstrap.Modal(confirmModal);
  modal.show();

  // Execute callback on confirm
  const confirmBtn = document.getElementById("confirmActionBtn");
  confirmBtn.onclick = () => {
    modal.hide();
    if (onConfirm) onConfirm();
  };
}

//Function to handle secure delete with confirmation
async function securemessage(event) {
  event.preventDefault();

  showConfirmModal(
    "¿Está seguro de que desea borrar el juego? Esta acción no se puede deshacer.",
    async () => {
      showLoadingSpinner();
      // Extract game ID from form action URL
      const match = event.target.action.match(/\/game\/([^\/]+)\/delete/);
      const gameId = match ? match[1] : null;
      // If no gameId, show error and return
      if (!gameId) {
        hideLoadingSpinner();
        showBootstrapAlert("Error: No se pudo identificar el juego.", "danger");
        return;
      }
      // Proceed to send delete request
      try {
        const response = await fetch(`/game/${gameId}/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        // On success, redirect to deleted confirmation page
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
  );
}
// Show and hide loading spinner
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
// Hide loading spinner
function hideLoadingSpinner() {
  let spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = "none";
  }
}
// Function to show Bootstrap alert modal
function showBootstrapAlert(message, type = "danger", timeout = 0) {
  let alertContainer = document.getElementById("AlertContainer");

  // If it doesn't exist, create it
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "AlertContainer";
    alertContainer.setAttribute("class", "modal fade");
    alertContainer.setAttribute("tabindex", "-1");
    alertContainer.setAttribute("aria-hidden", "true");
    document.body.appendChild(alertContainer);
  }

  // Set modal content
  const typeMap = {
    success: "Success",
    danger: "Error",
    warning: "Warning",
    info: "Information",
  };
  // Determine title based on type
  const title = typeMap[type] || "Alert";
  // Set modal content
  alertContainer.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
        </div>
      </div>
    </div>
  `;
  // Show the modal
  const modal = new bootstrap.Modal(alertContainer);
  modal.show();

  // Auto-close after timeout (if specified)
  if (timeout > 0) {
    setTimeout(() => {
      modal.hide();
    }, timeout);
  }
}
// Function to handle review creation
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
  // Submit form data via fetch
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
        console.log(data.review);
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
// Clear all form errors
function clearFormErrors(form) {
  const errorElements = form.querySelectorAll(".invalid-feedback");
  errorElements.forEach((el) => (el.textContent = ""));
  const inputs = form.querySelectorAll(".form-control");
  inputs.forEach((input) => input.classList.remove("is-invalid"));
  // Reset touched state used by realtime validation
  inputs.forEach((input) => input.removeAttribute("data-touched"));
}


// Validate entire form before submission
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
  // image optional, but if provided must be an image
  if (image && image.files && image.files.length > 0) {
    const file = image.files[0];
    if (!file.type.startsWith("image/")) {
      showFieldError(image, "El archivo debe ser una imagen.");
      isValid = false;
    }
  }

  return isValid;
}
// Show error message for a specific input field
function showFieldError(input, message) {
  input.classList.add("is-invalid");
  const errorDiv = input.parentNode.querySelector(".invalid-feedback");
  if (errorDiv) {
    errorDiv.textContent = message;
  }
}
// Function to show error modal with message
function showErrorModal(message) {
  const modalBody = document.getElementById("errorModalBody");
  modalBody.textContent = message;
  const modal = new bootstrap.Modal(document.getElementById("errorModal"));
  modal.show();
}
// Calculate star ratings 
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
// Function to add a new review to the page dynamically
function addReviewToPage(review, gameId) {
  const reviewsContainer = document.getElementById("reseñas");
  if (!reviewsContainer) return;

  const stars = calcRating(review.rating);

  const reviewHtml = `
    <div class="review" data-review-id="${review._id}">
        <div class="game-title">
            <h4>${review.date}:${
    review.username
  } | <i class="bi bi-person-check-fill text-info"></i></h4>
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
  }/image" width="300" height="200">
          </div>

        <div class="buttons m-3 justify-content-start d-flex">
          <form action="/game/${gameId}/review/delete" method="POST">
            <input type="hidden" name="review_id" value="${review._id}">
            <input type="submit" class="btn btn-primary" value="Borrar">
              <a href="/game/${gameId}/review_editor/${
    review._id
  }" class="btn">Editar</a>
          </form>

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
    const colonIndex = titleText.indexOf("|");
    if (colonIndex !== -1) {
      // If the title begins with a date (YY-MM-DD:username:), strip the date prefix
      console.log(colonIndex);
      username = titleText.substring(11, colonIndex).trim();
    }
  }
  const currentComment = commentNode ? commentNode.textContent.trim() : "";
  const currentRating = extractRatingFromNode(ratingNode);

  // Get existing image src (if any)
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
                    <div id="dropArea" class="file-upload-container">
                                <input type="file" id="imageFilename" name="imageFilename" class="form-control" accept=".png, .jpg, .jpeg, .svg, .webp, image/png, image/jpeg, image/svg+xml, image/webp" style="display: none;">
                                <label for="imageFilename">
                                    Arrastra tus imágenes aquí, o haz clic para seleccionarlas.
                                </label>
                            </div>
                    <input type="hidden" name="existing_image" value="${existingImgSrc}">
                    <div class="invalid-feedback"></div>
                    <button type="button" id="clearReviewImage" class="btn btn-outline-secondary mt-2">
                      Quitar imagen
                    </button>
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

    // Inline validation for edit
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
      ).innerHTML = `${newDate}:${userName.value}|<i class="bi bi-person-check-fill text-info"></i>`;
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
    // Send delete request via fetch
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
    // Handle error responses
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
