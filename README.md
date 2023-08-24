# Video Uploader and Compressor APIs

This repository contains Node.js APIs for uploading and downloading videos using Amazon S3 and Express.js. The project includes functionalities to compress videos before uploading and provide download links for original and compressed videos.

## Features

- Upload videos and compress them using the `/upload` API endpoint.
- Get download links for original and/or compressed videos using the `/download/{filename}` API endpoint.
- Swagger documentation for the APIs.

## Prerequisites

- Node.js and npm installed
- Amazon S3 account and credentials
- AWS EC2 instance

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
2. Install the dependencies:
   npm install
3. Set up your Amazon S3 credentials and environment variables. Create a .env file in the root directory with the following content:
   aws_access_key=YOUR_ACCESS_KEY
   aws_secret_key=YOUR_SECRET_KEY
   s3_bucket=YOUR_S3_BUCKET_NAME
4. Start the server:
   node index.js

## Usage

### Uploading and Compressing Videos

1. Visit the hosted application URL: [http://ec2-13-236-137-136.ap-southeast-2.compute.amazonaws.com:3000/](http://ec2-13-236-137-136.ap-southeast-2.compute.amazonaws.com:3000/)
2. Select a video file using the provided form.
3. Click the "Upload Video" button to initiate the upload and compression process.
4. Once uploaded, a "Download Videos" button will appear.
5. Click the "Download Videos" button to get download links for the original and/or compressed videos.

### Swagger Documentation

Access the Swagger UI documentation by visiting: [http://ec2-13-236-137-136.ap-southeast-2.compute.amazonaws.com:3000/api-docs](http://ec2-13-236-137-136.ap-southeast-2.compute.amazonaws.com:3000/api-docs)

## API Endpoints

- Upload API: `/upload`
- Download API: `/download/{filename}`
