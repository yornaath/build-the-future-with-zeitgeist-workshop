import Decimal from "decimal.js";

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
