use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use warp::{ws::Message, Rejection};
use lazy_static::lazy_static;

pub mod stuff;

pub use stuff::{handler, db, msg, util, tag, user, crud, call};

pub type Result<T> = std::result::Result<T, Rejection>;
pub type Clients = Arc<RwLock<HashMap<String, Client>>>;

lazy_static! {
    pub static ref DB: sled::Db = sled::open("db").unwrap();
    pub static ref DOMAIN: String = std::env::var("DOMAIN").unwrap();
    pub static ref SECRET: String = std::env::var("SECRET").unwrap();
}

#[derive(Debug, Clone)]
pub struct Client {
    pub id: String,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>
}
