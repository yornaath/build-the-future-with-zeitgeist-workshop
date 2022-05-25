import { ISubmittableResult, IEventRecord } from '@polkadot/types/types'
import { useToast } from '@chakra-ui/react'
;(window as any).pop = () => {
  const toast = useToast()
  toast({
    title: 'Account created.',
    description: "We've created your account for you.",
    status: 'success',
    duration: 9000,
    isClosable: true,
  })
}

type GenericCallback = (...args: any[]) => void

export const extrinsicCallback = ({
  successCallback,
  broadcastCallback,
  failCallback,
  finalizedCallback,
  retractedCallback,
  successMethod = 'ExtrinsicSuccess',
}: {
  successCallback?: GenericCallback
  broadcastCallback?: GenericCallback
  failCallback?: GenericCallback
  finalizedCallback?: GenericCallback
  retractedCallback?: GenericCallback
  successMethod?: string
}): ((res: ISubmittableResult, unsub?: () => void) => void) => {
  return (result, unsub) => {
    const { status, events } = result
    if (status.isInBlock && successCallback) {
      processEvents(
        events,
        { failCallback, successCallback: () => successCallback(result) },
        successMethod,
        unsub,
      )
    } else if (status.isFinalized) {
      processEvents(
        events,
        { failCallback, successCallback: finalizedCallback },
        successMethod,
        unsub,
      )
    } else if (status.isRetracted) {
      retractedCallback?.()
      unsub?.()
    } else {
      broadcastCallback?.()
    }
  }
}

const processEvents = (
  events: IEventRecord<any>[],
  {
    failCallback,
    successCallback,
  }: { failCallback?: GenericCallback; successCallback?: GenericCallback },
  successMethod: string = 'ExtrinsicSuccess',
  unsub?: () => void,
) => {
  for (const event of events) {
    const { data, method } = event.event
    if (method === 'ExtrinsicFailed' && failCallback) {
      const { index, error } = data.toHuman()[0].Module
      failCallback({ index, error })
    }
    if (method === 'BatchInterrupted' && failCallback) {
      const { index, error } = data.toHuman()[1].Module
      failCallback({ index, error }, +data.toHuman()[0])
    } else if (successCallback && method === successMethod) {
      const res = data.toHuman()
      successCallback(res)
    }
    unsub?.()
  }
}
