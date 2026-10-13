import { images, type ImageKey } from '@/lib/assets'

type Props = {
  image: ImageKey
  className?: string
  /** Overrides the asset's own description when context makes it more specific. */
  alt?: string
  priority?: boolean
  ratio?: string
  /** `contain` is for artwork that must not be cropped. Photography uses `cover`. */
  fit?: 'cover' | 'contain'
}

/** WebP with a JPEG fallback, intrinsic dimensions set to prevent layout shift. */
export default function Picture({
  image,
  className = '',
  alt,
  priority = false,
  ratio,
  fit = 'cover',
}: Props) {
  const asset = images[image]
  return (
    <picture className={className} style={ratio ? { aspectRatio: ratio } : undefined}>
      <source srcSet={asset.webp} type="image/webp" />
      <img
        src={asset.jpg}
        alt={alt ?? asset.alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        style={{ objectFit: fit, width: '100%', height: '100%' }}
      />
    </picture>
  )
}
