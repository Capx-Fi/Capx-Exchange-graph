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

### Binance Smart Chain (BSC)

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-bsc	 |

### Matic (Polygon)

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-matic		 |

### Avalanche

| Subgraph     | Query URL  |
|---------------------|--------------------------------------------------------------------|
| Exchange Subgraph   | https://api.thegraph.com/subgraphs/name/capxdev/capx-exchange-avalanche	 |

## Contract Address

### Binance Smart Chain (BSC)
| Contract Name     | Contract Address  |
|---------------------|--------------------------------------------------------------------|
| Exchange   | [0x463CdDd0f76C8bd7E70A73cdA1b9da2bcaB64FB1](https://bscscan.com/address/0x463CdDd0f76C8bd7E70A73cdA1b9da2bcaB64FB1)	 |

### Matic (Polygon)
| Contract Name     | Contract Address  |
|---------------------|--------------------------------------------------------------------|
| Exchange   | [0x9148B64Da26d572290EE1C461A733f7857FAA599](https://polygonscan.com/address/0x9148B64Da26d572290EE1C461A733f7857FAA599)	 |

### Avalanche
| Contract Name     | Contract Address  |
|---------------------|--------------------------------------------------------------------|
| Exchange   | [0x463CdDd0f76C8bd7E70A73cdA1b9da2bcaB64FB1](https://snowtrace.io/address/0x463CdDd0f76C8bd7E70A73cdA1b9da2bcaB64FB1)	 |