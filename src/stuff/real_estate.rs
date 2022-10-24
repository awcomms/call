use serde_json::{Value, from_str};

pub struct Listing {
    id: u64,
    data: String
}

#[macro_export]
macro_rules! attr {
    ($get:ident, $set:ident) => SendResult<()> {
        fn $set(&self, value) {
            let json = self.json();
            json[$get] = value;
            self.data = json.to_string();
            self.save()
        }

        fn $get(&self, value) => SendResult<&Value> {
            let json = self.json();
            let value = json[&get]
        }
    }
}

impl Listing {
    fn json(&self) -> Value {
        from_str(self.data).unwrap()
    }
}