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
import { useStore } from '@nanostores/react'
import { IoLogoGameControllerA } from 'react-icons/io'
import * as wallet from '../state/wallet'
import { GameForm, NewGameForm } from './NewGameForm'

export const NewGameButton = () => {
  const sdk = useStore(wallet.$sdk)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onNewGameSubmitted = (game: GameForm) => {}

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
          <ModalHeader>Create a new game!</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <NewGameForm onSubmit={onNewGameSubmitted} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3}>
              Create!
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
