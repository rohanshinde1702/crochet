const express = require("express");
const router = express.Router();
const { getContacts, submitContact } = require("../controllers/contactController");

router.get("/", getContacts);
router.post("/", submitContact);

module.exports = router;
