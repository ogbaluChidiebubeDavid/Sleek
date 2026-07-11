// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentRouter {
    address public constant FEE_WALLET = 0xbe3496154FEC589f393717F730aE4b9dDDA8564f;
    uint256 public constant feeBasisPoints = 1; // 0.01% platform fee (1 basis point)

    event PaymentRouted(
        address indexed buyer,
        address indexed vendor,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 vendorAmount,
        string orderId
    );

    function pay(address payable vendor, string calldata orderId) external payable {
        require(msg.value > 0, "Payment must be greater than zero");
        
        uint256 platformFee = (msg.value * feeBasisPoints) / 10000;
        uint256 vendorAmount = msg.value - platformFee;

        // Route platform fee to the platform owner's designated fee wallet
        (bool successPlatform, ) = payable(FEE_WALLET).call{value: platformFee}("");
        require(successPlatform, "Platform fee transfer failed");

        // Route the rest (99.99%) to the vendor's wallet
        (bool successVendor, ) = vendor.call{value: vendorAmount}("");
        require(successVendor, "Vendor transfer failed");

        emit PaymentRouted(msg.sender, vendor, msg.value, platformFee, vendorAmount, orderId);
    }
}
