import { polkadotIcon } from '@polkadot/ui-shared'
import { Component, createMemo, For } from 'solid-js'

export interface Props {
  address: string
  isAlternative?: boolean
  size: number
}

export const Identicon: Component<Props> = (props: Props) => {
  const circles = createMemo(
    () => polkadotIcon(props.address, { isAlternative: props.isAlternative || false }),
    props.address,
  )

  return (
    <svg height={props.size} id={props.address} viewBox="0 0 64 64" width={props.size}>
      <For each={circles()}>
        {circle => <circle cx={circle.cx} cy={circle.cy} fill={circle.fill} r={circle.r} />}
      </For>
    </svg>
  )
}
