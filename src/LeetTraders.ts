import { ponder } from "../generated";

const pricePrecision = BigInt(1e4);
const treasuryAddress = "0xd40846a19fdc9c8255dccd18bcbb261bdbf5e4db";

ponder.on("LeetNotePair:Swap", async ({ event, context }) => {
    const { LeetTrader } = context.entities;

    const { amount0In, amount1In, amount0Out, amount1Out, to } = event.params;
    const traderAddress = event.transaction.from;
    console.log(event.params);

    if (to === treasuryAddress || traderAddress === treasuryAddress) {
        console.log("Treasury transaction, skipping");
        return;
    }

    const trader = await LeetTrader.get(traderAddress);
    const previousTotalBoughtAmount = BigInt(trader?.totalBoughtAmount ?? 0);
    const previousAverageBuyPrice = BigInt(trader?.averageBuyPrice ?? 0);
    const previousTotalSoldAmount = BigInt(trader?.totalSoldAmount ?? 0);
    const previousAverageSellPrice = BigInt(trader?.averageSellPrice ?? 0);
    const previousPnl = BigInt(trader?.pnl ?? 0);

    const leetAmountIn = amount1In;
    const noteAmountIn = amount0In;
    const leetAmountOut = amount1Out;
    const noteAmountOut = amount0Out;

    const isBuy = leetAmountIn == 0n && noteAmountIn > 0n && noteAmountOut === 0n && leetAmountOut > 0n;
    const isSell = leetAmountOut == 0n && noteAmountOut > 0n && noteAmountIn === 0n && leetAmountIn > 0n;

    const buyExecutionPrice = isBuy ? noteAmountIn * pricePrecision / leetAmountOut : 0n;
    const sellExecutionPrice = isSell ? noteAmountOut * pricePrecision / leetAmountIn : 0n;

    const totalBoughtAmount = isBuy ? previousTotalBoughtAmount + leetAmountOut : previousTotalBoughtAmount;
    const totalSoldAmount = isSell ? previousTotalSoldAmount + leetAmountIn : previousTotalSoldAmount;

    const averageBuyPrice = isBuy ? (previousTotalBoughtAmount * previousAverageBuyPrice + leetAmountOut * buyExecutionPrice) / (previousTotalBoughtAmount + leetAmountOut) : previousAverageBuyPrice;
    const averageSellPrice = isSell ? (previousTotalSoldAmount * previousAverageSellPrice + leetAmountIn * sellExecutionPrice) / (previousTotalSoldAmount + leetAmountIn) : previousAverageSellPrice;

    const pnl = isBuy ? previousPnl + (leetAmountOut * buyExecutionPrice - leetAmountOut * averageBuyPrice) : isSell ? previousPnl + (leetAmountIn * averageSellPrice - leetAmountIn * sellExecutionPrice) : previousPnl;

    LeetTrader.upsert(traderAddress, {
        totalBoughtAmount,
        averageBuyPrice,
        totalSoldAmount,
        averageSellPrice,
        pnl,
    });
});

