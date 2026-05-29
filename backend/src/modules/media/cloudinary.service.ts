import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);
  return {
    signature,
    timestamp,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    folder,
  };
}
