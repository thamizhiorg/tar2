import { S3Client, PutObjectCommand, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as FileSystem from 'expo-file-system';

// Updated storage configuration with correct endpoint
const config = {
  region: "auto",
  endpoint: "https://f6d1d15e6f0b37b4b8fcad3c41a7922d.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "c3827ec3b7fb19b6c35168478440a8c6",
    secretAccessKey: "8e6d899be792b0bee11201a6c9f6f83f865f2fce9f1ca2c3ff172ad35b5759e2"
  },
  forcePathStyle: true
};

const BUCKET_NAME = "tarapp-pqdhr";
const s3Client = new S3Client(config);

/**
 * List all buckets in the S3/R2 account
 * @returns Promise containing array of bucket information
 */
export const listBuckets = async () => {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return response.Buckets;
  } catch (error) {
    console.error("Error listing buckets", error);
    throw error;
  }
};

/**
 * List objects in a bucket with optional prefix
 * @param prefix Optional prefix filter for objects (folder-like filtering)
 * @param maxKeys Maximum number of keys to return
 * @returns Promise containing array of object information
 */
export const listObjects = async (prefix?: string, maxKeys: number = 1000) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys
    });
    
    const response = await s3Client.send(command);
    return response.Contents;
  } catch (error) {
    console.error("Error listing objects", error);
    throw error;
  }
};

/**
 * Get a presigned URL for downloading/viewing an object
 * @param key The key (path) of the object in the bucket
 * @param expiresIn Expiration time in seconds (default: 3600 - 1 hour)
 * @returns Promise containing the presigned URL
 */
export const getPresignedDownloadUrl = async (key: string, expiresIn: number = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned download URL", error);
    throw error;
  }
};

/**
 * Download an object from the bucket
 * @param key The key (path) of the object in the bucket
 * @param localFilePath The local file path to save the object to
 * @returns Promise resolving when download is complete
 */
export const downloadObject = async (key: string, localFilePath: string) => {
  try {
    // Get a presigned URL for the object
    const downloadUrl = await getPresignedDownloadUrl(key);
    
    // Download the file using Expo FileSystem
    const downloadResult = await FileSystem.downloadAsync(
      downloadUrl,
      localFilePath
    );
    
    return downloadResult;
  } catch (error) {
    console.error("Error downloading object", error);
    throw error;
  }
};

/**
 * Generate a pre-signed URL for uploading a file
 * @param fileName The name of the file to upload
 * @param contentType The content type of the file (e.g. image/jpeg)
 * @param expiresIn Expiration time in seconds (default: 3600)
 */
export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string = 'image/jpeg',
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error creating presigned URL", error);
    throw error;
  }
};

/**
 * Upload a file to R2 using a presigned URL
 * @param fileUri The local URI of the file to upload
 * @param presignedUrl The presigned URL for uploading
 * @param contentType The content type of the file
 */
export const uploadFileWithPresignedUrl = async (
  fileUri: string,
  presignedUrl: string,
  contentType: string = 'image/jpeg'
): Promise<boolean> => {
  try {
    const response = await FileSystem.uploadAsync(presignedUrl, fileUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': contentType
      }
    });
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("Error uploading file", error);
    throw error;
  }
};

/**
 * Generate a public URL for a file in the storage bucket
 * @param fileName The name of the file
 */
export const getPublicUrl = (fileName: string): string => {
  return `https://tarapp-pqdhr.sevalla.storage/${fileName}`;
};

/**
 * Generate a unique filename with timestamp and random string
 * @param originalFilename The original filename
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop();
  
  return `products/${timestamp}-${randomString}.${extension}`;
};