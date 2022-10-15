use crate::handler::SendResult;
use crate::DB;
use log::error;
use sled;
use std::fmt::Debug;
use std::str;


#[macro_export]
macro_rules! dbitem {
    ($name:ident) => {
        crate::from!($name);
        impl crate::db::DbItem for $name {
            const NAME: &'static str = "$name";

            fn id(&self) -> u64 {
                self.id
            }
        }
    }
}

#[macro_export]
macro_rules! from {
    ($name:ident) => {
        impl From<sled::IVec> for $name {
            fn from(ivec: sled::IVec) -> Self {
                match std::str::from_utf8(&ivec[..]) {
                    Ok(res) => match serde_json::from_str(res) {
                        Ok(res) => res,
                        Err(e) => {
                            log::error!("$name::try_from->from_str({:#?})->{:#?}: {}", ivec, res, e);
                            panic!()
                        }
                    },
                    Err(e) => {
                        log::error!("$name::try_from({:#?}): {}", ivec, e);
                        panic!()
                    }
                }
            }
        }
        impl From<$name> for sled::IVec {
            fn from(v: $name) -> Self {
                match serde_json::to_string(&v) {
                    Ok(res) => sled::IVec::from(res.as_bytes()),
                    Err(e) => {
                        log::error!("sled::IVec::try_from({:#?}): {}", v, e);
                        panic!()
                    }
                }
            }
        }
    };
}

fn first_key(tree: &sled::Tree) -> SendResult<Option<sled::IVec>> {
    match tree.first() {
        Err(e) => {
            error!("DbItem::first(): {}", e);
            Err(None)
        }
        Ok(res) => {
            if let Some(pair) = res {
                Ok(Some(pair.0))
            } else {
                Ok(None)
            }
        }
    }
}

fn last_key(tree: &sled::Tree) -> SendResult<Option<sled::IVec>> {
    match tree.last() {
        Err(e) => {
            error!("DbItem::last(): {}", e);
            Err(None)
        }
        Ok(res) => {
            if let Some(pair) = res {
                Ok(Some(pair.0))
            } else {
                Ok(None)
            }
        }
    }
}

fn sled_id(id: u64) -> [u8; 8] {
    id.to_le_bytes()
}

pub fn new_id() -> SendResult<u64> {
    match DB.generate_id() {
        Ok(id) => Ok(id),
        Err(e) => {
            error!("db::new_id(): {}", e);
            Err(None)
        }
    }
}
pub trait DbItem: Debug + Clone + Sized + From<sled::IVec> + Into<sled::IVec> {
    const NAME: &'static str;

    fn id(&self) -> u64;

    fn after_drop(&self) -> SendResult<()> {
        Ok(())
    }

    fn tree() -> SendResult<sled::Tree> {
        match DB.open_tree(Self::NAME) {
            Ok(tree) => Ok(tree),
            Err(e) => {
                error!("DbItem::tree error: {}", e);
                Err(None)
            }
        }
    }

    fn sled_id(&self) -> [u8; 8] {
        sled_id(self.id())
    }

    fn get(id: u64) -> SendResult<Self> {
        if let Ok(tree) = Self::tree() {
            match tree.get(id.to_le_bytes()) {
                Err(e) => {
                    error!("DbItem::get error on {}: {}", Self::NAME, e);
                    Err(None)
                }
                Ok(v) => {
                    if let Some(v) = v {
                        Ok(Self::from(v))
                    } else {
                        Err(Some("did not find specified item with specified id"))
                    }
                }
            }
        } else {
            Err(None)
        }
    }

    fn all() -> SendResult<Vec<Self>> {
        let tree = Self::tree()?;
        println!("{} length {}", Self::NAME, tree.len());
        if let Some(first_key) = first_key(&tree)? {
            if let Some(last_key) = last_key(&tree)? {
                Ok(tree
                    .range(first_key.as_ref()..last_key.as_ref())
                    .filter_map(|entry| match entry {
                        Ok(entry) => Some(Self::from(entry.1)),
                        Err(e) => {
                            error!("DbItem::all tree.range.filter_map `entry` error: {}", e);
                            None
                        }
                    })
                    .collect::<Vec<Self>>())
            } else {
                Ok(Vec::<Self>::new())
            }
        } else {
            Ok(Vec::<Self>::new())
        }
    }

    fn drop(&self) -> SendResult<()> {
        let tree = Self::tree()?;
        if let Err(e) = tree.remove(sled_id(self.id())) {
            error!("DbItem::drop err for {}: {}", self.id(), e);
            Err(None)
        } else {
            self.after_drop()?;
            Ok(())
        }
    }

    fn drop_items(items: Vec<Self>) -> SendResult<()> {
        for item in items {
            item.drop()?
        }
        Ok(())
    }

    fn drop_all() -> SendResult<()> {
        for i in Self::all()? {
            i.drop()?
        }
        Ok(())
    }

    fn save(&self) -> SendResult<Self> {
        if let Ok(tree) = Self::tree() {
            match tree.insert(self.sled_id(), self.clone()) {
                Ok(_) => Ok(self.clone()),
                Err(e) => {
                    error!("DbItem save error on {} {}: {}", Self::NAME, self.id(), e);
                    Err(None)
                }
            }
        } else {
            Err(None)
        }
    }
}
