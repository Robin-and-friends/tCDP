# tCDP
collateralized debt position, but fungible

## Frontend:
[tCDP-frontend](https://github.com/Robin-and-friends/tCDP-frontend)

## DeFi Protocols Integration:
- Compound
- AAVE
- Kyber Network
- dYdX
## What is tCDP:
This project aims to solve two DeFi lending problems: over-collateralization and illiquidity, by creating a shared and tokenized CDP - tCDP. Similar to most of the lending protocols, tCDP requires users to deposit collateral before borrowing. The difference is tCDP's users are sharing a huge position, rather than owning CDP individually. That makes tCDP fungible and tradable.

Also, tCDP rebalances itself automatically. Users don't need to worry about liquidation any more. The position gets deleverage/leverage whenever the collateralization ratio falls out from the given range. Furthermore, tCDP is platform-agnostic, it can rely on any lending protocol that supports ETH deposit and DAI borrowings, such as MakerDAO, Compound, and AAVE, and it always chooses the one with the best funding rate.

For traditional CDP settlement, users need to first repay debt then draw collateral. For tCDP, since it is an ERC20 token, users may directly sell it to DEXes for its net value. Trading tCDP is like trading a bundle of assets and debt.
