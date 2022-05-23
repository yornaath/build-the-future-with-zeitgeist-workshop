import SDK from '@zeitgeistpm/sdk'
import { atom, onMount } from 'nanostores'

export const $sdk = atom<SDK | null>(null)

onMount($sdk, () => {
  SDK.initialize().then(sdk => {
    $sdk.set(sdk)
  })
})
