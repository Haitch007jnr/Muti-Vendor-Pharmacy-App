/**
 * Artillery processor for custom logic and data generation
 */

module.exports = {
  generateRandomEmail,
  generateRandomProduct,
  setAuthToken,
  logResponse,
};

/**
 * Generate random email for testing
 */
function generateRandomEmail(requestParams, context, ee, next) {
  context.vars.randomEmail = `test${Math.floor(Math.random() * 1000000)}@example.com`;
  return next();
}

/**
 * Generate random product data
 */
function generateRandomProduct(requestParams, context, ee, next) {
  const products = [
    'Paracetamol',
    'Ibuprofen',
    'Aspirin',
    'Amoxicillin',
    'Metformin',
    'Lisinopril',
    'Atorvastatin',
  ];
  
  context.vars.productName = products[Math.floor(Math.random() * products.length)];
  context.vars.productId = `product-${Math.floor(Math.random() * 1000)}`;
  context.vars.vendorId = `vendor-${Math.floor(Math.random() * 100)}`;
  
  return next();
}

/**
 * Set authentication token from response
 */
function setAuthToken(requestParams, response, context, ee, next) {
  if (response.body && response.body.data && response.body.data.accessToken) {
    context.vars.authToken = response.body.data.accessToken;
  }
  return next();
}

/**
 * Log response for debugging
 */
function logResponse(requestParams, response, context, ee, next) {
  if (process.env.DEBUG) {
    console.log('Response:', {
      statusCode: response.statusCode,
      body: response.body,
    });
  }
  return next();
}
