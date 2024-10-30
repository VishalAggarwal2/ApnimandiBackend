const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const moment = require('moment');

// Load Google Sheets credentials
const credentials = require('../config/ google_credentials.json');

// Configure the JWT client
const client = new JWT({
  email: credentials.client_email,
  key: credentials.private_key.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheet ID and sheet names
const SPREADSHEET_ID = '1CF9ZBxHHWd7F9YXG9gILgbshsIdfykuFO-9-D0F_8zo';
const WASTE_MANAGEMENT_SHEET = 'WasteManagment';
const PRODUCT_MANAGEMENT_SHEET = 'ProductManagment';

// Add or Update Inventory
const addOrUpdateInventory = async (req, res) => {
  const {
    barcodeOrSKU,
    quantityPerCarton,
    noOfCarton,
    establishment,
    username,
    imagery,
    role,
    productName,
    vendorName,
    invoiceNumber,
    expiryDate,
    isProductLost // New Field
  } = req.body;


  console.log(req.body);
  var storeName ='Sunnyvale'; 
  if(establishment==1){
     storeName ='Sunnyvale'
          }else if(establishment==2){
     storeName = "Fremont"
}else if(establishment==3){
     storeName = "Milpitas";
          }else if(establishment==4){
     storeName = "Karthik";
          }else{
     storeName = "warehouse";
          }

  // Handle cases where noOfCarton is not provided
  const cartons = noOfCarton || 1;

  // Calculate the total quantity
  const quantity = quantityPerCarton * cartons||1;
  console.log(quantity);

  // Validate quantity
  if (isNaN(quantity)) {
    return res.status(400).json({ message: 'Invalid data type for quantity.' });
  }

  try {
    // Simulate product data lookup
    const product = { barcode: barcodeOrSKU, sku: 'tempSKU', productName: productName }; // Mock product for demo

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Get current date and time
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm');
    const c = quantity;
    console.log(c);

    // Prepare the row for Google Sheets, ensuring it has exactly 14 columns (A to N)


      const row = [
        currentDate,
        currentTime,
        username,
        vendorName,
        invoiceNumber,
        quantityPerCarton, // New Field: Quantity Per Carton
        isProductLost === 'on' ? 'TRUE' : 'FALSE',
        establishment,
        storeName,
        isNaN(barcodeOrSKU) ? product.sku : product.barcode,
        product.productName,
        quantity,
        expiryDate,
        imagery   ||"image"   ,
        'TRUE', // New Field: isProductLost
      ];
    

      // row for waste
      const row2=[
        currentDate,
        currentTime,
        barcodeOrSKU,productName,quantity,username,storeName
      ]
 

    // Select the correct sheet based on user role
    const sheetName = role === 'Waste Management' ? WASTE_MANAGEMENT_SHEET : PRODUCT_MANAGEMENT_SHEET;
    const range = role === 'Waste Management' ? `'${sheetName}'!A:G` : `'${sheetName}'!A:O`;
    const finalrow = role === 'Waste Management' ?row2 : row;
console.log(range);
console.log(sheetName);
    // Google Sheets logging
    const sheets = google.sheets({ version: 'v4', auth: client });
    const data =  await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,  // Force the range to A:N
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [finalrow],
      },
    });


    res.status(200).json({ message: 'Inventory added to Google Sheets successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};









// geting last invoice product name added by user in the sheet of product management 

const lastProductadded = async (req, res) => {
  try {
    const { username } = req.body; // Extract the username from the request body
    console.log(username);
    if (!username) {
      return res.status(400).json({ message: 'Username is required.' });
    }

    // Initialize Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Fetch the entire ProductManagement sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${PRODUCT_MANAGEMENT_SHEET}'!A:O`, // Adjust range if needed
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No data found in the sheet.' });
    }

    // Find rows matching the given username and sort by date and time
    const userRows = rows
      .filter(row => row[2] === username) // Assuming username is in column C (index 2)
      .map(row => ({
        date: row[0],
        time: row[1],
        productName: row[10], // Assuming product name is in column K (index 10)
      }))
      .sort((a, b) => {
        const dateA = moment(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
        const dateB = moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
        return dateB - dateA; // Sort in descending order
      });

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'No records found for this user.' });
    }

    // Get the latest product entry for the user
    const lastProduct = userRows[0].productName;

    res.status(200).json({ message: 'Last product added retrieved successfully.', lastProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



module.exports = {
  addOrUpdateInventory,lastProductadded
};
