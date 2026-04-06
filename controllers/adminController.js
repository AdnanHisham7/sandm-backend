// controllers/adminController.js
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Visitor = require("../models/Visitor");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

const uploadImages = async (files) => {
  const results = await Promise.all(
    files.map((file) => uploadToCloudinary(file)),
  );

  return results.map((r) => ({
    url: r.secure_url,
    public_id: r.public_id,
  }));
};

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
        "category",
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

  let logo = "";
  let logoPublicId = "";

  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    logo = result.secure_url;
    logoPublicId = result.public_id;
  }

  try {
    const brand = new Brand({
      name,
      description,
      url,
      logo,
      logoPublicId,
    });

    await brand.save();
    res.redirect("/admin/brands");
  } catch (err) {
    res.status(500).send("Error adding brand");
  }
};

exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, description, currentLogo, url } = req.body;

  try {
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    let logo = currentLogo;
    let logoPublicId = existingBrand.logoPublicId;

    if (req.file) {
      // delete old
      if (existingBrand.logoPublicId) {
        await cloudinary.uploader.destroy(existingBrand.logoPublicId);
      }

      // upload new
      const result = await uploadToCloudinary(req.file);

      logo = result.secure_url;
      logoPublicId = result.public_id;
    }

    await Brand.findByIdAndUpdate(id, {
      name,
      description,
      logo,
      logoPublicId,
      url,
    });
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
    if (brand.logoPublicId) {
      await cloudinary.uploader.destroy(brand.logoPublicId);
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
  let image = "";
  let imagePublicId = "";

  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    image = result.secure_url;
    imagePublicId = result.public_id;
  }
  try {
    const category = new Category({
      name,
      description,
      image,
      imagePublicId,
      brand,
    });
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

    let image = currentImage;
    let imagePublicId = existingCategory.imagePublicId;

    if (req.file) {
      if (existingCategory.imagePublicId) {
        await cloudinary.uploader.destroy(existingCategory.imagePublicId);
      }

      const result = await uploadToCloudinary(req.file);

      image = result.secure_url;
      imagePublicId = result.public_id;
    }

    await Category.findByIdAndUpdate(id, {
      name,
      description,
      image,
      imagePublicId,
      brand,
    });
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
    if (category.imagePublicId) {
      await cloudinary.uploader.destroy(category.imagePublicId);
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
  const images = req.files?.images ? await uploadImages(req.files.images) : [];

  const sketchImages = req.files?.sketchImages
    ? await uploadImages(req.files.sketchImages)
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
    ? await uploadImages(req.files["images"])
    : [];

  const newSketchImages = req.files["sketchImages"]
    ? await uploadImages(req.files["sketchImages"])
    : [];

  // Handle existing images
  const images = currentImages
    ? Array.isArray(currentImages)
      ? currentImages.map((img) =>
          typeof img === "string" ? JSON.parse(img) : img,
        )
      : [JSON.parse(currentImages)]
    : [];
  const sketchImages = currentSketchImages
    ? Array.isArray(currentSketchImages)
      ? currentSketchImages.map((img) =>
          typeof img === "string" ? JSON.parse(img) : img,
        )
      : [JSON.parse(currentSketchImages)]
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
      (img) => !updatedImages.some((i) => i.public_id === img.public_id),
    );
    const removedSketchImages = existingProduct.sketchImages.filter(
      (img) => !updatedSketchImages.some((i) => i.public_id === img.public_id),
    );

    // Delete removed images from the server
    for (const img of removedImages) {
      await cloudinary.uploader.destroy(img.public_id);
    }
    for (const img of removedSketchImages) {
      await cloudinary.uploader.destroy(img.public_id);
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
      await cloudinary.uploader.destroy(img.public_id);
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Error deleting product" });
  }
};
