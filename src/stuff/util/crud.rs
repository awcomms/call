use crate::{db::DbItem, handler::SendResult, msg::Sender};

pub trait Auth: Crud {
    fn new(token: Option<String>, options: Self::SetOptions) -> SendResult<Self> {
        Crud::set(&mut <Self as Crud>::new()?, options)
    }

    fn set(token: Option<String>, id: u64, options: Self::SetOptions) -> SendResult<Self> {
        Crud::set(&mut <Self as Auth>::get(token, id)?, options)
    }

    fn get(token: Option<String>, id: u64) -> SendResult<Self> {
        <Self as DbItem>::get(id)
    }

    fn search(token: Option<String>, options: Self::SearchOptions, msg_id: &str, sender: &Sender) -> SendResult<Vec<Self>> {
        <Self as Crud>::search(options)
    }

    fn all(token: Option<String>) -> SendResult<Vec<Self>> {
        <Self as DbItem>::all()
    }

    fn drop(token: Option<String>, id: u64) -> SendResult<()> {
        Err(Some("unsupported action".to_string()))
    }

    fn drop_all(token: Option<String>) -> SendResult<()> {
        Err(Some("unsupported action".to_string()))
    }
}

pub trait Crud: DbItem {
    type SetOptions;
    type SearchOptions;

    fn new() -> SendResult<Self>;

    fn set(&mut self, options: Self::SetOptions) -> SendResult<Self> {
        Ok(self.clone())
    }

    fn search(options: Self::SearchOptions) -> SendResult<Vec<Self>> {
        <Self as DbItem>::all()
    }
}

#[macro_export]
macro_rules! dbapi {
    ($name:ident) => {
        use crate::msg::Sender;
        use crate::handler::send_res;

        impl $name {
            pub fn act(msg_id: &str, sender: &Sender, action: Action) {
                match action {
                    Action::New { options, token } => send_res(msg_id, sender, <Self as Auth>::new(token, options)),
                    Action::Get { token, id } => send_res(msg_id, sender, <Self as Auth>::get(token, id)),
                    Action::Set { token, id, options } => send_res(msg_id, sender, <Self as Auth>::set(token, id, options)),
                    Action::All {token} => send_res(msg_id, sender, <Self as Auth>::all(token)),
                    Action::Search{ token, options} => send_res(msg_id, sender, <Self as Auth>::search(token, options, msg_id, sender)),
                    Action::Drop { id, token } => send_res(msg_id, sender, <Self as Auth>::drop(token, id)),
                    Action::DropAll{token} => send_res(msg_id, sender, <Self as Auth>::drop_all(token)),
                }
            }
        }
        #[derive(Serialize, Deserialize, Debug, Clone)]
        pub enum Action {
            New {
                token: Option<String>,
                options: SetOptions,
            },
            Set {
                token: Option<String>,
                id: u64,
                options: SetOptions,
            },
            Get { token: Option<String>, id: u64},
            All { token: Option<String> },
            Search { token: Option<String>, options: SearchOptions },
            Drop {
                token: Option<String>,
                id: u64,
            },
            DropAll{ token: Option<String> },
        }
    };
}
