const CALIDAD_JPEG = 0.85;

/**
 * Recorta una imagen al cuadrado central ("cover", sin deformar) y la
 * reescala a `tamanoSalida` px, para que quede bien dentro de la máscara
 * circular de TarjetaJugador. Devuelve un data URL JPEG listo para guardar.
 */
export function recortarImagenCircularABase64(archivo: File, tamanoSalida = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    lector.onload = () => {
      const imagen = new Image();
      imagen.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));
      imagen.onload = () => {
        const lado = Math.min(imagen.naturalWidth, imagen.naturalHeight);
        const origenX = (imagen.naturalWidth - lado) / 2;
        const origenY = (imagen.naturalHeight - lado) / 2;
        const lienzo = document.createElement('canvas');
        lienzo.width = tamanoSalida;
        lienzo.height = tamanoSalida;
        const ctx = lienzo.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }
        ctx.drawImage(imagen, origenX, origenY, lado, lado, 0, 0, tamanoSalida, tamanoSalida);
        resolve(lienzo.toDataURL('image/jpeg', CALIDAD_JPEG));
      };
      imagen.src = String(lector.result);
    };
    lector.readAsDataURL(archivo);
  });
}
