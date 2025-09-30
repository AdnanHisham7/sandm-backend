const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Visitor = require("../models/Visitor");

exports.getCategoriesByBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({
      name: new RegExp(`^${req.params.brandName}$`, "i"),
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const categories = await Category.find({ brand: brand._id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({
      name: new RegExp(`^${req.params.brandName}$`, "i"),
    });
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const categories = await Category.find({ brand: brand._id });
    const categoryIds = categories.map((cat) => cat._id);
    let query = { category: { $in: categoryIds } };

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.featured === "true") {
      query.featured = true;
    }

    const products = await Product.find(query).populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "category"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.trackVisitors = async (req, res) => {
  console.log("Trackng a VISIR=TORRRRRRRRRRRRRRRRR")
  const { brand, visitorId } = req.body;

  if (!brand || !["livora", "enencia", "sifon"].includes(brand)) {
    return res.status(400).send("Invalid brand.");
  }

  if (!visitorId) {
    return res.status(400).send("Missing visitorId.");
  }

  try {
    const existingVisitor = await Visitor.findOne({ visitorId, brand });

    if (existingVisitor) {
      return res.status(200).send("Visitor already tracked.");
    }

    const newVisitor = new Visitor({ brand, visitorId });
    await newVisitor.save();
    res.status(201).send("Visitor tracked successfully.");
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).send("Server error.");
  }
};
