import { CategoryMetadata, DecodedMarketMetadata } from '@zeitgeistpm/sdk/dist/types'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import {
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { isValid, lastFour, shortenAddress } from '../lib/account'
import { useStore } from '@nanostores/react'
import { IoLogoGameControllerA } from 'react-icons/io'
import * as wallet from '../state/wallet'

export type GameForm = {
  ammount: number
  opponent: string
}

export const NewGameButton = () => {
  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameForm>({
    defaultValues: {
      ammount: 10,
      opponent: '',
    },
  })

  const onNewGameSubmitted = (game: GameForm) => {
    const metadata: DecodedMarketMetadata = {
      question: 'Who will winn?',
      description: 'FIGHT!',
      slug: `tick-tack-block-${shortenAddress(selectedAccount)}-${shortenAddress(
        game.opponent,
      )}`,
      categories: [
        {
          name: selectedAccount,
          ticker: lastFour(selectedAccount),
        },
        {
          name: game.opponent,
          ticker: lastFour(game.opponent),
        },
      ],
    }

    sdk.models.createCpmmMarketAndDeployAssets
  }

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme={'green'}
        size="lg"
        leftIcon={<IoLogoGameControllerA size={24} />}>
        New Game
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="2xl">
          <form onSubmit={handleSubmit(game => onNewGameSubmitted(game))}>
            <ModalHeader>Create a new game!</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box>
                <Box mb="4">
                  <FormLabel display={'flex'}>
                    <b>Ammount</b> <Text color="gray.500">(pool liquidity)</Text>
                  </FormLabel>
                  <InputGroup>
                    <Input {...register('ammount')} type="number" />
                    <InputRightAddon children={<b>ZBS</b>} />
                  </InputGroup>
                </Box>

                <Box mb="4">
                  <FormLabel display={'flex'}>
                    <b>Opponent</b> <Text color="gray.500">(address)</Text>
                  </FormLabel>
                  <Input
                    {...register('opponent', {
                      required: true,
                      validate: { valid: isValid },
                    })}
                    type="string"
                  />
                  {errors.opponent && (
                    <Text mt="1" color="red">
                      Invalid address
                    </Text>
                  )}
                </Box>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button type="submit" colorScheme="green" mr={3}>
                Create!
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
