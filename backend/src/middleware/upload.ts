import multer from 'multer'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// 图片处理中间件 - 生成缩略图
export async function processImage(filename: string): Promise<{ image: string; thumbnail: string }> {
  const filePath = path.join(uploadDir, filename)
  const thumbnailName = `thumb_${filename}`
  const thumbnailPath = path.join(uploadDir, thumbnailName)
  
  await sharp(filePath)
    .resize(200, 200, { fit: 'cover' })
    .toFile(thumbnailPath)
  
  return {
    image: `/uploads/${filename}`,
    thumbnail: `/uploads/${thumbnailName}`
  }
}

export { upload }
