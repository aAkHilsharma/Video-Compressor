const ffmpeg = require('fluent-ffmpeg');

function compressVideo(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .videoCodec('libx264')
            .addOption('-crf', '28')
            .on('end', () => resolve())
            .on('error', error => reject(error))
            .save(outputFilePath);
    });
}

module.exports = { compressVideo };