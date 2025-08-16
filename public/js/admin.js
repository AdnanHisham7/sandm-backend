document.addEventListener("DOMContentLoaded", function () {
  // Brand Select Handler
  const brandSelect = document.getElementById("brandSelect");
  if (brandSelect) {
    brandSelect.addEventListener("change", function () {
      const selectedValue = this.value;
      const currentPath = window.location.pathname;
      if (selectedValue) {
        const newPath = currentPath.includes("products")
          ? "/admin/products?brand=" + selectedValue
          : "/admin/categories?brand=" + selectedValue;
        window.location.href = newPath;
      }
    });
  }

  // Brand Form Submission
  const brandForm = document.getElementById("brandForm");
  if (brandForm) {
    brandForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const id = document.getElementById("brandId").value;
      const url = id ? `/admin/brands/${id}` : "/admin/brands/add";
      const method = id ? "PUT" : "POST";
      try {
        const response = await fetch(url, { method, body: formData });
        if (response.redirected) {
          window.location.href = response.url;
        } else if (response.ok) {
          closeBrandModal();
          location.reload();
        } else {
          alert("Error saving brand");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error saving brand");
      }
    });
  }

  // Category Form Submission
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const id = document.getElementById("categoryId")?.value || "";
      const url = id ? `/admin/categories/${id}` : "/admin/categories/add";
      const method = id ? "PUT" : "POST";
      console.log("Submitting category form:", { method, url, id });
      try {
        const response = await fetch(url, { method, body: formData });
        if (response.redirected) {
          window.location.href = response.url;
        } else if (response.ok) {
          closeCategoryModal();
          location.reload();
        } else {
          alert("Error saving category");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error saving category");
      }
    });
  }

  // Product Form Submission
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const id = document.getElementById("productId")?.value || "";
      const url = id ? `/admin/products/${id}` : "/admin/products/add";
      const method = id ? "PUT" : "POST";
      console.log("Submitting product form:", { method, url, id });
      try {
        const response = await fetch(url, { method, body: formData });
        if (response.redirected) {
          window.location.href = response.url;
        } else if (response.ok) {
          closeProductModal();
          location.reload();
        } else {
          alert("Error saving product");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error saving product");
      }
    });
  }
});

// Brand Modal Functions
function openBrandModal(brandId = null) {
  const modal = document.getElementById("brandModal");
  const form = document.getElementById("brandForm");
  form.reset();
  document.getElementById("brandId").value = "";
  const existingInput = form.querySelector('input[name="currentLogo"]');
  if (existingInput) existingInput.remove();

  if (brandId) {
    fetch(`/admin/brands/${brandId}`)
      .then((response) => response.json())
      .then((brand) => {
        document.getElementById("brandId").value = brand._id;
        document.getElementById("name").value = brand.name;
        document.getElementById("description").value = brand.description || "";
        document.getElementById("url").value = brand.url || "";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "currentLogo";
        input.value = brand.logo || "";
        form.appendChild(input);
      })
      .catch((error) => console.error("Error fetching brand:", error));
  }
  modal.classList.remove("hidden");
}

function closeBrandModal() {
  document.getElementById("brandModal").classList.add("hidden");
}

// Category Modal Functions
function openCategoryModal(categoryId = null) {
  const modal = document.getElementById("categoryModal");
  const form = document.getElementById("categoryForm");
  form.reset();
  document.getElementById("categoryId").value = "";
  const existingInput = form.querySelector('input[name="currentImage"]');
  if (existingInput) existingInput.remove();

  if (categoryId) {
    fetch(`/admin/categories/${categoryId}`)
      .then((response) => response.json())
      .then((category) => {
        document.getElementById("categoryId").value = category._id;
        document.getElementById("catName").value = category.name;
        document.getElementById("catDescription").value =
          category.description || "";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "currentImage";
        input.value = category.image || "";
        form.appendChild(input);
      })
      .catch((error) => console.error("Error fetching category:", error));
  }
  modal.classList.remove("hidden");
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.add("hidden");
}

// Product Modal Functions
function openProductModal(productId = null) {
  const modal = document.getElementById("productModal");
  const form = document.getElementById("productForm");
  form.reset();
  document.getElementById("productId").value = "";
  form
    .querySelectorAll('input[name="currentImages"]')
    .forEach((el) => el.remove());
  form
    .querySelectorAll('input[name="currentSketchImages"]')
    .forEach((el) => el.remove());

  if (productId) {
    fetch(`/admin/products/${productId}`)
      .then((response) => response.json())
      .then((product) => {
        document.getElementById("productId").value = product._id;
        document.getElementById("prodName").value = product.name;
        document.getElementById("prodDescription").value =
          product.description || "";
        document.getElementById("prodCategory").value = product.category._id;
        product.images.forEach((img) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "currentImages";
          input.value = img;
          form.appendChild(input);
        });
        product.sketchImages.forEach((img) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "currentSketchImages";
          input.value = img;
          form.appendChild(input);
        });
        const specsContainer = document.getElementById("specsContainer");
        specsContainer.innerHTML = "";
        product.specifications.forEach((spec) => {
          const div = document.createElement("div");
          div.className = "flex space-x-2";
          div.innerHTML = `
            <input type="text" name="specifications[]" value="${spec}" class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <button type="button" onclick="this.parentNode.remove()" class="p-2 text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
          `;
          specsContainer.appendChild(div);
        });
      })
      .catch((error) => console.error("Error fetching product:", error));
  }
  modal.classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden");
}

function addImageInput(value = "") {
  const container = document.getElementById("imagesContainer");
  const div = document.createElement("div");
  div.className = "flex space-x-2";
  div.innerHTML = `
    <input type="url" name="images[]" value="${value}" placeholder="https://example.com/image.jpg" class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
    <button type="button" onclick="this.parentNode.remove()" class="p-2 text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
  `;
  container.appendChild(div);
}

function addSketchImageInput(value = "") {
  const container = document.getElementById("sketchImagesContainer");
  const div = document.createElement("div");
  div.className = "flex space-x-2";
  div.innerHTML = `
    <input type="url" name="sketchImages[]" value="${value}" placeholder="https://example.com/sketch.jpg" class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
    <button type="button" onclick="this.parentNode.remove()" class="p-2  class="p-2 text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
  `;
  container.appendChild(div);
}

let specCount = 0;
function addSpecInput(value = "") {
  if (specCount < 6) {
    specCount++;
    const container = document.getElementById("specsContainer");
    const div = document.createElement("div");
    div.className = "flex space-x-2";
    div.innerHTML = `
      <input type="text" name="specifications[]" value="${value}" placeholder="Specification ${specCount}" class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
      <button type="button" onclick="this.parentNode.remove(); specCount--;" class="p-2 text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
  }
}

// Delete Functions (Brand, Category, Product)
let brandToDelete = null;
function confirmDeleteBrand(id) {
  brandToDelete = id;
  document.getElementById("confirmDeleteBrandModal").classList.remove("hidden");
}

function closeDeleteBrandModal() {
  document.getElementById("confirmDeleteBrandModal").classList.add("hidden");
  brandToDelete = null;
}

async function deleteBrand() {
  if (!brandToDelete) return;
  try {
    const response = await fetch(`/admin/brands/${brandToDelete}`, {
      method: "DELETE",
    });
    if (response.ok) {
      closeDeleteBrandModal();
      location.reload();
    } else {
      alert("Error deleting brand");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting brand");
  }
}

let categoryToDelete = null;
function confirmDeleteCategory(id) {
  categoryToDelete = id;
  document
    .getElementById("confirmDeleteCategoryModal")
    .classList.remove("hidden");
}

function closeDeleteCategoryModal() {
  document.getElementById("confirmDeleteCategoryModal").classList.add("hidden");
  categoryToDelete = null;
}

async function deleteCategory() {
  if (!categoryToDelete) return;
  try {
    const response = await fetch(`/admin/categories/${categoryToDelete}`, {
      method: "DELETE",
    });
    if (response.ok) {
      closeDeleteCategoryModal();
      location.reload();
    } else {
      alert("Error deleting category");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting category");
  }
}

let productToDelete = null;
function confirmDeleteProduct(id) {
  productToDelete = id;
  document
    .getElementById("confirmDeleteProductModal")
    .classList.remove("hidden");
}

function closeDeleteProductModal() {
  document.getElementById("confirmDeleteProductModal").classList.add("hidden");
  productToDelete = null;
}

async function deleteProduct() {
  if (!productToDelete) return;
  try {
    const response = await fetch(`/admin/products/${productToDelete}`, {
      method: "DELETE",
    });
    if (response.ok) {
      closeDeleteProductModal();
      location.reload();
    } else {
      alert("Error deleting product");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting product");
  }
}
