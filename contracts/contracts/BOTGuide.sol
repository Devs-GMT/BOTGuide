// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BOTGuide
/// @notice On-chain ratings for BOTGuide answers and community tips for the knowledge base.
/// @dev No tokens and no payments. The owner only approves tips; approved tips are what the
///      app is allowed to hand to the AI. Nothing about a conversation is stored here, only the
///      hash of an answer (`answerId`) that the app computes.
contract BOTGuide {
    // ---------------------------------------------------------------- ratings

    struct Vote {
        uint32 up;
        uint32 down;
    }

    /// @notice Thumbs up / thumbs down totals per answer id.
    mapping(bytes32 => Vote) public votes;

    /// @dev 0 = has not voted, 1 = helpful, 2 = not helpful
    mapping(bytes32 => mapping(address => uint8)) private choice;

    // ------------------------------------------------------------------- tips

    struct Tip {
        address author;
        string title;
        string body;
        string section;
        uint32 upvotes;
        bool approved;
        uint64 at;
    }

    uint256 public constant MAX_TITLE_BYTES = 80;
    uint256 public constant MAX_BODY_BYTES = 500;
    uint256 public constant MAX_SECTION_BYTES = 32;

    Tip[] public tips;
    mapping(uint256 => mapping(address => bool)) public tipUpvoted;
    mapping(address => uint32) public approvedCount;

    // ------------------------------------------------------------------ admin

    address public owner;

    uint256 private totalUp;
    uint256 private totalDown;
    uint256 private approvedTotal;

    // ----------------------------------------------------------------- events

    event Rated(bytes32 indexed answerId, address indexed voter, bool helpful);
    event TipSubmitted(uint256 indexed id, address indexed author, string title, string section);
    event TipUpvoted(uint256 indexed id, address indexed voter);
    event TipApproved(uint256 indexed id, address indexed author);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ----------------------------------------------------------------- errors

    error NotOwner();
    error AlreadyVoted();
    error EmptyField();
    error TooLong();
    error UnknownTip();
    error OwnTip();
    error AlreadyApproved();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ---------------------------------------------------------------- ratings

    /// @notice Rate an answer. One vote per wallet per answer.
    function rate(bytes32 answerId, bool helpful) external {
        if (choice[answerId][msg.sender] != 0) revert AlreadyVoted();
        choice[answerId][msg.sender] = helpful ? 1 : 2;

        Vote storage v = votes[answerId];
        if (helpful) {
            v.up += 1;
            totalUp += 1;
        } else {
            v.down += 1;
            totalDown += 1;
        }
        emit Rated(answerId, msg.sender, helpful);
    }

    /// @notice Totals for an answer and what `voter` chose (0 none, 1 helpful, 2 not helpful).
    function getVote(bytes32 answerId, address voter)
        external
        view
        returns (uint32 up, uint32 down, uint8 voterChoice)
    {
        Vote storage v = votes[answerId];
        return (v.up, v.down, choice[answerId][voter]);
    }

    // ------------------------------------------------------------------- tips

    /// @notice Propose a tip. It stays "pending" until the owner approves it.
    function submitTip(string calldata title, string calldata body, string calldata section)
        external
        returns (uint256 id)
    {
        uint256 t = bytes(title).length;
        uint256 b = bytes(body).length;
        uint256 s = bytes(section).length;
        if (t == 0 || b == 0 || s == 0) revert EmptyField();
        if (t > MAX_TITLE_BYTES || b > MAX_BODY_BYTES || s > MAX_SECTION_BYTES) revert TooLong();

        id = tips.length;
        tips.push(
            Tip({
                author: msg.sender,
                title: title,
                body: body,
                section: section,
                upvotes: 0,
                approved: false,
                at: uint64(block.timestamp)
            })
        );
        emit TipSubmitted(id, msg.sender, title, section);
    }

    /// @notice Upvote a tip. Once per wallet, and not your own tip.
    function upvoteTip(uint256 id) external {
        if (id >= tips.length) revert UnknownTip();
        Tip storage tip = tips[id];
        if (tip.author == msg.sender) revert OwnTip();
        if (tipUpvoted[id][msg.sender]) revert AlreadyVoted();
        tipUpvoted[id][msg.sender] = true;
        tip.upvotes += 1;
        emit TipUpvoted(id, msg.sender);
    }

    /// @notice Owner only. Approved tips are the only tips the app gives to the AI.
    function approveTip(uint256 id) external onlyOwner {
        if (id >= tips.length) revert UnknownTip();
        Tip storage tip = tips[id];
        if (tip.approved) revert AlreadyApproved();
        tip.approved = true;
        approvedCount[tip.author] += 1;
        approvedTotal += 1;
        emit TipApproved(id, tip.author);
    }

    function tipCount() external view returns (uint256) {
        return tips.length;
    }

    /// @notice A page of tips in submission order, newest last.
    function getTips(uint256 from, uint256 count) external view returns (Tip[] memory page) {
        uint256 total = tips.length;
        if (from >= total) return new Tip[](0);
        uint256 end = from + count;
        if (end > total) end = total;
        page = new Tip[](end - from);
        for (uint256 i = from; i < end; i++) {
            page[i - from] = tips[i];
        }
    }

    /// @notice Every approved tip with its id. Loops over all tips, so call it from a view/RPC only.
    function getApprovedTips() external view returns (uint256[] memory ids, Tip[] memory approved) {
        ids = new uint256[](approvedTotal);
        approved = new Tip[](approvedTotal);
        uint256 n;
        for (uint256 i = 0; i < tips.length && n < approvedTotal; i++) {
            if (tips[i].approved) {
                ids[n] = i;
                approved[n] = tips[i];
                n++;
            }
        }
    }

    // ------------------------------------------------------------------ stats

    function stats()
        external
        view
        returns (uint256 tipsSubmitted, uint256 tipsApproved, uint256 helpfulVotes, uint256 notHelpfulVotes)
    {
        return (tips.length, approvedTotal, totalUp, totalDown);
    }

    // ------------------------------------------------------------------ admin

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
