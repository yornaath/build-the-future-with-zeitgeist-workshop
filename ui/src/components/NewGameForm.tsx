import { Box } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'

export type GameForm = {}

export const NewGameForm = (props: { onSubmit: (data: GameForm) => void }) => {
  const { register, handleSubmit } = useForm<GameForm>()
  return (
    <Box>
      <form onSubmit={handleSubmit(game => props.onSubmit(game))}></form>
    </Box>
  )
}
