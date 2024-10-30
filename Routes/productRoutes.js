const express = require('express');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const router = express.Router();
const Product = require('../Models/Product'); // Adjust the path to your Product model
const credentials = require('../config/ google_credentials.json'); // Path to your Google credentials file

// Set up Google Sheets API Client
const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'), // Handle newlines in the key
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheet ID
const SPREADSHEET_ID = '1CF9ZBxHHWd7F9YXG9gILgbshsIdfykuFO-9-D0F_8zo';

// Route to handle fetching product by barcode or SKU
router.post('/', async (req, res) => {
    const { barcode } = req.body;

    if (!barcode) {
        return res.status(400).json({ error: 'Barcode is required' });
    }

    try {
        let product;

        // Check if barcode is a number (treat it as barcode); otherwise, treat it as SKU
        if (!isNaN(barcode)) {
            product = await Product.findOne({ barcode: Number(barcode) });
        } else {
            product = await Product.findOne({ sku: barcode });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json(product); // Return product details
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
});

// Route to handle adding product details to Google Sheets
router.post('/submit-product', async (req, res) => {
    const { productName, sku, quantity, productCategory, productSubcategory } = req.body;

    if (!productName || !sku || !quantity || !productCategory || !productSubcategory) {
        return res.status(400).json({ error: 'Product Name, SKU, Quantity, Product Category, and Product Subcategory are required' });
    }

    try {
        // Create Google Sheets API instance
        const sheets = google.sheets({ version: 'v4', auth: client });

        // Prepare data to append to Google Sheets
        const values = [
            [productName, productCategory, productSubcategory, sku, quantity], // Add product details to Google Sheets
        ];

        const resource = {
            values,
        };

        // Append the product details to the sheet named "Count"
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Count!A:E', // Assuming columns A-E represent Name, Category, Subcategory, SKU, and Quantity
            valueInputOption: 'RAW',
            resource,
        });

        console.log(`${result.data.updates.updatedCells} cells appended.`);
        return res.status(200).json({ message: 'Product details successfully saved to Google Sheets' });
    } catch (error) {
        console.error('Error writing to Google Sheets:', error);
        return res.status(500).json({ error: 'Failed to write product details to Google Sheets' });
    }
});

router.post("/add-product", async (productDetails) => {
    console.log("called called called");
    const { productName, sku, barcode, quantity, productCategory, productSubcategory, expireDate } = productDetails;

    // Check for required fields
    if (!productName || !sku || !quantity || !productCategory || !productSubcategory) {
        throw new Error('Product Name, SKU, Quantity, Product Category, and Product Subcategory are required');
    }

    try {
        // Create a new product instance
        const newProduct = new Product({
            productName,
            sku,
            barcode: Number(barcode), // Ensure barcode is a number
            productCategory,
            productSubcategory,
            quantity,
            expireDate
        });

        // Save the product to the database
        const savedProduct = await newProduct.save();
        // Return the saved product and a success message
        return { savedProduct, message: 'Product added successfully ' };
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('An error occurred while adding the product');
        return { message: 'not added  ' };
    }
}
)
// Search endpoint
router.get('/search', async (req, res) => {
    const { query } = req.query; // Get the search query from URL

    if (!query) {
        return res.status(400).send({ error: 'Query parameter is required' });
    }

    try {
        // Perform a loose, non-case-sensitive search using regex
        const products = await Product.find({
            productName: { $regex: new RegExp(query, 'i') } // 'i' is directly passed into RegExp constructor
        }).limit(5).select('productName barcode sku');

        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found' });
        }

        res.json(products);

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send({ error: 'Server error while searching products' });
    }
});


router.get('/search2', async (req, res) => {
    const { query } = req.query; // Get the search query from URL

    if (!query) {
        return res.status(400).send({ error: 'Query parameter is required' });
    }

    try {
        // Perform a loose, non-case-sensitive search using regex
        const products = await Product.find({
            productName: { $regex: new RegExp(query, 'i') }, // 'i' is directly passed into RegExp constructor
            sku: { $ne: ""} // Add condition to ensure sku is not null
        }).limit(5).select('productName barcode sku');

        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found' });
        }

        res.json(products);

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send({ error: 'Server error while searching products' });
    }
});


module.exports = router;
