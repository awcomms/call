use self::handler::SendResult;
use serde::{Serialize, Deserialize};
use std::{collections::BTreeMap};

pub mod handler;
pub mod crud;
pub mod link;
pub mod msg;
pub mod tag;
pub mod db;

pub fn get_from_claims(claims: BTreeMap<String, String>, key: &str) -> SendResult<String> {
    match claims.get(key) {
        Some(v) => Ok(v.clone()),
        None => Err(Some("invalid token")),
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Location {
    lat: f64,
    lon: f64
}