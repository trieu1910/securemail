interface Props {
  name: string
  picture?: string
  size?: number
}

const bgColors = [
  'bg-red-500', 'bg-blue-600', 'bg-green-600', 'bg-purple-600',
  'bg-yellow-600', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
]

export function Avatar({ name, picture, size = 32 }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    )
  }

  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % bgColors.length

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bgColors[colorIndex]} text-white font-medium`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}
