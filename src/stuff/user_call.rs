use crate::{util::link::Link, user::User, call::Call, db::{new_id, DbItem}, crud::{Auth, Crud}, handler::SendResult};
use serde::{Serialize, Deserialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct UserCall {
    id: u64,
    user: u64,
    call: u64
}

impl Auth for UserCall {
    fn new(token: Option<String>, options: Self::SetOptions) -> SendResult<Self> {
        let user = User::auth_option(token)?;
        <Self as Link>::new(&<Call as DbItem>::get(options.call)?, &user)
    }
}

crate::dbapi!(UserCall);
crate::dbitem!(UserCall);

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SetOptions {
    call: u64
}
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchOptions;

impl Crud for UserCall {
    type SetOptions = SetOptions;
    type SearchOptions = SearchOptions;

    fn new() -> SendResult<Self> {
        UserCall {
            id: new_id()?,
            user: Default::default(),
            call: Default::default()
        }.save()
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