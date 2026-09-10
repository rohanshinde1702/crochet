/**
 * @file orders.js
 * @description Master orders dataset for order tracking, fulfillment, and admin hub.
 */

export const ordersData = [
  {
    orderId: "ORD-9821",
    customer: {
      name: "Aarav Sharma",
      email: "aarav.s@gmail.com",
      phone: "+91 98201 44521"
    },
    shippingAddress: {
      street: "Flat 402, Sea View Towers, Worli",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400018",
      country: "India"
    },
    items: [
      {
        id: 2,
        title: "Radiant Sunshine Sunflower Stem",
        category: "Decor & Gifts",
        price: 399,
        quantity: 2,
        img: "/uploads/products/decor/sunflower.png"
      },
      {
        id: 4,
        title: "Boho Floral Table Mat & Coaster",
        category: "Home & Living",
        price: 899,
        quantity: 1,
        img: "/uploads/products/home/category-1.png"
      }
    ],
    subtotal: 1697,
    shippingFee: 0,
    totalAmount: 1697,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "Delivered",
    date: "May 25, 2026",
    trackingNumber: "DTDC-98124971",
    notes: "Please leave package with building security.",
    isDeleted: false
  },
  {
    orderId: "ORD-9820",
    customer: {
      name: "Priya Patel",
      email: "priya.p@outlook.com",
      phone: "+91 97654 32109"
    },
    shippingAddress: {
      street: "15 Golden Palms, Satellite",
      city: "Ahmedabad",
      state: "Gujarat",
      postalCode: "380015",
      country: "India"
    },
    items: [
      {
        id: 3,
        title: "Cozy Crochet Chick Plushie",
        category: "Pet & Animal",
        price: 499,
        quantity: 1,
        img: "/uploads/products/pet/category-1.png"
      }
    ],
    subtotal: 499,
    shippingFee: 0,
    totalAmount: 499,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Processing",
    date: "May 24, 2026",
    trackingNumber: "BLUEDART-8829104",
    notes: "Gift wrap requested.",
    isDeleted: false
  },
  {
    orderId: "ORD-9819",
    customer: {
      name: "Ananya Iyer",
      email: "ananya.iyer@gmail.com",
      phone: "+91 99887 76655"
    },
    shippingAddress: {
      street: "77 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India"
    },
    items: [
      {
        id: 1,
        title: "Handmade Baby Booties & Socks",
        category: "Kids & Baby",
        price: 199,
        quantity: 2,
        img: "/uploads/products/kids/category-1.png"
      }
    ],
    subtotal: 398,
    shippingFee: 0,
    totalAmount: 398,
    paymentMethod: "NetBanking",
    paymentStatus: "Paid",
    status: "Delivered",
    date: "May 24, 2026",
    trackingNumber: "DELHIVERY-7712390",
    notes: "Fragile items.",
    isDeleted: false
  },
  {
    orderId: "ORD-9818",
    customer: {
      name: "Vikram Malhotra",
      email: "vikram.m@yahoo.com",
      phone: "+91 98112 33445"
    },
    shippingAddress: {
      street: "B-12 Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110057",
      country: "India"
    },
    items: [
      {
        id: 5,
        title: "Custom Monogram Letter Keychain",
        category: "Personalized",
        price: 249,
        quantity: 4,
        img: "/uploads/products/custom/category-1.png"
      },
      {
        id: 11,
        title: "Cornus Florida Blossom Stem",
        category: "Decor & Gifts",
        price: 349,
        quantity: 1,
        img: "/uploads/products/decor/Cornus florida.png"
      }
    ],
    subtotal: 1345,
    shippingFee: 0,
    totalAmount: 1345,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "Shipped",
    date: "May 23, 2026",
    trackingNumber: "EKART-6623910",
    notes: "Deliver before 5 PM.",
    isDeleted: false
  },
  {
    orderId: "ORD-9817",
    customer: {
      name: "Sneha Roy",
      email: "sneha.roy@gmail.com",
      phone: "+91 91234 56789"
    },
    shippingAddress: {
      street: "24 Park Street, Flat 3B",
      city: "Kolkata",
      state: "West Bengal",
      postalCode: "700016",
      country: "India"
    },
    items: [
      {
        id: 5,
        title: "Custom Monogram Letter Keychain",
        category: "Personalized",
        price: 249,
        quantity: 1,
        img: "/uploads/products/custom/category-1.png"
      }
    ],
    subtotal: 249,
    shippingFee: 0,
    totalAmount: 249,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    status: "Pending",
    date: "May 22, 2026",
    trackingNumber: "",
    notes: "Cash on delivery.",
    isDeleted: false
  }
];

export default ordersData;
