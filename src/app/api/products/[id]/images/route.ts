import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { z } from 'zod'

// Validation schema for image upload
const imageUploadSchema = z.object({
  alt_text: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
  order_index: z.number().int().min(0).optional().default(0)
})

// POST /api/products/[id]/images - Upload images for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = formData.get('metadata') as string
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      }, { status: 400 })
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      }, { status: 400 })
    }
    
    // Parse metadata if provided
    let imageMetadata: z.infer<typeof imageUploadSchema> = {
      is_primary: false,
      order_index: 0
    }
    if (metadata) {
      try {
        imageMetadata = imageUploadSchema.parse(JSON.parse(metadata))
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid metadata format'
        }, { status: 400 })
      }
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({
        success: false,
        error: 'Failed to upload image'
      }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)
    
    // If this is set as primary, update other images to not be primary
    if (imageMetadata.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }
    
    // Save image record to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: publicUrl,
        alt_text: imageMetadata.alt_text || file.name,
        is_primary: imageMetadata.is_primary || false,
        order_index: imageMetadata.order_index || 0
      })
      .select()
      .single()
    
    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('product-images')
        .remove([fileName])
      
      console.error('Database insert error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save image record'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: imageRecord
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading product image:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image'
    }, { status: 500 })
  }
}

// GET /api/products/[id]/images - Get all images for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Error fetching product images:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch images'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: images || []
    })
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch images'
    }, { status: 500 })
  }
}