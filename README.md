## Crypto Draw

This is a simple way to draw an exclusive NFT to an audience set.

Basically by inputing an array of addresses, using random number execution on the blockchain, it will draw an address from the array and airdrop the NFT with the selected image to the winner!

## Smart Contract
#### 1. Deployment

For Smart Contract deployment, make sure you execute the following command:

```shell
sui client publish --gas-budget 50000000
```

From the output on `Object Changes` make sure to save the `PackageID` and the first Created Object `ObjectID`.

#### 2. NFT Wallet Display Setup

With the `PackageID` and `ObjectID` from last step, run the following command:

```shell
sui client call --function create_display --module draw --package <PackageID> --args <ObjectID> --gas-budget 10000000
```

This will made the owner able to set the NFT properties with custom image to be properly displayed on wallets.

---

#### Create a new draw with an array of participants

With the same `PackageID` you can now create draws with following command:

```shell
sui client call --package <PackageID> --module draw --function new_draw --args '[<address1>, ... ,<addressN>]' --gas-budget 50000000
```

On the ouput `Object Changes`, make sure to save the Created Objects `ObjectID`, this is your draw reference.

#### Draw

Now you can draw the image you want the winner to receive as a NFT!!!

```shell
sui client call --package <PackageID> --module draw --function exec --args <ObjectID> 0x8 <Image URL> --gas-budget 50000000
```

With you `ObjectID`, you can go to https://suiscan.xyz/devnet/object/\<ObjectID>\/fields and check for the created Dynamic Field and its content will display the value as the winner address.

Check for the winner assets and you will be able to see the awarded NFT.

---
---

## Walrus Setup
Install Walrus by running

```shell
suiup install walrus
```

Make sure to setup a config for Walrus

Before setting the config, make sure you have the folder `~/.config/walrus` available, if not, create it.

```shell
curl https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
```

If you don't have Testnet available via CLI, make sure to set the env with following command:

```shell
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
```

Once setup, switch to it:

```shell
sui client switch --env testnet
```

Now you need some WAL balance, exchange some SUI for WAL with following command:

```shell
walrus get-wal --amount 100000000 --context testnet
```

This will exchange 0.1 SUI for 0.1 WAL and you can check by running `sui client balance`

#### Store file on Walrus

You can go to `/walrus` and to store in Walrus:

```shell
walrus store sui_logo.png --epochs 1 --context testnet
```

Make sure to save the `Blob ID`

With the `Blob ID` you can execute the draw:

```shell
sui client call --package <PackageID> --module draw --function exec --args <ObjectID> 0x8 https://aggregator.walrus-testnet.walrus.space/v1/blobs/<Blob ID> --gas-budget 50000000
```

Go to `https://suiscan.xyz/testnet/object/<ObjectID>/fields` and check for the Dynamic Fields for the winner address, go to the address assets and check for the awarded NFT.