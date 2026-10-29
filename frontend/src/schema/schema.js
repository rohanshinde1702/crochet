/**
 * @file schema.js
 * @description Centralized data schema specifications and type models for the CozyLoops template.
 * These schemas define the data structures for Products, Categories, Blogs, Orders, Customers, and Settings.
 */

/**
 * @typedef {Object} Product
 * @property {number|string} id - Unique product identifier
 * @property {string} title - Name / title of the handcrafted creation
 * @property {string} category - Category name (e.g., "Decor & Gifts", "Pet & Animal", etc.)
 * @property {number} price - Selling price in INR / local currency
 * @property {number} [originalPrice] - Original / strikethrough price for discounts
 * @property {string} img - Primary thumbnail image URL (/uploads/...)
 * @property {string[]} [images] - Additional product gallery images
 * @property {number} rating - Average star rating (1.0 to 5.0)
 * @property {number} reviewsCount - Total count of verified customer reviews
 * @property {string} [badge] - Optional badge tag ("Bestseller", "Top Rated", "Trending", "New Arrival")
 * @property {string} material - Yarn / fiber composition description
 * @property {string} description - Detailed product story and artisan craftsmanship description
 * @property {string[]} [tags] - Search and filter tags
 * @property {boolean} inStock - Stock availability flag
 * @property {number} [stockQuantity] - Available inventory count
 * @property {string} [dimensions] - Physical item dimensions (e.g., "15cm x 10cm")
 * @property {string} [careInstructions] - Washing and preservation guide
 * @property {boolean} [featured] - Highlight on home page slider
 * @property {boolean} [isDeleted] - Soft-delete status for recycle bin
 */

/**
 * @typedef {Object} Category
 * @property {string} name - Display category name
 * @property {string} slug - URL friendly slug identifier
 * @property {string} icon - Emoji or SVG icon identifier
 * @property {string} description - Brief summary of the category collection
 * @property {string} image - Representative banner/thumbnail image URL
 * @property {boolean} featured - Display in featured categories grid
 * @property {number} displayOrder - Sorting priority in navigation
 * @property {boolean} [isDeleted] - Soft-delete status
 */

/**
 * @typedef {Object} BlogContentBlock
 * @property {"paragraph"|"heading"|"quote"|"tip"|"image"} type - Type of content block
 * @property {string} [text] - Text content for paragraph, heading, quote, or tip
 * @property {string} [title] - Title for callout tips
 * @property {string} [url] - Image URL if block type is image
 * @property {string} [caption] - Image caption
 */

/**
 * @typedef {Object} BlogAuthor
 * @property {string} name - Author full name
 * @property {string} role - Craft title or studio role
 * @property {string} avatar - Author photo / avatar URL
 */

/**
 * @typedef {Object} BlogComment
 * @property {number|string} id - Unique comment ID
 * @property {string} name - Commenter name
 * @property {string} date - Formatted date string
 * @property {string} avatar - User avatar URL
 * @property {string} text - Comment message body
 */

/**
 * @typedef {Object} Blog
 * @property {number|string} id - Unique blog post ID
 * @property {string} slug - SEO-friendly URL slug
 * @property {string} category - Blog category tag ("Yarn 101", "Crochet Guides", "Care & Tips", etc.)
 * @property {string} title - Full article headline
 * @property {string} readTime - Estimated reading time (e.g., "6 min read")
 * @property {number} readMinutes - Numeric minutes to read
 * @property {string} date - Formatted publication date
 * @property {string} isoDate - ISO 8601 date string
 * @property {boolean} featured - Highlight in hero/spotlight banner
 * @property {BlogAuthor} author - Author profile details
 * @property {string} img - Featured cover image URL
 * @property {string} excerpt - Short summary teaser
 * @property {string[]} tags - Topic tags
 * @property {number} likesCount - Social like counter
 * @property {number} commentsCount - Comment counter
 * @property {BlogContentBlock[]} content - Structured article content blocks
 * @property {BlogComment[]} comments - User comments stream
 * @property {boolean} [isDeleted] - Soft-delete status
 */

/**
 * @typedef {Object} OrderItem
 * @property {number|string} id - Product ID
 * @property {string} title - Product name
 * @property {string} category - Product category
 * @property {number} price - Unit price
 * @property {number} quantity - Quantity ordered
 * @property {string} img - Product image URL
 */

/**
 * @typedef {Object} Order
 * @property {string} orderId - Unique order tracking reference (e.g., "ORD-9821")
 * @property {Object} customer - Customer contact details (name, email, phone)
 * @property {Object} shippingAddress - Delivery address (street, city, state, postalCode, country)
 * @property {OrderItem[]} items - Ordered items array
 * @property {number} subtotal - Subtotal amount
 * @property {number} shippingFee - Shipping charge
 * @property {number} totalAmount - Final total amount
 * @property {string} paymentMethod - Payment method ("UPI", "Credit Card", "NetBanking", "COD")
 * @property {string} paymentStatus - Payment status ("Paid", "Pending", "Failed")
 * @property {"Processing"|"Shipped"|"Delivered"|"Pending"|"Cancelled"} status - Fulfillment status
 * @property {string} date - Order placement date
 * @property {string} [trackingNumber] - Courier tracking number
 * @property {string} [notes] - Delivery notes
 * @property {boolean} [isDeleted] - Soft-delete status
 */

/**
 * @typedef {Object} Customer
 * @property {string} id - Customer ID (e.g., "CUST-101")
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} phone - Mobile number
 * @property {number} orders - Total lifetime order count
 * @property {number} spent - Lifetime expenditure
 * @property {string} joined - Registration date
 * @property {string} [avatar] - Profile picture URL
 * @property {string} [status] - Customer status ("Active", "VIP", "Inactive")
 */

/**
 * @typedef {Object} StoreSettings
 * @property {string} storeName - Store brand title
 * @property {string} email - Support email address
 * @property {string} phone - Contact telephone number
 * @property {string} whatsapp - WhatsApp inquiry number
 * @property {string} address - Physical studio location
 * @property {string} businessHours - Studio working hours
 * @property {Object} socialLinks - Social network profile URLs
 * @property {number} freeShippingLimit - Minimum cart total for free delivery
 * @property {string} currency - Currency symbol & code
 * @property {boolean} maintenanceMode - Maintenance banner switch
 */

// Schema Shape Validator Helpers
export const validateProduct = (product) => {
  return Boolean(
    product &&
    typeof product.title === "string" &&
    product.title.trim().length > 0 &&
    typeof Number(product.price) === "number" &&
    !isNaN(Number(product.price))
  );
};

export const validateBlog = (blog) => {
  return Boolean(
    blog &&
    typeof blog.title === "string" &&
    blog.title.trim().length > 0
  );
};

export const validateCategory = (cat) => {
  return Boolean(
    cat &&
    typeof cat.name === "string" &&
    cat.name.trim().length > 0
  );
};
