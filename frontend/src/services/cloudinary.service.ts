class CloudinaryService {
    private cloudName = 'dgmfu9gwy'; // Your Cloudinary cloud name
    private uploadPreset = 'ml_default'; // Default unsigned preset (if you haven't created a custom one)

    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary upload error:', errorData);
                throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    // Update configuration - call this with your credentials
    setConfig(cloudName: string, uploadPreset: string) {
        this.cloudName = cloudName;
        this.uploadPreset = uploadPreset;
        console.log('Cloudinary configured:', { cloudName, uploadPreset });
    }

    // Check if configured
    isConfigured(): boolean {
        return this.cloudName !== 'your-cloud-name' && this.uploadPreset !== 'your-upload-preset';
    }
}

export default new CloudinaryService();