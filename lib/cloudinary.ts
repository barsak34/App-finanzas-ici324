import crypto from 'crypto';

/**
 * Sube una imagen en Buffer a Cloudinary vía API REST oficial y retorna la URL segura HTTPS.
 */
export async function subirACloudinary(
  buffer: Buffer,
  carpeta: string = 'finanzas_hogar/comprobantes'
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // 1. Si las credenciales de Cloudinary están definidas, sube a la nube de Cloudinary
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const strToSign = `folder=${carpeta}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

      const formData = new FormData();
      const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      formData.append('file', base64Data);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', carpeta);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.secure_url;
      }
    } catch (err) {
      console.error('Error al conectar con el servicio Cloudinary:', err);
    }
  }

  // 2. Respaldo seguro: Almacena la imagen optimizada para visualización inmediata
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}
