import ms from 'ms'
import {
  CategoryMetadata,
  DecodedMarketMetadata,
  MarketDisputeMechanism,
} from '@zeitgeistpm/sdk/dist/types'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Box, FormLabel, Input, Text } from '@chakra-ui/react'
import {
  shortenAddress,
  isValid,
  lastFour,
  extrinsicCallback,
  getTransactionError,
  ZTG,
  weigh,
} from '@tick-tack-block/lib'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { useForm } from 'react-hook-form'
import { useStore } from '@nanostores/react'
import { IoLogoGameControllerA } from 'react-icons/io'
import * as wallet from '../state/wallet'
import { useState } from 'react'
import { useQuery } from 'react-query'

export type GameForm = {
  opponent: string
}

export const NewGameButton = () => {
  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const toast = useToast()
  const [isTransacting, setIsTransacting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameForm>({
    defaultValues: {
      opponent: '',
    },
  })

  const { data: referee } = useQuery(['referee'], () => {
    return fetch('http://localhost:3000/referee').then(res => res.json())
  })

  const onNewGameSubmitted = async (game: GameForm) => {
    setIsTransacting(true)
    try {
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

      const ammount = (100 * ZTG).toString()

      const oracle = referee.address
      const period = { timestamp: [Date.now(), Date.now() + ms('20 minutes')] }
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
          broadcastCallback: () => {
            if (!toast.isActive('new-game-broadcast')) {
              toast({
                id: 'new-game-broadcast',
                title: 'Broadcasting',
                description: `Creating market and deploying pool.`,
                status: 'loading',
                duration: 5000,
                isClosable: true,
              })
            }
          },
          successCallback: data => {
            toast({
              id: 'new-game-success',
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
              id: 'new-game-error',
              title: 'Error.',
              description: getTransactionError(sdk, index, error),
              status: 'error',
              duration: 9000,
              isClosable: true,
            })
          },
        }),
      )
    } catch (error) {
      toast({
        title: 'Canceled.',
        description: 'Transaction cancelled.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
      setTimeout(onClose, 66)
    }
    setIsTransacting(true)
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
                <Box mb="4">
                  <FormLabel display={'flex'}>
                    <b>Referee/Oracle</b> <Text color="gray.500">(address)</Text>
                  </FormLabel>
                  <Input mb={2} disabled value={referee?.address} />
                </Box>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button
                disabled={isTransacting}
                type="submit"
                colorScheme={'seer'}
                mr={3}>
                {isTransacting ? <Spinner /> : 'Create!'}
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
