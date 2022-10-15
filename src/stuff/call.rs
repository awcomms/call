use std::collections::HashSet;

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
    location: Option<Location>
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SetOptions {
    name: Option<String>,
    tags: Option<Vec<String>>,
    location: Option<Location>,
    add_ids: Option<Vec<String>>,
    remove_ids: Option<Vec<String>>
}

crate::dbitem!(Call);
crate::dbapi!(Call);

impl DbTags for Call {
    fn tags(&self) -> Tags {
        self.tags.clone()
    }
}

impl Auth for Call {

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
        print!("options: {:#?}", &options);
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

    fn search(options: SearchOptions) -> SendResult<Vec<Self>> {
        if let Some(tags) = options.tags {
            <Self as DbTags>::sort(&tags)
        } else {
            <Self as DbItem>::all()
        }
    }
}