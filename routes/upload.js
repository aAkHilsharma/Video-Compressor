/**
 * @swagger
 * tags:
 *   name: Video Upload
 *   description: API for uploading a video
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload and compress a video
 *     description: Uploads a video file, compresses it, and stores both original and compressed versions in S3.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: video
 *         type: file
 *         required: true
 *         description: The video file to upload and compress.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Video uploaded and compressed
 *                 reduced:
 *                   type: string
 *                   example: "50.00%"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Please upload a video file.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: An error occurred while processing your request.
 */

const util = require('util');
const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs')
const path = require('path');
const fsStat = util.promisify(fs.stat);
const fsMkdir = util.promisify(fs.mkdir);

const storage = multer.memoryStorage();
const upload = multer({ storage });
const {compressVideo} = require('../utils/compressVideo');

router.post('/', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No video file uploaded');
        }

        const videoFile = req.file;
        if (!videoFile.mimetype.startsWith('video/')) {
            throw new Error('Invalid file format. Only video files are allowed.');
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            await fsMkdir(tempDir);
        }

        const originalSize = videoFile.size;
        
        const baseFileName = videoFile.originalname.split('.')[0];
        const extension = videoFile.originalname.split('.').pop();

        const tempFilePath = path.join(tempDir, baseFileName);
        fs.writeFileSync(tempFilePath, videoFile.buffer);

        const compressedFilePath = `${tempFilePath}.mp4`;
        await compressVideo(tempFilePath, compressedFilePath);

        const compressedVideoBuffer = fs.readFileSync(compressedFilePath);

        const compressedSize = (await fsStat(compressedFilePath)).size;

        const sizeReductionPercentage = ((originalSize - compressedSize) / originalSize) * 100;

        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(compressedFilePath);

        const s3 = new AWS.S3();

        const originalKey = `original/${baseFileName}.${extension}`;
        const originalParams = {
            Bucket: process.env.s3_bucket,
            Key: originalKey,
            Body: videoFile.buffer,
        };

        await s3.upload(originalParams).promise();

        const compressedKey = `compressed/${baseFileName}.${extension}`;
        const compressedParams = {
            Bucket: process.env.s3_bucket,
            Key: compressedKey,
            Body: compressedVideoBuffer,
        };
        await s3.upload(compressedParams).promise();
        res.status(200).json({ success: true, message: 'Video uploaded and compressed', reduced: `${sizeReductionPercentage.toFixed(2)}%` });
    } catch (error) {
        console.error('Error uploading and compressing video:', error);
        let statusCode = 500;
        let errorMessage = 'An error occurred while processing your request.';

        if (error.message === 'No video file uploaded') {
            statusCode = 400;
            errorMessage = 'Please upload a video file.';
        } else if (error.message.startsWith('Invalid file format')) {
            statusCode = 400;
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

module.exports = router;