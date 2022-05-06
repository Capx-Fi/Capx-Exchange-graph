# Capx Exchange Subgraph

[Capx Exchange](https://exchange.capx.fi/) is a decentralized platform that enables the P2P trade of wrapped vesting tokens (WVTs). This subgraph dynamically tracks current state of Capx Exchange contracts, and contains derived stats for things like historical trade data, etc.

## Subgraphs

#### Master
Maintains the data corresponding to every new Project/Protocol On-boarded on the Capx Liquid platform.
#### Controller
Maintains all the WVTs (derivatives) information such as unlock time for the vesting schedule, the holders, etc for the project/protocol On-boarded on the Capx Liquid platform.
#### Vesting
Maintains all the vesting locks created by the project/protocol On-boarded on the Capx Liquid platform.

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
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/shreyas3336/exchange-bsc-testnet	 |

#### Matic (Polygon)

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/shreyas3336/exchange-matic-mumbai	 |

#### Avalanche

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/shreyas3336/exchange-fuji-avalanche	 |