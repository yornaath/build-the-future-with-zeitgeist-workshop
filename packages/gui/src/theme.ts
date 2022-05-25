import { extendTheme } from '@chakra-ui/react'
import color from 'color'

export const seerColorBase = color('#ac2dba')

export const chakraTheme = extendTheme({
  useSystemColorMode: true,
  colors: {
    seer: {
      100: seerColorBase.lighten(0.4).hex(),
      200: seerColorBase.lighten(0.3).hex(),
      300: seerColorBase.lighten(0.2).hex(),
      400: seerColorBase.lighten(0.1).hex(),
      500: seerColorBase.hex(),
      600: seerColorBase.darken(0.1).hex(),
      700: seerColorBase.darken(0.2).hex(),
      800: seerColorBase.darken(0.3).hex(),
      900: seerColorBase.darken(0.4).hex(),
    },
  },
  fonts: {
    brand: "'Pacifico', cursive",
    heading: `Circular Std`,
    body: `Circular Std`,
    mono: `Circular Std`,
  },
  global: {},
  components: {
    Checkbox: {
      defaultProps: {
        control: {
          borderRadius: '5px',
        },
      },
    },
    Popover: {
      variants: {
        minimal: {
          maxWidth: 'unset',
          width: 'unset',
        },
      },
    },
  },
})
