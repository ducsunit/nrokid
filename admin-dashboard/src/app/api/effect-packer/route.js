import { NextResponse } from 'next/server';

/**
 * NRO Effect Binary Packer
 * Chuyển đổi từ file JSON dễ đọc sang file nhị phân (DataEffect)
 * Định dạng chuẩn theo EffectData.java của NRO
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const version = data.version || 220; // Default version > 220 uses Short for coordinates

    // Validate
    if (!data.sprites || !data.frames || !data.animations) {
      return NextResponse.json({ error: 'Missing sprites, frames, or animations' }, { status: 400 });
    }

    // Allocate a large buffer, we will slice it later
    const buffer = Buffer.alloc(1024 * 50); // 50KB max for an effect should be plenty
    let offset = 0;

    // Helper to safely write bytes (Java byte is signed, Node buffer handles writeUInt8 better for values > 127)
    const writeByte = (val) => {
      buffer.writeUInt8(val & 0xFF, offset);
      offset += 1;
    };
    const writeShort = (val) => {
      buffer.writeInt16BE(val, offset);
      offset += 2;
    };

    const type = data.type || 0;

    // 1. Write Sprites
    writeByte(data.sprites.length);

    data.sprites.forEach(sprite => {
      writeByte(sprite.id);

      // Follow server logic: if type is 0 or 1, or version < 220, use Byte
      if (type === 0 || type === 1 || version < 220) {
        writeByte(sprite.x);
        writeShort(sprite.y);
      } else {
        writeShort(sprite.x);
        writeShort(sprite.y);
      }

      writeByte(sprite.w);
      writeByte(sprite.h);
    });

    // 2. Write Frames
    writeShort(data.frames.length);

    data.frames.forEach(frameArr => {
      writeByte(frameArr.length);

      frameArr.forEach(element => {
        writeShort(element.dx);
        writeShort(element.dy);
        writeByte(element.spriteId);
      });
    });

    // 3. Write Animations
    writeShort(data.animations.length);

    data.animations.forEach(animIndex => {
      writeShort(animIndex);
    });

    // Slice buffer to actual size
    const finalBuffer = buffer.slice(0, offset);

    // Return as a downloadable binary file
    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="DataEffect_Custom"',
      },
    });
  } catch (error) {
    console.error('Packer Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
