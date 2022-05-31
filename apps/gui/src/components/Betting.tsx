import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { util } from '@zeitgeistpm/sdk'
import Decimal from 'decimal.js'
import { Market, Swap } from '@zeitgeistpm/sdk/dist/models'
import { AssetId, CategoryMetadata } from '@zeitgeistpm/sdk/dist/types'
import { useStore } from '@nanostores/react'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import {
  calcOutGivenIn,
  extrinsicCallback,
  getTransactionError,
  ZTG,
  ztgAsset,
  ztgAssetString,
} from '@tick-tack-block/lib'
import { useQuery } from 'react-query'
import * as wallet from '../state/wallet'
import { web3FromAddress } from '@polkadot/extension-dapp'

export type BettingProps = {
  market: Market
  pool: Swap
}

export const Betting = (props: BettingProps) => {
  const toast = useToast()
  return (
    <Box bg={'blackAlpha.100'} py={2} px={6} rounded="md">
      <Flex>
        {props.market.categories?.map((category, index) => (
          <Flex mr={4} justifyContent="center" alignItems="center">
            <Box bg={category.color} h={8} w={8} rounded="md" mr={4}></Box>
            <Box>
              <Text fontWeight="bold" p={2}>
                {category.ticker}
              </Text>
              <Tooltip label={category.name} hasArrow>
                <AssetBuyButton
                  market={props.market}
                  pool={props.pool}
                  assetId={index}
                  category={category}
                  toast={toast}
                />
              </Tooltip>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}

type AssetBuyButtonProps = {
  category: CategoryMetadata
  market: Market
  pool: Swap
  assetId: number
  toast: ReturnType<typeof useToast>
}

const AssetBuyButton = (props: AssetBuyButtonProps) => {
  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)
  const assets = props.market.outcomeAssets.map(a => a.toJSON())

  const [isTransacting, setIsTransacting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: spotPrice, refetch: refetchSpotPrice } = useQuery(
    ['spotPrice', props.pool?.poolId, props.assetId],
    async () => {
      const spotPrice = await props.pool?.getSpotPrice(
        ztgAssetString,
        assets[props.assetId] as any,
      )
      return spotPrice?.toNumber() || 0
    },
  )

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ ammount: number }>({
    defaultValues: {
      ammount: 1,
    },
  })

  useEffect(() => {
    if (!isOpen) {
      setValue('ammount', 1)
    }
  }, [isOpen])

  const onBuyAsset = async (ammountNumber: number) => {
    setIsTransacting(true)
    const asset = assets[props.assetId] as AssetId
    const ammount = new Decimal(ammountNumber).mul(ZTG).toFixed(0)
    const slippage = new Decimal(0.98)
    const maxPrice = 9999 * ZTG

    const poolAccountId = await props.pool.accountId()

    const poolZtgBalance: any = await sdk.api.query.system.account(
      poolAccountId.toString(),
    )
    const poolAssetBalance: any = await sdk.api.query.tokens.accounts(
      poolAccountId.toString(),
      sdk.api.createType('Asset', asset),
    )

    const ztgWeight = new Decimal(
      props.pool?.weights.toHuman()['Ztg'].replace(/\,/g, ''),
    ).toNumber()

    const assetWeight = new Decimal(
      props.pool?.weights.toHuman()[JSON.stringify(asset)].replace(/\,/g, ''),
    )

    const minOut = calcOutGivenIn(
      poolZtgBalance.data.free.toNumber(),
      ztgWeight,
      poolAssetBalance.free.toNumber(),
      assetWeight.toNumber(),
      parseInt(ammount),
    )

    const tx = await sdk.api.tx.swaps.swapExactAmountIn(
      props.pool.poolId,
      ztgAsset,
      ammount,
      asset,
      minOut.mul(slippage).toFixed(0),
      maxPrice,
    )

    const injected = await web3FromAddress(selectedAccount)
    const extSigner = { address: selectedAccount, signer: injected.signer }

    try {
      await tx.signAndSend(
        selectedAccount,
        extSigner,
        extrinsicCallback({
          broadcastCallback: () => {
            props.toast({
              title: 'Broadcasting',
              description: `Buy asset transaction is being broadcast`,
              status: 'loading',
              duration: 3500,
              isClosable: true,
            })
          },
          successCallback: data => {
            props.toast({
              title: 'Success',
              description: `Betted ${ammountNumber} ZBS`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
            setTimeout(refetchSpotPrice, 500)
            onClose()
          },
          failCallback: ({ index, error }) => {
            props.toast({
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
      props.toast({
        title: 'Canceled.',
        description: 'Canceled transaction',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      onClose()
    }
    setIsTransacting(false)
  }

  return (
    <>
      <Button disabled={isTransacting} size="xs" variant={'outline'} onClick={onOpen}>
        {isTransacting ? <Spinner /> : `Buy asset @${spotPrice / ZTG} ZBS`}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(({ ammount }) => onBuyAsset(ammount))}>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormLabel display={'flex'}>
                <b>Ammount</b> <Text color="gray.500">(ZBS)</Text>
              </FormLabel>
              <Input
                {...register('ammount', {
                  required: true,
                  validate: {
                    valid: v => {
                      try {
                        return Boolean(new Decimal(v))
                      } catch (e) {
                        return false
                      }
                    },
                  },
                })}
                type="number"
              />
              {errors.ammount && (
                <Text mt="1" color="red">
                  Invalid number
                </Text>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                disabled={isTransacting}
                type="submit"
                bg={props.category.color}
                color="whiteAlpha.800"
                mr={3}>
                {isTransacting ? <Spinner /> : `Buy`}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
