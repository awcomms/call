use tokio;
use serde::{Serialize, Deserialize};
use crate::stuff::{call, user::UserAction};

pub type Sender = tokio::sync::mpsc::UnboundedSender<std::result::Result<warp::ws::Message, warp::Error>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Request {
    pub id: String,
    pub model: Option<Model>
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Response<D> {
    pub id: String,
    pub data: D
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Model {
    User(UserAction),
    Call(call::Action),
    Id
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Msg {
    pub id: String,
    pub model: Model,
}