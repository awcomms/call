use std::collections::HashSet;
use crate::{user::User, user_call::UserCall, util::link::Link, handler::send_error};

use serde::{Deserialize, Serialize};

use crate::{util::Location, crud::{Crud, Auth}, tag::{Tags, DbTags}, handler::SendResult,db::{DbItem, new_id}};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Call {
    id: u64,
    name: Option<String>,
    location: Option<Location>,
    tags: Tags,
    pub ids: HashSet<String>
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchOptions {
    tags: Option<Vec<String>>,
    location: Option<Location>,
    favorite: Option<bool>,
    saved: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SetOptions {
    name: Option<String>,
    tags: Option<Vec<String>>,
    location: Option<Location>,
    favorite: Option<bool>,
    saved: Option<bool>,
    add_ids: Option<Vec<String>>,
    remove_ids: Option<Vec<String>>
}

crate::dbitem!(Call);
crate::dbapi!(Call);

impl DbTags for Call {
    fn tags(&self) -> Tags {
        let mut tags = self.tags.clone();
        if let Some(name) = self.name.clone() {
            tags.update(vec![name])
        }
        tags
    }
}

impl Auth for Call {
    fn search(token: Option<String>, options: SearchOptions, msg_id: &str, sender: &Sender) -> SendResult<Vec<Self>> {
        let mut all = if let Some(tags) = options.tags {
            println!("tags");
            <Self as DbTags>::sort(&tags)?
        } else {
            <Self as DbItem>::all()?
        };

        if let Some(saved) = options.saved {
            let user = User::auth_option(&token)?;
            all = all.into_iter().filter(|call| {
                let user_call = <UserCall as Link>::get(call, &user);
                match user_call {
                    Ok(u) => u.saved() == saved,
                    Err(e) => {send_error(msg_id, sender, e); panic!()}
                }
            }).collect::<Vec<Self>>();
        }

        if let Some(favorite) = options.favorite {
            let user = User::auth_option(&token)?;
            all = all.into_iter().filter(|call| {
                let user_call = <UserCall as Link>::get(call, &user);
                match user_call {
                    Ok(u) => u.favorite() == favorite,
                    Err(e) => {send_error(msg_id, sender, e); panic!()}
                }
            }).collect::<Vec<Self>>();
        }

        Ok(all)
    }
}

impl Crud for Call {
    type SetOptions = SetOptions;
    type SearchOptions = SearchOptions;

    fn new() -> SendResult<Self> {
        Call {
            id: new_id()?,
            name: Default::default(),
            location: Default::default(),
            tags: Tags::new(),
            ids: HashSet::new()
        }.save()
    }

    fn set(&mut self, options: SetOptions) -> SendResult<Self> {
        if let Some(tags) = options.tags {
            self.tags.update(tags);
        }
        if let Some(name) = options.name {
            self.name = Some(name);
        }
        if let Some(add_ids) = options.add_ids {
            for id in add_ids{
                self.ids.insert(id);
            }
        }
        if let Some(remove_ids) = options.remove_ids {
            self.ids.retain(|x| !remove_ids.contains(x));
        }
        self.save()
    }
}