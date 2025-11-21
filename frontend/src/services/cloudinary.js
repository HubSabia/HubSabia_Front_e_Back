const uploadToCloudinary = async (file) => {
  try {
    // Validar o arquivo
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
    }

    // Validar tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      throw new Error('A imagem deve ter menos de 10MB.');
    }

    // Preparar form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    // Fazer upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload falhou: ${response.status}`);
    }

    const data = await response.json();
    
    // Retornar URL segura da imagem
    return data.secure_url;

  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw new Error(error.message || 'Erro ao fazer upload da imagem');
  }
};

export { uploadToCloudinary };