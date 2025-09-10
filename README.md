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