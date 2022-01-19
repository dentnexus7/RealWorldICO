pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
//import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";

contract GreggTokenCrowdsale is Crowdsale, MintedCrowdsale, CappedCrowdsale, WhitelistedCrowdsale {

    // Track investor contributions
    uint256 public investorMinCap = 2000000000000000; // 0.002 Ether
    uint256 public investorMaxCap = 50000000000000000000; // 50 Ether
    mapping(address => uint256) public contributions;

    constructor(
        uint256 _rate, 
        address _wallet, 
        ERC20 _token, 
        uint256 _cap 
        // uint256 _openingTime, 
        // uint256 _closingTime
    ) 
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        // TimedCrowdsale(_openingTime, _closingTime)    
        public 
    {

    }

    /**
    * @dev Returns the amount contributed so far by a specific user.
    * @param _beneficiary Address of contributor
    * @return User contribution so far
    */
    function getUserContribution(address _beneficiary) public view returns (uint256) {
        return contributions[_beneficiary];
    }

    /**
    * @dev Extend parent behavior requiring purchase to respect investor min/max funding cap
    * @param _beneficiary Token purchaser
    * @param _weiAmount Amount of wei contributed
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        uint256 _existingContribution = contributions[_beneficiary];
        uint256 _newContribution = _existingContribution.add(_weiAmount);
        require(_newContribution >= investorMinCap && _newContribution <= investorMaxCap);
        contributions[_beneficiary] = _newContribution;
    }
}