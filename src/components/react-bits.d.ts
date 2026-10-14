/**
 * Type declarations for the React Bits components installed via the shadcn
 * registry. The source files ship as untyped .jsx and are left exactly as
 * delivered; these signatures mirror their actual prop defaults so usage is
 * checked without modifying vendor code.
 */
declare module '@/components/FlipCard' {
  import type { ReactNode } from 'react'

  export interface FlipCardProps {
    front?: ReactNode
    back?: ReactNode
    flipped?: boolean
    defaultFlipped?: boolean
    onFlipChange?: (flipped: boolean) => void
    axis?: 'x' | 'y'
    flipOnClick?: boolean
    draggable?: boolean
    dragDistance?: number
    tilt?: boolean
    tiltMax?: number
    glare?: boolean
    glareOpacity?: number
    hoverScale?: number
    perspective?: number
    stiffness?: number
    damping?: number
    width?: number
    height?: number
    radius?: number
    background?: string
    color?: string
    shadow?: boolean
    shadowColor?: string
    shadowOpacity?: number
    disabled?: boolean
    ariaLabel?: string
    className?: string
  }

  const FlipCard: (props: FlipCardProps) => JSX.Element
  export default FlipCard
}

declare module '@/components/SplitFlapText' {
  export interface SplitFlapTextProps {
    words?: string[]
    text?: string
    flipDuration?: number
    stagger?: number
    cycleDelay?: number
    charset?: 'alphanumeric' | 'alpha' | 'numeric' | string
    flipsPerChar?: number
    tileColor?: string
    textColor?: string
    tileRadius?: number
    gap?: number
    fontSize?: number
    loop?: boolean
    padTo?: number
    className?: string
    style?: React.CSSProperties
  }

  const SplitFlapText: (props: SplitFlapTextProps) => JSX.Element
  export default SplitFlapText
}

declare module '@/components/PeekRating' {
  export interface PeekRatingProps {
    value?: number
    defaultValue?: number
    onChange?: (value: number) => void
    count?: number
    shape?: 'star' | 'heart' | 'circle' | string
    labels?: string[]
    activeColor?: string
    idleColor?: string
    tipColor?: string
    tipTextColor?: string
    size?: number
    lift?: number
    magnify?: number
    riseDuration?: number
    popScale?: number
    showTip?: boolean
    allowClear?: boolean
    readOnly?: boolean
    disabled?: boolean
    ariaLabel?: string
    className?: string
  }

  const PeekRating: (props: PeekRatingProps) => JSX.Element
  export default PeekRating
}

declare module '@/components/AccordionGallery' {
  export interface AccordionGalleryItem {
    /** Image URL. Imported asset paths are fine. */
    image: string
    /** Short panel caption. */
    label?: string
    /** Destination for the panel. Omit to make it selectable but inert. */
    link?: string
    /** Falls back to `label` when absent. */
    alt?: string
  }

  export interface AccordionGalleryProps {
    items?: AccordionGalleryItem[]
    defaultIndex?: number
    accentColor?: string
    overlayColor?: string
    textColor?: string
    height?: number
    gap?: number
    radius?: number
    expandRatio?: number
    orientation?: 'horizontal' | 'vertical'
    duration?: number
    ease?: string
    parallax?: number
    tilt?: number
    stagger?: number
    trigger?: 'hover' | 'click'
    showLabels?: boolean
    grayscale?: boolean
    className?: string
    /** Local addition: reports the active panel index, initial value included. */
    onChange?: (index: number) => void
  }

  const AccordionGallery: (props: AccordionGalleryProps) => JSX.Element
  export default AccordionGallery
}
