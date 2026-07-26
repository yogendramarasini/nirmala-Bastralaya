type EditorialImageProps = {
  panel: 'saree' | 'coatpants' | 'bags' | 'shoes'
  className?: string
  label?: string
}

const positions = {
  saree: '0% 0%',
  coatpants: '100% 0%',
  bags: '0% 100%',
  shoes: '100% 100%',
}

export default function EditorialImage({ panel, className = '', label }: EditorialImageProps) {
  return (
    <div
      role="img"
      aria-label={label || panel}
      className={className}
      style={{
        backgroundImage: "url('/images/editorial/product-collection.webp')",
        backgroundSize: '200% 200%',
        backgroundPosition: positions[panel],
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
