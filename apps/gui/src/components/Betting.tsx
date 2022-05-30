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
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { Market, Swap } from '@zeitgeistpm/sdk/dist/models'
import { AssetId, CategoryMetadata } from '@zeitgeistpm/sdk/dist/types'
import { useStore } from '@nanostores/react'
import * as wallet from '../state/wallet'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { ZTG } from '@tick-tack-block/lib'

export type BettingProps = {
  market: Market
  pool: Swap
}

export const Betting = (props: BettingProps) => {
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
}

const AssetBuyButton = (props: AssetBuyButtonProps) => {
  const sdk = useStore(wallet.$sdk)
  const selectedAccount = useStore(wallet.$selectedAccount)

  const { isOpen, onOpen, onClose } = useDisclosure()

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
    const assets = props.market.outcomeAssets.map(a => a.toJSON())
    const asset = assets[props.assetId] as AssetId
    const ammount = new Decimal(ammountNumber).mul(ZTG).toFixed()
    console.log(ammount)
  }

  return (
    <>
      <Button size="xs" variant={'outline'} onClick={onOpen}>
        Buy asset
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
                type="float"
              />
              {errors.ammount && (
                <Text mt="1" color="red">
                  Invalid number
                </Text>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                type="submit"
                bg={props.category.color}
                color="whiteAlpha.800"
                mr={3}>
                Buy
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
