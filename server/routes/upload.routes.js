const express = require('express');
const router = express.Router();
const { uploadDocument } = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/', protect, upload.single('file'), uploadDocument);

module.exports = router;
