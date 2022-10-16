use crate::{
    call::Call,
    crud::{Auth, Crud},
    db::{new_id, DbItem},
    handler::SendResult,
    user::User,
    util::link::Link,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct UserCall {
    id: u64,
    user: u64,
    call: u64,
    favorite: bool,
    saved: bool,
}

impl UserCall {
    pub fn saved(&self) -> bool {
        self.saved
    }

    pub fn favorite(&self) -> bool {
        self.favorite
    }
}

impl Auth for UserCall {
    fn set(token: Option<String>, id: u64, options: Self::SetOptions) -> SendResult<Self> {
        let user = User::auth_option(&token)?;
        let call = <Call as DbItem>::get(id)?;
        let mut link = UserCall::get_or_new(&call, &user)?;
        Crud::set(&mut link, options)
    }
}

crate::dbapi!(UserCall);
crate::dbitem!(UserCall);

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SetOptions {
    saved: Option<bool>,
    favorite: Option<bool>,
}
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchOptions;

impl Crud for UserCall {
    type SetOptions = SetOptions;
    type SearchOptions = SearchOptions;

    fn new() -> SendResult<Self> {
        Ok(UserCall {
            id: new_id()?,
            user: Default::default(),
            call: Default::default(),
            favorite: false,
            saved: false,
        })
    }

    fn set(&mut self, options: SetOptions) -> SendResult<Self> {
        if let Some(favorite) = options.favorite {
            self.favorite = favorite;
        }

        if let Some(saved) = options.saved {
            self.saved = saved;
        }

        DbItem::save(self)
    }
}

impl Link for UserCall {
    type Left = User;
    type Right = Call;

    fn left(&self) -> u64 {
        self.user
    }

    fn right(&self) -> u64 {
        self.call
    }

    fn new(right: &Self::Right, left: &Self::Left) -> SendResult<Self> {
        let mut us = <Self as Crud>::new()?;
        us.user = left.id();
        us.call = right.id();
        us.save()
    }
}
