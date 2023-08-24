/**
 * @swagger
 * tags:
 *   name: Video Download
 *   description: API for fetching video download links
 */

/**
 * @swagger
 * /download/{filename}:
 *   get:
 *     summary: Get video download links
 *     description: Fetches download links for the original and/or compressed video.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the video
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
 *                   example: Videos fetched successfully! Click the links to download the video
 *                 compressed:
 *                   type: string
 *                   format: uri
 *                   example: https://s3.amazonaws.com/bucket-name/compressed/video.mp4
 *                 original:
 *                   type: string
 *                   format: uri
 *                   example: https://s3.amazonaws.com/bucket-name/original/video.mp4
 *       404:
 *         description: Video not found
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
 *                   example: Video not found
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
 *                   example: Failed to download video
 */

const router = require('express').Router();
const AWS = require('aws-sdk');

router.get('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const s3 = new AWS.S3();

        const compressedS3Params = {
            Bucket: process.env.s3_bucket,
            Key: `compressed/${filename}`,
        };

        const originalS3Params = {
            Bucket: process.env.s3_bucket,
            Key: `original/${filename}`,
        };

        const fileExists = await Promise.all([
            s3.headObject(compressedS3Params).promise().catch(() => null),
            s3.headObject(originalS3Params).promise().catch(() => null)
        ]);

        if (!fileExists[0] && !fileExists[1]) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        const response = {
            success: true,
            message: 'Videos fetched successfully! Click the links to download the video'
        };

        if (fileExists[0]) {
            response.compressed = s3.getSignedUrl('getObject', compressedS3Params);
        } else {
            response.message = 'Compressed video is not available. Click the link below to download the original video.';
            response.original = s3.getSignedUrl('getObject', originalS3Params);
        }

        if (fileExists[1]) {
            response.original = s3.getSignedUrl('getObject', originalS3Params);
        } else {
            response.message = 'Original video is not available. Click the link below to download the compressed video.';
            response.compressed = s3.getSignedUrl('getObject', compressedS3Params);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download video'
        });
    }
});

module.exports = router;