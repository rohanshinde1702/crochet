const Setting = require("../models/Setting");

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings (email, phone, address, social links, store name, etc.)
// @route   PUT /api/settings
// @access  Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    const {
      storeName,
      email,
      phone,
      whatsapp,
      address,
      businessHours,
      socialLinks,
      freeShippingLimit,
      currency,
      maintenanceMode
    } = req.body;

    if (storeName !== undefined) settings.storeName = storeName;
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (whatsapp !== undefined) settings.whatsapp = whatsapp;
    if (address !== undefined) settings.address = address;
    if (businessHours !== undefined) settings.businessHours = businessHours;
    if (freeShippingLimit !== undefined) settings.freeShippingLimit = Number(freeShippingLimit);
    if (currency !== undefined) settings.currency = currency;
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

    if (socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...socialLinks
      };
    }

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
