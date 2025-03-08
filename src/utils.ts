import joplin from 'api';

export class FolderUtils {

    static async getFolderById(folderId: string) {
        try {
            const folder = await joplin.data.get(['folders', folderId], { fields: ['id', 'title', 'parent_id'] });
            return folder;
        } catch (error) {
            console.error('Error fetching folder:', error);
            throw error;
        }
    }

    static async getFolderPath(folderId: string): Promise<string> {
        let path = '';
        let currentFolderId = folderId;

        while (currentFolderId) {
            const folder = await this.getFolderById(currentFolderId);
            path = `/${folder.title}${path}`;
            currentFolderId = folder.parent_id;
        }

        return path;
    }
}