module crypto_draw::draw;

use sui::dynamic_field;
use std::vector::push_back;
use sui::random::{Random, new_generator};
use sui::display;
use std::string::{Self, String, as_bytes};
use sui::package::{Self, Publisher};

const EInvalidAccess: u64 = 0;
const EDrawDisabled: u64 = 1;

public struct Draw has key, store {
    id: UID,
    owner: address,
    participants: vector<address>,
    enabled: bool
}

public struct DRAW has drop {}

public struct Award_NFT has key, store {
    id: UID,
    name: String,
    description: String,
    url: String
}

fun init(otw: DRAW, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}

fun mint_nft(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    winner_address: address,
    ctx: &mut TxContext
) {
    let nft = Award_NFT {
        id: object::new(ctx),
        name: string::utf8(name),
        description: string::utf8(description),
        url: string::utf8(url),
    };
    transfer::public_transfer(nft, winner_address);
}

entry fun create_display(
    publisher: &Publisher,
    ctx: &mut TxContext
) {
    let mut display = display::new_with_fields<Award_NFT>(
        publisher,

        vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url")
        ],
        
        vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}")
        ],
        ctx
    );

    display::update_version(&mut display);
    transfer::public_transfer(display, tx_context::sender(ctx));
}

public fun new_draw(
    participants: vector<address>,
    ctx: &mut TxContext) {
    let set_draw = Draw {
        id: object::new(ctx),
        owner: ctx.sender(),
        participants,
        enabled: true
    };

    transfer::share_object(set_draw);
}

public fun add_participant(
    draw: &mut Draw,
    ctx: &mut TxContext
) {
    push_back<address>(&mut draw.participants, ctx.sender());
}

entry fun exec(
    draw: &mut Draw,
    r: &Random,
    nft_image: String,
    ctx: &mut TxContext
) {
    assert!(ctx.sender() == draw.owner, EInvalidAccess);
    assert!(draw.enabled == true, EDrawDisabled);

    let participants: vector<address> = draw.participants;

    let mut generator = r.new_generator(ctx);
    let winner = generator.generate_u64_in_range(0, participants.length() - 1);

    let winner_address: address = participants[winner as u64];
    dynamic_field::add(&mut draw.id, b"winner", winner_address);

    mint_nft(
        b"Draw Award",
        b"Awarded NFT",
        *nft_image.as_bytes(),
        winner_address,
        ctx
    );

    draw.enabled = false;
}
