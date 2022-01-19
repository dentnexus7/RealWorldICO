import ether from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';

const { assert } = require('chai');

const BigNumber = web3.utils.BN;

const GreggToken = artifacts.require('GreggToken');
const GreggTokenCrowdsale = artifacts.require("GreggTokenCrowdsale");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
contract('GreggTokenCrowdsale', function([_, wallet, investor1, investor2]) {

    beforeEach(async function() {
        // Token config
        this.name = "GreggToken";
        this.symbol = "GGG";
        this.decimals = 18;

        // Deploy token
        this.token = await GreggToken.new(this.name, this.symbol, this.decimals);

        // Crowdsale config
        this.rate = 500;
        this.wallet = wallet;
        this.cap = ether('100');
        // this.openingTime = latestTime() + duration.weeks(1);
        // this.closingTime = this.openingTime + duration.weeks(1);

        // Investor caps
        this.investorMinCap = ether('0.002');
        this.investorMaxCap = ether('50');

        // Crowdsale deploy
        this.crowdsale = await GreggTokenCrowdsale.new(
          this.rate, 
          this.wallet, 
          this.token.address, 
          this.cap
          // this.openingTime,
          // this.closingTime
        );

        // Transfer token ownership to crowdsale
        await this.token.transferOwnership(this.crowdsale.address);

        // Add Investors to whitelist
        await this.crowdsale.addAddressesToWhitelist([investor1, investor2]);

        // Advance time to crowdsale start
        //await increaseTimeTo(this.openingTime + 1);
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
    });

    describe('minted crowdsale', function() {
      it('mints tokens after purchase', async function() {
        const originalTotalSupply = await this.token.totalSupply();
        await this.crowdsale.sendTransaction({ value: ether('1'), from: investor1 });
        const newTotalSupply = await this.token.totalSupply();
        assert.isTrue(newTotalSupply > originalTotalSupply);
      });
    });

    describe('capped crowdsale', function() {
      it('has the correct hard cap', async function() {
        const cap = await this.crowdsale.cap();
        assert.equal(cap.toString(), this.cap.toString(), "cap is correct");
        //cap.should.be.bignumber.equal(this.cap);
      });
    });

    // describe('timed crowdsale', function() {
    //   it('is open', async function() {
    //     const isClosed = await this.crowdsale.hasClosed();
    //     isClosed.should.be.false;
    //   });
    // });

    describe('whitelisted crowdsale', function() {
      it('rejects contributions from non-whitelisted investors', async function() {
        const notWhitelisted = _;
        await this.crowdsale.buyTokens(notWhitelisted, { value: ether('1'), from: notWhitelisted}).should.be.rejectedWith(EVMRevert);
      });
    });

    describe('accepting payments', function() {
      it('should accept payments', async function() {
        const value = ether('1');
        const purchaser = investor2;
        await this.crowdsale.sendTransaction({ value: value, from: investor1 }).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor1, { value: value, from: purchaser }).should.be.fulfilled;
      });
    });

    describe('buyTokens()', function() {
      describe('when the contribution is less than the minimum cap', function() {
        it('rejects the transaction', async function() {
          const value = this.investorMinCap - 1;
          await this.crowdsale.buyTokens(investor2, { value: value, from: investor2 }).should.be.rejectedWith(EVMRevert);
        });
      });

       describe('when the investor has already met the minimum cap', function() {
        it('allows the investor to contribute below the minimum cap', async function() {
          // First contribution is valid
          const value1 = ether('1');
          await this.crowdsale.buyTokens(investor1, { value: value1, from: investor1 });
          // Second contribution is less than minimum investor cap
          const value2 = 1; // wei
          await this.crowdsale.buyTokens(investor1, { value: value2, from: investor1 }).should.be.fulfilled;
        });
      });

      describe('when the total contributions exceeds the investor maximum cap', function() {
        it('rejects the transaction', async function() {
          // First contribution is valid
          const value1 = ether('2');
          await this.crowdsale.buyTokens(investor1, { value: value1, from: investor1 });
          // Second contribution is less than minimum investor cap
          const value2 = ether('49');
          await this.crowdsale.buyTokens(investor1, { value: value2, from: investor1 }).should.be.rejectedWith(EVMRevert);
        });
      });

      describe('when the contribution is within the valid range', function () {
        const value = ether('2');
        it('succeeds & updates the contribution amount', async function () {
          await this.crowdsale.buyTokens(investor2, { value: value, from: investor2 }).should.be.fulfilled;
          const contribution = await this.crowdsale.getUserContribution(investor2);
          assert.equal(contribution.toString(), value.toString(), "contribution is correct");
          //contribution.should.be.bignumber.equal(value);
        });
      });

    });
});