use sled;

mod types;


#[tokio::main]
fn main() {
    static db: sled::Db = sled::open("db");
    static calls: sled::Tree = db.open_tree(b"calls");
    static users: sled::Tree = db.open_tree(b"users");

    println!("Hello, world!");

    let call = warp::path("call").and(warp::ws()).map(|ws: warp::ws::Ws| {
        ws.on_upgrade(move |socket| new_call(socket))
    });

    
}
