interface Props {
  size?: 'sm' | 'md'
}

export function Spinner({ size = 'md' }: Props) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <div className={`${s} animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-gmail-blue`} />
  )
}
