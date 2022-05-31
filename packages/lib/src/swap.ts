import Decimal from "decimal.js";

/**
 *
 * Calculate the assets/token estimated to get out based on how much you are putting in.
 *
 * @param tokenBalanceIn number - amount of 'in' asset in the pool
 * @param tokenWeightIn number -  weight of 'in' asset on the pool
 * @param tokenBalanceOut number - amount of 'out' asset in the pool
 * @param tokenWeightOut number - weight of 'out' asset on the pool
 * @param tokenAmountIn number - amount in for the swap
 * @param swapFee number - 0 for now
 * @returns  number
 */

export const calcOutGivenIn = (
  tokenBalanceIn: number, // amount of 'in' asset in the pool
  tokenWeightIn: number, // weight of 'in' asset on the pool
  tokenBalanceOut: number, // amount of 'out' asset in the pool
  tokenWeightOut: number, // weight of 'out' asset on the pool
  tokenAmountIn: number, // amount in for the swap
  swapFee: number = 0 //0 for now
) => {
  const weightRatio = new Decimal(tokenWeightIn).div(
    new Decimal(tokenWeightOut)
  );
  const adjustedIn = new Decimal(tokenAmountIn).times(
    new Decimal(1).minus(new Decimal(swapFee))
  );
  const y = new Decimal(tokenBalanceIn).div(
    new Decimal(tokenBalanceIn).plus(adjustedIn)
  );
  const foo = y.pow(weightRatio);
  const bar = new Decimal(1).minus(foo);
  const tokenAmountOut = new Decimal(tokenBalanceOut).times(bar);
  return tokenAmountOut;
};
