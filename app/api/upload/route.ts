import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // ✅ Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // ✅ Проверка размера файла (5MB максимум)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Путь для сохранения файла
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Создаем папку если не существует
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // URL для доступа к файлу
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url,
      fileName: file.name,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Error uploading file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}