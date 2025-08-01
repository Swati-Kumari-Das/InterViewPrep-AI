import { API_PATHS } from './apiPaths';  // Fixed typo: APL_PATHS → API_PATHS
import axiosInstance from './axiosInstance';

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append image file to form data
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {  
            headers: {
                'Content-Type': 'multipart/form-data', // Set header for file upload
            },
        });
        return response.data; // Return response data
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error; // Re-throw error for handling
    }
};

export default uploadImage;