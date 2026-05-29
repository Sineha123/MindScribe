// ─────────────────────────────────────────────────────────────
//  error.middleware.js
//  PURPOSE: Centralized error handling for the entire API.
//
//  How Express error middleware works:
//    - A middleware function with FOUR parameters (err, req, res, next)
//      is treated as an error handler by Express.
//    - When any route calls next(error), Express skips all normal
//      middleware and runs THIS function instead.
//    - We register it LAST in app.js (after all routes).
// ─────────────────────────────────────────────────────────────

/**
 * errorHandler
 * Global error middleware — catches all errors passed via next(err)
 *
 * @param {Error}    err  - The error object
 * @param {object}   req  - Express request
 * @param {object}   res  - Express response
 * @param {Function} next - Express next (required signature even if unused)
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Log the error server-side for debugging
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);

  // Determine status code
  //  400 Bad Request  → client sent bad input (validation errors)
  //  401 Unauthorized → invalid/missing API key
  //  500 Server Error → unexpected crash or upstream LLM error
  //  503 Service Unavailable → LLM provider overloaded/offline
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong. Please try again."
  });
}
