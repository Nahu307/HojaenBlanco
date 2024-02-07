const express = require('express');
const app = express();

// Mocking products
app.get('/mockingproducts', (req, res) => {
    const products = generateMockProducts(100);
    res.json(products);
});

// Custom error handler
function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
}

app.use(errorHandler);

// Function to generate mock products
function generateMockProducts(count) {
    const products = [];
    for (let i = 1; i <= count; i++) {
        const product = {
            _id: i.toString(), // Example _id format, could be ObjectId if using MongoDB
            name: `Product ${i}`,
            price: Math.floor(Math.random() * 100) + 1, // Random price between 1 and 100
            description: `Description of product ${i}`
            // Add more fields as needed
        };
        products.push(product);
    }
    return products;
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});