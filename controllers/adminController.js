// controllers/adminController.js
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getDashboard = async (req, res) => {
  try {
    const brandCount = await Brand.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    res.render("admin-dashboard", {
      activeSection: "dashboard",
      brandCount,
      categoryCount,
      productCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching dashboard data");
  }
};

exports.getBrands = async (req, res) => {
  const brands = await Brand.find();
  res.render("admin-dashboard", { activeSection: "brands", brands});
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching brand' });
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
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching category' });
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
    ? await Product.find({ category: { $in: categoryIds } }).populate("category")
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
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
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
  const logo = req.file ? "/uploads/" + req.file.filename : currentLogo;
  try {
    await Brand.findByIdAndUpdate(id, { name, description, logo, url });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating brand' });
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    await Brand.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting brand' });
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
  const image = req.file ? "/uploads/" + req.file.filename : currentImage;
  try {
    await Category.findByIdAndUpdate(id, { name, description, image, brand });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, category, specifications } = req.body;
  const featured = req.body.featured === 'on';
  const images = req.files['images']
    ? req.files['images'].map((file) => "/uploads/" + file.filename)
    : [];
  const sketchImages = req.files['sketchImages']
    ? req.files['sketchImages'].map((file) => "/uploads/" + file.filename)
    : [];
  const specs = specifications
    ? (Array.isArray(specifications) ? specifications : [specifications]).filter(spec => spec.trim() !== '')
    : [];
  try {
    const product = new Product({
      name,
      description,
      images,
      sketchImages,
      specifications: specs,
      category,
      featured
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
  const { name, description, category, specifications, currentImages, currentSketchImages } = req.body;
  const featured = req.body.featured === 'on';
  const images = req.files['images']
    ? req.files['images'].map(file => "/uploads/" + file.filename)
    : (currentImages ? (Array.isArray(currentImages) ? currentImages : [currentImages]) : []);
  const sketchImages = req.files['sketchImages']
    ? req.files['sketchImages'].map(file => "/uploads/" + file.filename)
    : (currentSketchImages ? (Array.isArray(currentSketchImages) ? currentSketchImages : [currentSketchImages]) : []);
  const specs = specifications
    ? (Array.isArray(specifications) ? specifications : [specifications]).filter(spec => spec.trim() !== '')
    : [];
  try {
    await Product.findByIdAndUpdate(id, { name, description, images, sketchImages, specifications: specs, category, featured });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting product' });
  }
};