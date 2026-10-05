'use client'

import { useCallback, useState } from 'react'
import {
  ImagePlus,
  X,
  GripVertical,
  Loader2,
  Upload,
  Check,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

const MAX_IMAGES = 8

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB original

const MAX_OUTPUT_SIZE = 450 * 1024 // ~450KB WebP

const MAX_WIDTH = 1800
const MAX_HEIGHT = 1800

export default function ProductImageUploader({
  productId = null,
  initialImages = [],
  onChange,
}) {
  const [images, setImages] = useState(
    initialImages.map((image, index) => ({
      id: image.id,
      url: image.image_url,
      isPrimary:
        image.is_primary ?? index === 0,
      existing: true,
      storagePath: image.storage_path || null,
    }))
  )

  const [processing, setProcessing] = useState(false)

  const [uploading, setUploading] = useState(false)

  const [draggedIndex, setDraggedIndex] =
    useState(null)

  const [error, setError] = useState('')

  /*
   * Convert any supported browser image
   * into compressed WebP.
   */
  async function compressToWebP(file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `${file.name} is larger than 10MB.`
      )
    }

    if (!file.type.startsWith('image/')) {
      throw new Error(
        `${file.name} is not a supported image.`
      )
    }

    const bitmap = await createImageBitmap(file)

    let width = bitmap.width
    let height = bitmap.height

    /*
     * Keep aspect ratio.
     */
    const scale = Math.min(
      1,
      MAX_WIDTH / width,
      MAX_HEIGHT / height
    )

    width = Math.round(width * scale)
    height = Math.round(height * scale)

    const canvas = document.createElement(
      'canvas'
    )

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d', {
      alpha: true,
    })

    if (!context) {
      bitmap.close()

      throw new Error(
        'Could not process image.'
      )
    }

    context.imageSmoothingEnabled = true

    context.imageSmoothingQuality = 'high'

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    )

    bitmap.close()

    /*
     * Start with high quality and reduce
     * until the image is below our target size.
     */
    let quality = 0.85

    let blob = await canvasToWebP(
      canvas,
      quality
    )

    while (
      blob.size > MAX_OUTPUT_SIZE &&
      quality > 0.45
    ) {
      quality -= 0.05

      blob = await canvasToWebP(
        canvas,
        quality
      )
    }

    /*
     * If still too large, resize again.
     */
    if (blob.size > MAX_OUTPUT_SIZE) {
      const smallerCanvas =
        document.createElement('canvas')

      const smallerWidth = Math.round(
        width * 0.75
      )

      const smallerHeight = Math.round(
        height * 0.75
      )

      smallerCanvas.width =
        smallerWidth

      smallerCanvas.height =
        smallerHeight

      const smallerContext =
        smallerCanvas.getContext('2d')

      smallerContext.drawImage(
        canvas,
        0,
        0,
        smallerWidth,
        smallerHeight
      )

      blob = await canvasToWebP(
        smallerCanvas,
        0.7
      )
    }

    return blob
  }

  function canvasToWebP(
    canvas,
    quality
  ) {
    return new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  'WebP conversion failed.'
                )
              )

              return
            }

            resolve(blob)
          },
          'image/webp',
          quality
        )
      }
    )
  }

  /*
   * Handle selected files.
   */
  async function handleFiles(fileList) {
    const files = Array.from(fileList)

    if (!files.length) return

    setError('')

    const remaining =
      MAX_IMAGES - images.length

    if (remaining <= 0) {
      setError(
        `Maximum ${MAX_IMAGES} images allowed.`
      )

      return
    }

    const selectedFiles =
      files.slice(0, remaining)

    setProcessing(true)

    try {
      const processed = []

      for (const file of selectedFiles) {
        try {
          const webpBlob =
            await compressToWebP(file)

          const previewUrl =
            URL.createObjectURL(
              webpBlob
            )

          processed.push({
            id: crypto.randomUUID(),
            url: previewUrl,
            blob: webpBlob,
            isPrimary:
              images.length === 0 &&
              processed.length === 0,
            existing: false,
            uploading: false,
            originalName: file.name,
            size: webpBlob.size,
          })
        } catch (fileError) {
          console.error(
            fileError
          )

          setError(
            fileError.message
          )
        }
      }

      if (processed.length) {
        const nextImages = [
          ...images,
          ...processed,
        ]

        setImages(nextImages)

        onChange?.(nextImages)
      }
    } finally {
      setProcessing(false)
    }
  }

  /*
   * File input.
   */
  function handleInputChange(event) {
    handleFiles(event.target.files)

    event.target.value = ''
  }

  /*
   * Drag & drop.
   */
  function handleDrop(event) {
    event.preventDefault()

    handleFiles(
      event.dataTransfer.files
    )
  }

  /*
   * Set primary image.
   */
  function setPrimary(index) {
    const nextImages = images.map(
      (image, imageIndex) => ({
        ...image,
        isPrimary:
          imageIndex === index,
      })
    )

    setImages(nextImages)

    onChange?.(nextImages)
  }

  /*
   * Remove image.
   */
  function removeImage(index) {
    const image = images[index]

    if (
      image?.url &&
      !image.existing
    ) {
      URL.revokeObjectURL(
        image.url
      )
    }

    let nextImages =
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )

    /*
     * Always keep one primary image
     * if images still exist.
     */
    if (
      nextImages.length &&
      !nextImages.some(
        (image) =>
          image.isPrimary
      )
    ) {
      nextImages = nextImages.map(
        (image, imageIndex) => ({
          ...image,
          isPrimary:
            imageIndex === 0,
        })
      )
    }

    setImages(nextImages)

    onChange?.(nextImages)
  }

  /*
   * Drag image reorder.
   */
  function handleDragStart(index) {
    setDraggedIndex(index)
  }

  function handleDragOver(
    event,
    targetIndex
  ) {
    event.preventDefault()

    if (
      draggedIndex === null ||
      draggedIndex === targetIndex
    ) {
      return
    }

    const nextImages = [...images]

    const draggedImage =
      nextImages[draggedIndex]

    nextImages.splice(
      draggedIndex,
      1
    )

    nextImages.splice(
      targetIndex,
      0,
      draggedImage
    )

    setDraggedIndex(targetIndex)

    setImages(nextImages)

    onChange?.(nextImages)
  }

  function handleDragEnd() {
    setDraggedIndex(null)
  }

  /*
   * Upload all new images.
   */
  async function uploadImages() {
    if (!productId) {
      throw new Error(
        'Product must be created before uploading images.'
      )
    }

    const newImages =
      images.filter(
        (image) =>
          !image.existing &&
          image.blob
      )

    if (!newImages.length) {
      return images
    }

    setUploading(true)
    setError('')

    try {
      const supabase =
        createClient()

      const uploadedImages = []

      for (
        let index = 0;
        index < newImages.length;
        index++
      ) {
        const image =
          newImages[index]

        const fileName =
          `${crypto.randomUUID()}.webp`

        const storagePath =
          `products/${productId}/${fileName}`

        /*
         * Upload compressed WebP.
         */
        const { error: uploadError } =
          await supabase.storage
            .from('product-images')
            .upload(
              storagePath,
              image.blob,
              {
                contentType:
                  'image/webp',

                cacheControl:
                  '31536000',

                upsert: false,
              }
            )

        if (uploadError) {
          throw uploadError
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              'product-images'
            )
            .getPublicUrl(
              storagePath
            )

        uploadedImages.push({
          id: image.id,

          url:
            publicUrlData.publicUrl,

          image_url:
            publicUrlData.publicUrl,

          storagePath,

          isPrimary:
            image.isPrimary,

          existing: true,

          blob: null,
        })
      }

      /*
       * Keep existing images and
       * replace local previews.
       */
      const existingImages =
        images.filter(
          (image) =>
            image.existing
        )

      const finalImages = [
        ...existingImages,
        ...uploadedImages,
      ]

      setImages(finalImages)

      onChange?.(finalImages)

      return finalImages
    } catch (uploadError) {
      console.error(
        'Image upload error:',
        uploadError
      )

      setError(
        uploadError.message ||
          'Image upload failed.'
      )

      throw uploadError
    } finally {
      setUploading(false)
    }
  }

  /*
   * Expose upload function through
   * the component callback.
   */
  // The parent can call uploadImages
  // through onUpload if supplied.
  return (
    <div className="space-y-5">

      {/* DROP AREA */}

      <label
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDrop={handleDrop}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center transition hover:border-neutral-400 hover:bg-neutral-100"
      >

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={
            handleInputChange
          }
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          {processing ? (
            <Loader2
              size={24}
              className="animate-spin text-neutral-500"
            />
          ) : (
            <Upload
              size={24}
              className="text-neutral-500 transition group-hover:-translate-y-1"
            />
          )}
        </div>

        <p className="mt-4 text-sm font-semibold">
          {processing
            ? 'Optimizing images...'
            : 'Upload product images'}
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          Drag & drop or click to browse
        </p>

        <p className="mt-3 text-[10px] text-neutral-400">
          JPG, PNG, GIF, WEBP · Max 10MB each ·
          Up to {MAX_IMAGES} images
        </p>

      </label>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* IMAGE GRID */}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

          {images.map(
            (image, index) => (
              <div
                key={image.id || index}
                draggable
                onDragStart={() =>
                  handleDragStart(
                    index
                  )
                }
                onDragOver={(event) =>
                  handleDragOver(
                    event,
                    index
                  )
                }
                onDragEnd={
                  handleDragEnd
                }
                className={`group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 ${
                  draggedIndex === index
                    ? 'scale-95 opacity-50'
                    : ''
                }`}
              >

                <img
                  src={image.url}
                  alt={`Product image ${
                    index + 1
                  }`}
                  className="h-full w-full object-cover"
                />

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />

                {/* Drag */}

                <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <GripVertical size={15} />
                </div>

                {/* Remove */}

                <button
                  type="button"
                  onClick={() =>
                    removeImage(
                      index
                    )
                  }
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition hover:bg-red-600 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>

                {/* Primary */}

                <button
                  type="button"
                  onClick={() =>
                    setPrimary(
                      index
                    )
                  }
                  className={`absolute bottom-2 left-2 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold backdrop-blur ${
                    image.isPrimary
                      ? 'bg-white text-black'
                      : 'bg-black/50 text-white'
                  }`}
                >
                  {image.isPrimary ? (
                    <span className="flex items-center gap-1">
                      <Check size={10} />
                      Primary
                    </span>
                  ) : (
                    'Set primary'
                  )}
                </button>

              </div>
            )
          )}

        </div>
      )}

      {/* INFO */}

      {images.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">

          <div>
            <p className="text-xs font-medium">
              {images.length} / {MAX_IMAGES}{' '}
              images
            </p>

            <p className="mt-0.5 text-[10px] text-neutral-400">
              Images are automatically converted to WebP.
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Loader2
                size={14}
                className="animate-spin"
              />
              Uploading...
            </div>
          )}

        </div>
      )}

      {/*
        This button is useful when testing
        the uploader independently.

        For the final product form we will
        trigger upload after product creation.
      */}

      {productId &&
        images.some(
          (image) =>
            !image.existing &&
            image.blob
        ) && (
          <button
            type="button"
            onClick={uploadImages}
            disabled={
              uploading ||
              processing
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Upload size={16} />
            )}

            Upload Images
          </button>
        )}

    </div>
  )
}