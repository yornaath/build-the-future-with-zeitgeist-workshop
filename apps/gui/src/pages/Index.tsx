import { Box, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

export const IndexPage = () => {
  return (
    <Box h={'full'}>
      <Flex h={'full'} justifyContent={'center'} alignItems="center">
        <Box mt={-320}>
          <Flex h={'full'} justifyContent={'center'} alignItems="center">
            <motion.div
              animate={{
                y: ['4%', '-4%'],
              }}
              transition={{
                y: {
                  duration: 0.4,
                  yoyo: Infinity,
                  ease: 'easeOut',
                },
              }}>
              <Text mr={4} fontWeight="bold" fontSize="xl">
                Get started by creating a new game!
              </Text>
            </motion.div>

            <motion.div
              animate={{
                y: ['12%', '-12%'],
              }}
              transition={{
                y: {
                  duration: 0.4,
                  yoyo: Infinity,
                  ease: 'easeOut',
                },
              }}>
              <Box fontSize={'4xl'}>👇</Box>
            </motion.div>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
