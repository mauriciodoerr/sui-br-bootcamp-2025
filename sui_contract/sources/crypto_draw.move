module crypto_draw::draw;

use sui::dynamic_field;
use std::vector::push_back;
use sui::random::{Random, new_generator};

const EInvalidAccess: u64 = 0;
const EDrawDisabled: u64 = 1;

public struct Draw has key, store {
    id: UID,
    owner: address,
    participants: vector<address>,
    enabled: bool
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
    ctx: &mut TxContext
) {
    assert!(ctx.sender() == draw.owner, EInvalidAccess);
    assert!(draw.enabled == true, EDrawDisabled);

    let participants: vector<address> = draw.participants;

    let mut generator = r.new_generator(ctx);
    let winner = generator.generate_u64_in_range(0, participants.length() - 1);

    let winner_address: address = participants[winner as u64];
    dynamic_field::add(&mut draw.id, b"winner", winner_address);

    draw.enabled = false;
}
