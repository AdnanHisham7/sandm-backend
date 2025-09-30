// controllers/adminController.js
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Visitor = require("../models/Visitor");
const path = require("path");
const fs = require("fs").promises;

exports.getDashboard = async (req, res) => {
  try {
    const brandCount = await Brand.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    const livoraVisitors = await Visitor.countDocuments({ brand: "livora" });
    const enenciaVisitors = await Visitor.countDocuments({ brand: "enencia" });
    const sifonVisitors = await Visitor.countDocuments({ brand: "sifon" });

    res.render("admin-dashboard", {
      activeSection: "dashboard",
      brandCount,
      categoryCount,
      productCount,
      livoraVisitors,
      enenciaVisitors,
      sifonVisitors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching dashboard data");
  }
};

exports.getBrands = async (req, res) => {
  const brands = await Brand.find();
  res.render("admin-dashboard", { activeSection: "brands", brands });
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: "Error fetching brand" });
  }
};

exports.getCategories = async (req, res) => {
  const brands = await Brand.find();
  const selectedBrand = req.query.brand;
  const categories = selectedBrand
    ? await Category.find({ brand: selectedBrand })
    : [];
  res.render("admin-dashboard", {
    activeSection: "categories",
    brands,
    selectedBrand,
    categories,
  });
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Error fetching category" });
  }
};

exports.getProducts = async (req, res) => {
  const brands = await Brand.find();
  const selectedBrand = req.query.brand || "";
  const categories = selectedBrand
    ? await Category.find({ brand: selectedBrand })
    : [];
  const categoryIds = categories.map((cat) => cat._id);
  const products = selectedBrand
    ? await Product.find({ category: { $in: categoryIds } }).populate(
        "category"
      )
    : [];
  res.render("admin-dashboard", {
    activeSection: "products",
    brands,
    selectedBrand,
    categories,
    products,
  });
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

exports.addBrand = async (req, res) => {
  const { name, description, url } = req.body;
  const logo = req.file ? "/uploads/" + req.file.filename : "";
  try {
    const brand = new Brand({ name, description, logo, url });
    await brand.save();
    res.redirect("/admin/brands");
  } catch (err) {
    res.status(500).send("Error adding brand");
  }
};

exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, description, currentLogo, url } = req.body;
  const newLogo = req.file ? "/uploads/" + req.file.filename : currentLogo;

  try {
    // Fetch the existing brand to compare logos
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Delete old logo if replaced or removed
    if (existingBrand.logo && newLogo !== existingBrand.logo) {
      const filePath = path.join(__dirname, "../public", existingBrand.logo);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    await Brand.findByIdAndUpdate(id, { name, description, logo: newLogo, url });
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating brand:", err);
    res.status(500).json({ error: "Error updating brand" });
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Delete associated logo from the server
    if (brand.logo) {
      const filePath = path.join(__dirname, "../public", brand.logo);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    await Brand.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting brand:", err);
    res.status(500).json({ error: "Error deleting brand" });
  }
};

exports.addCategory = async (req, res) => {
  const { name, description, brand } = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : "";
  try {
    const category = new Category({ name, description, image, brand });
    await category.save();
    res.redirect(`/admin/categories?brand=${brand}`);
  } catch (err) {
    res.status(500).send("Error adding category");
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, brand, currentImage } = req.body;
  const newImage = req.file ? "/uploads/" + req.file.filename : currentImage;

  try {
    // Fetch the existing category to compare images
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete old image if replaced or removed
    if (existingCategory.image && newImage !== existingCategory.image) {
      const filePath = path.join(__dirname, "../public", existingCategory.image);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    await Category.findByIdAndUpdate(id, { name, description, image: newImage, brand });
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Error updating category" });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete associated image from the server
    if (category.image) {
      const filePath = path.join(__dirname, "../public", category.image);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Error deleting category" });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, category, specifications } = req.body;
  const featured = req.body.featured === "on";
  const images = req.files["images"]
    ? req.files["images"].map((file) => "/uploads/" + file.filename)
    : [];
  const sketchImages = req.files["sketchImages"]
    ? req.files["sketchImages"].map((file) => "/uploads/" + file.filename)
    : [];
  const specs = specifications
    ? (Array.isArray(specifications)
        ? specifications
        : [specifications]
      ).filter((spec) => spec.trim() !== "")
    : [];
  try {
    const product = new Product({
      name,
      description,
      images,
      sketchImages,
      specifications: specs,
      category,
      featured,
    });
    await product.save();
    const cat = await Category.findById(category);
    res.redirect(`/admin/products?brand=${cat.brand}`);
  } catch (err) {
    res.status(500).send("Error adding product: " + err.message);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    specifications,
    currentImages,
    currentSketchImages,
  } = req.body;
  const featured = req.body.featured === "on";
  
  // Handle new images
  const newImages = req.files["images"]
    ? req.files["images"].map((file) => "/uploads/" + file.filename)
    : [];
  const newSketchImages = req.files["sketchImages"]
    ? req.files["sketchImages"].map((file) => "/uploads/" + file.filename)
    : [];
  
  // Handle existing images
  const images = currentImages
    ? Array.isArray(currentImages)
      ? currentImages
      : [currentImages]
    : [];
  const sketchImages = currentSketchImages
    ? Array.isArray(currentSketchImages)
      ? currentSketchImages
      : [currentSketchImages]
    : [];
  
  // Combine new and existing images
  const updatedImages = [...images, ...newImages];
  const updatedSketchImages = [...sketchImages, ...newSketchImages];
  
  // Handle specifications
  const specs = specifications
    ? (Array.isArray(specifications)
        ? specifications
        : [specifications]
      ).filter((spec) => spec.trim() !== "")
    : [];

  try {
    // Fetch the existing product to compare images
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Identify removed images
    const removedImages = existingProduct.images.filter(
      (img) => !updatedImages.includes(img)
    );
    const removedSketchImages = existingProduct.sketchImages.filter(
      (img) => !updatedSketchImages.includes(img)
    );

    // Delete removed images from the server
    for (const img of removedImages) {
      const filePath = path.join(__dirname, "../public", img);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }
    for (const img of removedSketchImages) {
      const filePath = path.join(__dirname, "../public", img);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    // Update the product
    await Product.findByIdAndUpdate(id, {
      name,
      description,
      images: updatedImages,
      sketchImages: updatedSketchImages,
      specifications: specs,
      category,
      featured,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete all associated images from the server
    for (const img of [...product.images, ...product.sketchImages]) {
      const filePath = path.join(__dirname, "../public", img);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Error deleting product" });
  }
};
