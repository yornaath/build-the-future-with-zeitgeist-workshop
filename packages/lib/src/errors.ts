import SDK from '@zeitgeistpm/sdk'

export const getTransactionError = (
  sdk: SDK,
  groupIndex: number,
  errorIndex: number,
): string => {
  if (!sdk.errorTable) {
    return `Transaction failed due to unknown reasons`
  }

  const entry = sdk.errorTable.getEntry(groupIndex, errorIndex)

  if (!entry) {
    return `Transaction failed due to unknown reasons`
  }

  const { errorName, documentation } = entry

  return documentation.length > 0
    ? documentation
    : `Transaction failed, error code: ${errorName}`
}
