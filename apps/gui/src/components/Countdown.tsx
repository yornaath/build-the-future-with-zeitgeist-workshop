import { Box } from '@chakra-ui/react'
import ms from 'ms'
import { useEffect, useState } from 'react'

export const Countdown = (props: { to: number }) => {
  const [timerText, setTimerText] = useState(ms(props.to - Date.now(), { long: true }))

  useEffect(() => {
    const intervall = setInterval(() => {
      setTimerText(ms(props.to - Date.now(), { long: true }))
    }, ms('1sec'))
    return () => clearInterval(intervall)
  }, [props.to])

  return <Box>Ends in: {timerText}</Box>
}
