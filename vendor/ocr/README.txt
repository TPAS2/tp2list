Text recognition from pictures (OCR) for the taxi section, bundled so it works offline and nothing is fetched from the internet.
  tesseract.min.js, worker.min.js        tesseract.js 5.1.1 (Apache-2.0)            npm: tesseract.js
  tesseract-core-simd-lstm.wasm.js       tesseract.js-core 5.1.1 (Apache-2.0)       npm: tesseract.js-core   (WebAssembly with SIMD); tesseract-core-lstm.wasm.js is the fallback for browsers without SIMD
  eng.traineddata.gz                     English model, tessdata_best (int)  (Apache-2.0)   npm: @tesseract.js-data/eng
Loaded on demand by ocrReadPicture() in index.html; the picture itself is never stored.
