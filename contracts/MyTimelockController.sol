// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract MyTimelockController is TimelockController {
    /**
     * @dev コンストラクタで TimelockController を初期化
     * @param minDelay トランザクションが遅延される最小時間(s)
     * @param proposers 提案を行えるアドレスのリスト
     * @param executors 実行を行えるアドレスのリスト
     * @param admin 管理者のアドレス
     */
    constructor(
        uint minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
