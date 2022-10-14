use crate::{
        msg::{Model, Request, Sender},
        user::User,
    /*Client, Clients,*/ Result,
};
use futures::{FutureExt, StreamExt};
use log::{error, debug};
use serde::Serialize;
use serde_json::{from_str, json, to_string};
use std;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use uuid::Uuid;
use warp::{
    http::StatusCode,
    ws::{Message, WebSocket},
    Reply,
};

pub type SendResult<T> = std::result::Result<T, Option<&'static str>>;

pub fn send_error(id: &str, sender: &Sender, e: Option<&'static str>) {
    if let Some(e) = e {
        debug!("{}", e);
        send_error_text(id, sender, &e);
    } else {
        internal_error(id, sender);
    }
}

pub fn internal_error(id: &str, sender: &Sender) {
    send(
        id,
        sender,
        &json!({"error": true, "internal": true}).to_string(),
    );
}

pub fn send_error_text(id: &str, sender: &Sender, e: &str) {
    send(id, sender, &json!({ "error": e }).to_string())
}

pub fn send(id: &str, sender: &Sender, data: &str) {
    let res = json!({"id": id, "data": data}).to_string();
    send_base(&sender, &res)
}

pub fn send_base(sender: &Sender, data: &str) {
    if let Err(e) = sender.send(Ok(Message::text(data))) {
        error!("handler::send_base({}): {}", data, e)
    }
}

/*pub fn send_ok(id: &str, sender: &Sender) {
    send(id, sender, &json!({"error": false}).to_string())
}*/

pub fn send_type<T: Serialize + std::fmt::Debug>(id: &str, data: T, sender: &Sender) {
    match to_string(&data) {
        Ok(s) => send(id, sender, &s),
        Err(e) => {
            error!(
                "data {:#?} to_string error, {}, \nrequest id {}",
                data, e, id
            );
            internal_error(id, sender);
        }
    };
}

pub fn send_res<T: Serialize + std::fmt::Debug>(msg_id: &str, sender: &Sender, res: SendResult<T>) {
    match res {
        Ok(v) => send_type(msg_id, v, sender),
        Err(e) => send_error(msg_id, sender, e),
    }
}

pub async fn health_handler() -> Result<impl Reply> {
    Ok(StatusCode::OK)
}

pub async fn ws_handler(ws: warp::ws::Ws /*, clients: Clients*/) -> Result<impl Reply> {
    let id = Uuid::new_v4().simple().to_string();
    Ok(ws.on_upgrade(move |socket| client_connection(socket, id /*clients*/)))
}

pub async fn client_connection(socket: WebSocket, id: String /*, clients: Clients*/) {
    let (client_ws_sender, mut client_ws_rcv) = socket.split();
    let (sender, client_rcv) = mpsc::unbounded_channel();

    let client_rcv = UnboundedReceiverStream::new(client_rcv);
    tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
        if let Err(e) = result {
            error!("error sending websocket msg: {}", e);
        }
    }));

    /*clients.write().await.insert(
        id.clone(),
        Client {
            id: id.clone(),
            sender: None, // sender: Some(sender)
        },
    );*/
    error!("{} connected", &id);

    while let Some(result) = client_ws_rcv.next().await {
        match result {
            Ok(msg) => {
                let msg: Message = msg;
                match msg.to_str() {
                    Ok(msg) => {
                        if msg == "ping" || msg == "ping\n" {
                            return;
                        }
                        let _msg = msg.clone();
                        let msg: std::result::Result<Request, _> = from_str(&msg);
                        match msg {
                            Ok(request) => {
                                let msg_id = &request.id;
                                if let Some(model) = request.model {
                                    match from_str(&model) {
                                        Err(e) => {
                                            error!("from_str({}): {}", &model, e);
                                            internal_error(msg_id, &sender);
                                        }
                                        Ok(model) => match model {
                                            Model::User(action) => {
                                                User::act(msg_id, &sender, action)
                                            }
                                        },
                                    }
                                }
                            }
                            Err(e) => {
                                error!("msg parse error on msg - {:#?}: {:#?}", _msg, e);
                                send_base(&sender, &format!("{}", e));
                            }
                        }
                    }
                    Err(_) => return,
                }
            }
            Err(e) => {
                error!("error receiving ws message: {}", e);
                break;
            }
        };
    }
    // clients.write().await.remove(&id);
    error!("{} disconnected", id);
}
