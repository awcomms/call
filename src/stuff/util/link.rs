use crate::db::DbItem;
use crate::handler::SendResult;
use log::error;
pub trait Link: DbItem {
    type Left: DbItem;
    type Right: DbItem;

    fn left(&self) -> u64;
    fn right(&self) -> u64;

    fn new(right: &Self::Right, left: &Self::Left) -> SendResult<Self>;

    fn get_or_new(right: &Self::Right, left: &Self::Left) -> SendResult<Self> {
        match <Self as Link>::get_some(right, left) {
            Err(e) => Err(e),
            Ok(v) => {
                if let Some(pair) = v {
                    Ok(pair)
                } else {
                    Self::new(right, left)
                }
            }
        }
    }

    fn rights(left: &Self::Left) -> SendResult<Vec<Self::Right>> {
        Ok(Self::all()?
            .into_iter()
            .filter_map(move |v| {
                if v.left() == left.id() {
                    match Self::Right::get(v.right()) {
                        Ok(right) => Some(right),
                        Err(e) => {
                            error!("Self::rights({:#?}): {:#?}", left, e);
                            None
                        } //TODO-td_error-td_accurate
                    }
                } else {
                    None
                }
            })
            .collect::<Vec<Self::Right>>())
    }

    fn lefts(right: &Self::Right) -> SendResult<Vec<Self::Left>> {
        Ok(Self::all()?
            .into_iter()
            .filter_map(move |v| {
                if v.right() == right.id() {
                    match Self::Left::get(v.left()) {
                        Ok(left) => Some(left),
                        Err(e) => {
                            error!("Self::get_lefts({:#?}): {:#?}", right, e);
                            None
                        } //TODO-td_error-td_accurate
                    }
                } else {
                    None
                }
            })
            .collect::<Vec<Self::Left>>())
    }

    fn for_left(left: &Self::Left) -> SendResult<Vec<Self>> {
        Ok(Self::all()?
            .into_iter()
            .filter(|v| v.left() == left.id())
            .collect::<Vec<Self>>())
    }

    fn for_right(right: &Self::Right) -> SendResult<Vec<Self>> {
        Ok(Self::all()?
            .into_iter()
            .filter(|v| v.right() == right.id())
            .collect::<Vec<Self>>())
    }

    fn get_some(right: &Self::Right, left: &Self::Left) -> SendResult<Option<Self>> {
        Ok(Self::all()?
            .into_iter()
            .find(|v| v.right() == right.id() && v.left() == left.id()))
    }

    fn get(right: &Self::Right, left: &Self::Left) -> SendResult<Self> {
        match <Self as Link>::get_some(right, left)? {
            Some(v) => Ok(v),
            None => Err(Some(format!(
                "no link exists between {} {} and {} {}",
                <Self::Right as DbItem>::NAME,
                right.id(),
                <Self::Left as DbItem>::NAME,
                left.id()
            ))),
        }
    }
}
