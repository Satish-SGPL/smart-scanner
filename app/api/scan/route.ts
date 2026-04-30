import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scanBusinessCard } from '@/lib/n8n'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { frontImage, backImage } = await request.json()
    if (!frontImage) return NextResponse.json({ error: 'Front image is required' }, { status: 400 })

    const compress = async (b64: string) => {
      const buf = Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      return sharp(buf)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
    }

    const front = await compress(frontImage)
    const back = backImage ? await compress(backImage) : undefined
    const data = await scanBusinessCard(front, back)

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scan failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
