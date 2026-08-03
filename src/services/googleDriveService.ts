// Service for Google Drive Database Storage & Synchronization for PAMUR App

export interface DatabaseBackup {
  users: any[];
  articles: any[];
  schedules: any[];
  appSettings: any;
  attendance: any[];
  backupDate: string;
  appVersion: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

const DRIVE_FOLDER_NAME = 'PAMUR_Database_App';
const DRIVE_BACKUP_FILENAME = 'pamur_database_master.json';

// Utility to upload/save JSON file to Google Drive via Access Token
export async function uploadToGoogleDrive(
  accessToken: string,
  dataPayload: DatabaseBackup,
  customFileName?: string
): Promise<{ success: boolean; fileId?: string; message: string }> {
  try {
    const fileName = customFileName || DRIVE_BACKUP_FILENAME;
    const fileContent = JSON.stringify(dataPayload, null, 2);

    // 1. Search for existing file in Drive to update, or create new
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false&fields=files(id, name)`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchRes.ok) {
      const errJson = await searchRes.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gagal mengakses Google Drive (${searchRes.status})`);
    }

    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

    const fileMetadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'Database Cadangan Aplikasi Portal PAMUR Indonesia',
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime';
    let method = 'POST';

    if (existingFile) {
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&fields=id,name,modifiedTime`;
      method = 'PATCH';
    }

    const uploadRes = await fetch(uploadUrl, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gagal mengunggah file ke Google Drive (${uploadRes.status})`);
    }

    const result = await uploadRes.json();
    return {
      success: true,
      fileId: result.id,
      message: `Database berhasil disimpan ke Google Drive (${fileName}) pada ${new Date().toLocaleTimeString('id-ID')}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan saat mengunggah ke Google Drive.',
    };
  }
}

// Utility to list backup files from Google Drive
export async function listGoogleDriveBackups(
  accessToken: string
): Promise<{ success: boolean; files?: DriveFileItem[]; message?: string }> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/json' and trashed=false&fields=files(id, name, createdTime, modifiedTime, size)&orderBy=modifiedTime desc`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal mengambil daftar file dari Google Drive (${res.status})`);
    }

    const data = await res.json();
    return {
      success: true,
      files: data.files || [],
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal memuat file dari Google Drive.',
    };
  }
}

// Utility to download and parse JSON database from Google Drive file ID
export async function downloadFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<{ success: boolean; data?: DatabaseBackup; message?: string }> {
  try {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh file cadangan dari Google Drive (${res.status})`);
    }

    const data: DatabaseBackup = await res.json();
    if (!data.users || !Array.isArray(data.users)) {
      throw new Error('Format file JSON dari Google Drive tidak valid atau rusak.');
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal mengunduh database dari Google Drive.',
    };
  }
}
