use crate::{handler::SendResult, db::DbItem};
use eddie::DamerauLevenshtein;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use log;

pub trait DbTags: DbItem {
    fn tags(&self) -> Tags;
    fn sort(tags: &Vec<String>) -> SendResult<Vec<Self>> {
        let mut _d = Self::all()?;
        _d.sort_by(|a, b| a.tags().score(tags).cmp(&b.tags().score(tags)));
        Ok(_d)
    }
}

#[derive(Default, Serialize, Deserialize, Debug, Clone)]
pub struct Tags {
    val: String,
    all: HashSet<String>,
}

impl Tags {
    pub fn new() -> Tags {
        Tags {
            val: String::new(),
            all: HashSet::new(),
        }
    }

    pub fn val(&self) -> &str {
        &*self.val
    }

    pub fn set(&mut self, values: &Vec<String>) {
        let mut all: HashSet<String> = HashSet::new();
        for s in values {
            all.insert(s.to_string());
        }
        self.all = all;
        self.update_val();
    }

    pub fn update(&mut self, values: Vec<String>) {
        for s in &values {
            self.all.insert(s.to_string());
        }
        self.update_val();
    }

    pub fn score(&self, values: &Vec<String>) -> usize {
        let dlev = DamerauLevenshtein::new();
        let mut tags = Tags::new();
        tags.set(values);
        log::debug!("tags.val {}, self.val {}", &tags.val, &self.val);
        let score = dlev.distance(&tags.val, &self.val);
        log::debug!("score - values: {:#?}, score: {}", values, &score);
        score
    }

    fn update_val(&mut self) {
        let mut val = String::new();
        for tag in &self.all {
            val += tag;
        }
        self.val = val;
    }
}
