const { assert } = require('chai');

const BigNumber = web3.BigNumber;

const GreggToken = artifacts.require('GreggToken');
const GreggTokenCrowdsale = artifacts.require("GreggTokenCrowdsale");

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
contract('GreggTokenCrowdsale', function([_, wallet]) {

    beforeEach(async function() {
        // Token config
        this.name = "GreggToken";
        this.symbol = "GGG";
        this.decimals = 18;

        this.token = await GreggToken.new(this.name, this.symbol, this.decimals);

        this.rate = 500;
        this.wallet =wallet;

        this.crowdsale = await GreggTokenCrowdsale.new(this.rate, this.wallet, this.token.address);
    });

    describe('crowdsale', function() {
        it('tracks the rate', async function () {
            const rate = await this.crowdsale.rate();
            assert.equal(rate.toNumber(), this.rate, "rate is correct");
            //rate.should.be.bignumber.equal(this.rate);
        });

        it('tracks the wallet', async function () {
            const wallet = await this.crowdsale.wallet();
            wallet.should.equal(this.wallet);
        });

        it('tracks the token', async function () {
            const token = await this.crowdsale.token();
            token.should.equal(this.token.address);
        });
    })
});