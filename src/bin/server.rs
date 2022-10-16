use soda::{Clients, handler};
use std::convert::Infallible;
use warp::{Filter};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock};
use env_logger;
extern crate log;
extern crate serde_json;
#[tokio::main]
async fn main() {
    env_logger::init();
    let _clients: Clients = Arc::new(RwLock::new(HashMap::new()));

    let health_route = warp::path!("health").and_then(handler::health_handler);
    let ws_route = warp::path("ws")
        .and(warp::ws())
        // .and(with_clients(clients.clone()))
        .and_then(handler::ws_handler);

    let routes = health_route
        .or(ws_route)
        .with(warp::cors().allow_any_origin());

    #[cfg(debug_assertions)]
    warp::serve(routes).run(([127, 0, 0, 1], 8000)).await;

    #[cfg(not(debug_assertions))]
    warp::serve(routes).run(([0, 0, 0, 0], 8000)).await;
    
    fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,), Error = Infallible> + Clone {
        warp::any().map(move || clients.clone())
    }
}