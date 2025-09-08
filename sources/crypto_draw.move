module crypto_draw::draw;

use sui::dynamic_field;
use std::vector::push_back;
use sui::random::{Random, new_generator};

public struct Draw has key, store {
    id: UID,
    owner: address,
    participants: vector<address>
}

public fun new_draw(
    participants: vector<address>,
    ctx: &mut TxContext) {
    let mut set_draw = Draw {
        id: object::new(ctx),
        owner: ctx.sender(),
        participants
    };

    dynamic_field::add(&mut set_draw.id, b"enabled", true);
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
    let participants: vector<address> = draw.participants;

    let mut generator = r.new_generator(ctx);
    let winner = generator.generate_u64_in_range(0, participants.length() - 1);

    let winner_address = participants[winner as u64];
    dynamic_field::add(&mut draw.id, b"winner", winner_address);

    let _old_status: bool = dynamic_field::remove(&mut draw.id, b"enabled");
    dynamic_field::add(&mut draw.id, b"enabled", false);
}
