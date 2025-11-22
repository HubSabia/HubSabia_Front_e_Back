const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Multer para memória (não salva no disco)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ROTA: Upload de imagem
router.post('/upload-image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Nenhum arquivo foi enviado.' });
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        msg: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.' 
      });
    }

    // Upload para Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'campanhas',
          resource_type: 'image',
          transformation: [
            { width: 1200, crop: 'limit' }, // Limita largura máxima
            { quality: 'auto:good' }, // Compressão automática
            { fetch_format: 'auto' } // Formato otimizado
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Retorna a URL da imagem
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      msg: 'Erro ao fazer upload da imagem.',
      error: error.message 
    });
  }
});

module.exports = router;