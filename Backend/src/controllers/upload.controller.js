import cloudinary from "../lib/cloudinary.js";

// Upload file to Cloudinary
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const fileExtension = file.mimetype.split('/')[1];

        // Determine resource type based on file type
        let resourceType = 'image';
        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
            resourceType = 'video'; // Cloudinary treats audio as video
        } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document') || file.mimetype.includes('word') || file.mimetype.includes('excel') || file.mimetype.includes('presentation')) {
            resourceType = 'auto'; // Let Cloudinary auto-detect
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: resourceType,
            folder: 'chat-attachments',
        });

        res.status(200).json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            mimeType: file.mimetype,
            originalName: file.originalname,
        });
    } catch (error) {
        console.log("Error in uploadFile controller:", error.message);
        res.status(500).json({ message: "File upload failed" });
    }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
    try {
        const { publicId } = req.body;

        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.log("Error in deleteFile controller:", error.message);
        res.status(500).json({ message: "File deletion failed" });
    }
};
