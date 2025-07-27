import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { z } from 'zod'

// Validation schema for image updates
const updateImageSchema = z.object({
  alt_text: z.string().optional(),
  is_primary: z.boolean().optional(),
  order_index: z.number().int().min(0).optional()
})

// PUT /api/products/[id]/images/[imageId] - Update image metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: productId, imageId } = await params
    
    if (!productId || !imageId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID or image ID'
      }, { status: 400 })
    }
    
    const body = await request.json()
    const validatedData = updateImageSchema.parse(body)
    
    // If setting as primary, update other images to not be primary
    if (validatedData.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .neq('id', imageId)
    }
    
    // Update the image
    const { data: updatedImage, error } = await supabase
      .from('product_images')
      .update(validatedData)
      .eq('id', imageId)
      .eq('product_id', productId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating image:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update image'
      }, { status: 500 })
    }
    
    if (!updatedImage) {
      return NextResponse.json({
        success: false,
        error: 'Image not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedImage
    })
  } catch (error) {
    console.error('Error updating product image:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image data',
        details: error.issues
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update image'
    }, { status: 500 })
  }
}

// DELETE /api/products/[id]/images/[imageId] - Delete an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: productId, imageId } = await params
    
    if (!productId || !imageId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID or image ID'
      }, { status: 400 })
    }
    
    // Get image details before deletion
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('url')
      .eq('id', imageId)
      .eq('product_id', productId)
      .single()
    
    if (fetchError || !image) {
      return NextResponse.json({
        success: false,
        error: 'Image not found'
      }, { status: 404 })
    }
    
    // Extract file path from URL
    const urlParts = image.url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${productId}/${fileName}`
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([filePath])
    
    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', productId)
    
    if (dbError) {
      console.error('Database deletion error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete image record'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product image:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete image'
    }, { status: 500 })
  }
}