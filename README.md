# Capx Exchange Subgraph

[Capx Exchange](https://exchange.capx.fi/) is a decentralized platform that enables the P2P trade of wrapped vesting tokens (WVTs). This subgraph dynamically tracks current state of Capx Exchange contracts, and contains derived stats for things like historical trade data, etc.

## Example Query
#### Querying Order details on Capx Exchange subgraph

This query fetches aggregated data from all orders created on the protocol. 

```graphql
{
  orders {
    id
    initiator
    tokenGive
    tokenGet
    tokenGiveTicker
    tokenGetTicker
    expiryTime
    price
    cancelled
    fulfillOrderTimestamp
  }
}
```
## Query URLs

#### Binance Smart Chain (BSC)

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-bsc	 |

#### Matic (Polygon)

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-matic		 |

#### Avalanche

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-avalanche	 |