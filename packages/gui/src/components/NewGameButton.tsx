import {
  CategoryMetadata,
  DecodedMarketMetadata,
  MarketDisputeMechanism,
} from '@zeitgeistpm/sdk/dist/types'
import ms from 'ms'
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
  useToast,
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
import { web3FromAddress } from '@polkadot/extension-dapp'
import { extrinsicCallback } from '../lib/tx'
import { getTransactionError } from '../lib/errors'
import { ZTG } from '../lib/ztg'
import { weigh } from '../lib/weights'

export type GameForm = {
  opponent: string
}

export const NewGameButton = () => {
  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameForm>({
    defaultValues: {
      opponent: '',
    },
  })

  const onNewGameSubmitted = async (game: GameForm) => {
    const metadata: DecodedMarketMetadata & {
      categories: CategoryMetadata[]
    } = {
      question: 'Who will winn?',
      description: 'FIGHT!',
      slug: `tick-tack-block-${shortenAddress(selectedAccount)}-${shortenAddress(
        game.opponent,
      )}`,
      categories: [
        {
          name: selectedAccount,
          ticker: lastFour(selectedAccount),
          color: '#1a1a1a',
        },
        {
          name: game.opponent,
          ticker: lastFour(game.opponent),
          color: '#ac2dba',
        },
      ],
    }

    const ammount = (6 * ZTG).toString()

    const oracle = 'dE12VaHKNrQWGT2PzPdSQupbn5DyKi89KKrfm6Tq5SJzE8Mpc'
    const period = { timestamp: [Date.now(), Date.now() + ms('5 minutes')] }
    const mdm: MarketDisputeMechanism = { Authorized: 0 }
    const baseAssetAmount = ammount
    const amts = [ammount, ammount]
    const marketType = { Categorical: 2 }
    const wts = weigh(metadata)
    const injected = await web3FromAddress(selectedAccount)
    const extSigner = { address: selectedAccount, signer: injected.signer }

    await sdk.models.createCpmmMarketAndDeployAssets(
      extSigner,
      oracle,
      period,
      marketType,
      mdm,
      amts,
      baseAssetAmount,
      wts,
      metadata,
      extrinsicCallback({
        successMethod: 'PoolCreate',
        successCallback: data => {
          toast({
            title: 'Success',
            description: 'Game created!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          onClose()
        },
        failCallback: ({ index, error }) => {
          toast({
            title: 'Error.',
            description: getTransactionError(sdk, index, error),
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        },
      }),
    )
  }

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme={'seer'}
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
              <Button type="submit" colorScheme={'seer'} mr={3}>
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
