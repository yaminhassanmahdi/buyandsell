import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const generateId = () => `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

// GET /api/banners - Get all banners
export async function GET() {
  try {
    const banners = await executeQuery(`
      SELECT id, image_url as imageUrl, image_hint as imageHint, title, description, 
             button_text as buttonText, button_link as buttonLink, bg_color as bgColor, 
             text_color as textColor, is_active as isActive, sort_order as sortOrder
      FROM hero_banner_slides ORDER BY sort_order ASC, id DESC
    `);
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// POST /api/banners - Add a new banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, imageHint, title, description, buttonText, buttonLink, bgColor, textColor, isActive, sortOrder } = body;
    
    const bannerId = generateId();
    
    await executeQuery(
      `INSERT INTO hero_banner_slides (id, image_url, image_hint, title, description, button_text, button_link, bg_color, text_color, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bannerId, imageUrl, imageHint, title, description, buttonText, buttonLink, bgColor, textColor, isActive ? 1 : 0, sortOrder || 0]
    );
    
    return NextResponse.json({ success: true, id: bannerId });
  } catch (error) {
    console.error('Error adding banner:', error);
    return NextResponse.json({ error: 'Failed to add banner' }, { status: 500 });
  }
}

// PUT /api/banners - Update a banner
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, imageUrl, imageHint, title, description, buttonText, buttonLink, bgColor, textColor, isActive, sortOrder } = body;
    
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });
    
    await executeQuery(
      `UPDATE hero_banner_slides SET image_url=?, image_hint=?, title=?, description=?, button_text=?, button_link=?, bg_color=?, text_color=?, is_active=?, sort_order=? WHERE id=?`,
      [imageUrl, imageHint, title, description, buttonText, buttonLink, bgColor, textColor, isActive ? 1 : 0, sortOrder || 0, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE /api/banners - Delete a banner
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });
    
    await executeQuery(`DELETE FROM hero_banner_slides WHERE id=?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
