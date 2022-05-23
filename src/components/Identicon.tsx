import { polkadotIcon } from '@polkadot/ui-shared'
import { Component, createMemo, For } from 'solid-js'

export interface Props {
  address: string
  isAlternative?: boolean
  size: number
}

export const Identicon: Component<Props> = ({ address, isAlternative = false, size }: Props) => {
  const circles = createMemo(() => polkadotIcon(address, { isAlternative }))

  return (
    <svg height={size} id={address} viewBox="0 0 64 64" width={size}>
      <For each={circles()}>
        {circle => <circle cx={circle.cx} cy={circle.cy} fill={circle.fill} r={circle.r} />}
      </For>
    </svg>
  )
}
