import Pica from 'pica';

self.onmessage = async (event) => {
    const { file, targetWidth, targetHeight } = event.data;

    try {
        const imageBitmap = await createImageBitmap(file);

        const sourceCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const sourceCtx = sourceCanvas.getContext('2d');
        sourceCtx.drawImage(imageBitmap, 0, 0);

        const destCanvas = new OffscreenCanvas(targetWidth, targetHeight);

        const pica = new Pica({
            features: ['js', 'wasm'],
            createCanvas: (w, h) => new OffscreenCanvas(w, h)
        });

        await pica.resize(sourceCanvas, destCanvas);

        const resizedBlob = await destCanvas.convertToBlob({
            type: file.type || 'image/jpeg',
            quality: 0.9
        });

        self.postMessage({ success: true, blob: resizedBlob });

    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};