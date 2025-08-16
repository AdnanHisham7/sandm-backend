const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getIndex = async (req, res) => {
  const brands = await Brand.find();
  console.log(brands)
  res.render("index", { brands });
};

exports.getProductsPage = async (req, res) => {
  const brandName = req.params.brand;
  const brand = await Brand.findOne({
    name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
  });
  if (!brand) {
    return res.status(404).send("Brandsasa not found");
  }
  const categories = await Category.find({ brand: brand._id });
  const productsPromises = categories.map((category) =>
    Product.find({ category: category._id }).limit(10)
  );
  const productsArrays = await Promise.all(productsPromises);
  const categoriesWithProducts = categories.map((category, index) => ({
    category,
    products: productsArrays[index],
  }));
  res.render(`${brand.name.toLowerCase()}/products`, { brand, categoriesWithProducts, categories });
};

exports.getBrandPage = async (req, res) => {
  const brandName = req.params.brand;
  const brand = await Brand.findOne({
    name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
  });
  if (!brand) {
    return res.status(404).send("Brand not found");
  }
  const categories = await Category.find({ brand: brand._id });
  const products = await Product.find({
    category: { $in: categories.map((c) => c._id) },
  }).populate("category");

  const productsByCategory = categories.map((category) => {
    const catProducts = products
      .filter((p) => p.category._id.toString() === category._id.toString())
      .slice(0, 10);
    return { category, products: catProducts };
  });

  res.render(`${brandName}`, { brand, categories, productsByCategory });
};

exports.getCategoryPage = async (req, res) => {
  const brandName = req.params.brand;
  const categoryId = req.params.categoryId;
  const brand = await Brand.findOne({
    name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
  });
  if (!brand) {
    return res.status(404).send("Brand not found");
  }
  const category = await Category.findOne({
    _id: categoryId,
    brand: brand._id,
  }).populate("brand");
  if (!category) {
    return res.status(404).send("Category not found");
  }
  const products = await Product.find({ category: categoryId });
  const categories = await Category.find({ brand: brand._id });
  res.render(`${brand.name.toLowerCase()}/category`, {
    category,
    products,
    categories,
    brand,
  });
};

exports.getProductPage = async (req, res) => {
  const brandName = req.params.brand;
  const productId = req.params.productId;
  const brand = await Brand.findOne({
    name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
  });
  if (!brand) {
    return res.status(404).send("Brand not found");
  }
  const product = await Product.findOne({ _id: productId }).populate({
    path: "category",
    populate: { path: "brand" },
  });
  if (
    !product ||
    product.category.brand._id.toString() !== brand._id.toString()
  ) {
    return res.status(404).send("Product not found");
  }
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
  }).limit(4);
  const showSketches = 0
  const currentImageIndex  = 0
  res.render(`${brand.name.toLowerCase()}/product`, { product, relatedProducts, brand, showSketches, currentImageIndex   });
};
