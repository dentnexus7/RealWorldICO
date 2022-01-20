const GreggToken = artifacts.require("./GreggToken");
const GreggTokenCrowdsale = artifacts.require("./GreggTokenCrowdsale");

const ether = (n) => new web3.utils.BN(web3.utils.toWei(n, 'ether'));

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

module.exports = async function (deployer, network, accounts) {
    const _name = "Gregg Token";
    const _symbol = "GGG";
    const _decimals = 18;
    
    await deployer.deploy(GreggToken, _name, _symbol, _decimals);
    const deployedToken = await GreggToken.deployed();

    const latestTime = (new Date).getTime();

    const _rate           = 500;
    const _wallet         = accounts[0]; // TODO: Replace me
    const _token          = deployedToken.address;
    const _openingTime    = latestTime + duration.minutes(1);
    const _closingTime    = _openingTime + duration.weeks(1);
    const _cap            = ether('100');
    const _goal           = ether('50');
    const _foundersFund   = accounts[0]; // TODO: Replace me
    const _foundationFund = accounts[0]; // TODO: Replace me
    const _partnersFund   = accounts[0]; // TODO: Replace me
    const _releaseTime    = _closingTime + duration.days(1);

    await deployer.deploy(GreggTokenCrowdsale,
      _rate,
      _wallet,
      _token,
      _cap,
      _openingTime,
      _closingTime,
      _goal,
      _foundersFund,
      _foundationFund,
      _partnersFund,
      _releaseTime      
    )

    return true;
};
