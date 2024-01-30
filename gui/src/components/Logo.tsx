import { classNames } from 'utils'

type Size = 'small' | 'medium' | 'large'

type AvatarProps = {
  size?: Size
  src?: string
  alt?: string
}

const sizes: Record<Size, string> = {
  small: 'w-10 h-10',
  medium: 'w-12 h-12',
  large: 'w-14 h-14'
}

export function Logo({ size = 'medium', src, alt }: AvatarProps) {
  return (
    <img
      className={classNames('inline-block rounded-full', sizes[size])}
      src={src}
      alt={alt}
    />
  )
}
