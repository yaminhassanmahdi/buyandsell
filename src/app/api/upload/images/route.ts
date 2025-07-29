import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;

      // Create uploads directory structure
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
      
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, which is fine
      }

      // Write file
      const filePath = join(uploadsDir, filename);
      await writeFile(filePath, buffer);

      // Return the public URL path
      const publicUrl = `/uploads/images/${filename}`;
      uploadedFiles.push({
        filename: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
} 