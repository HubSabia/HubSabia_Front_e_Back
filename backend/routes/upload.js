// backend/routes/upload.js - COMMONJS VERSION
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

const router = express.Router();

// Configurar Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  }
});

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rota de upload
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Iniciando upload no backend...');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem enviada.'
      });
    }

    console.log('📁 Arquivo recebido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Verificar configuração do Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Configuração do Cloudinary não encontrada no backend.'
      });
    }

    // Converter buffer para base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    console.log('☁️ Fazendo upload para Cloudinary...');

    // Fazer upload para Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'hub-sabia',
      upload_preset: 'hub-sabia-unsigned',
      resource_type: 'auto'
    });

    console.log('✅ Upload backend concluído:', result.secure_url);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('💥 ERRO NO BACKEND:', error);

    let errorMessage = 'Erro ao fazer upload da imagem.';

    if (error.message.includes('Configuração do Cloudinary')) {
      errorMessage = 'Configuração do Cloudinary incompleta no servidor.';
    } else if (error.message.includes('Upload preset')) {
      errorMessage = 'Preset de upload não configurado corretamente.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;