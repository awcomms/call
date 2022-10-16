use crate::handler::SendResult;
use crate::{
    db::{new_id, DbItem},
    handler::send_res,
    tag::{DbTags, Tags},msg::Sender,
    util::get_from_claims,
    DOMAIN, SECRET,
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use hmac::{Hmac, Mac};
use jwt::{self, SignWithKey, VerifyWithKey};
use log::error;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string};
use sha2::Sha256;
use std::{self, collections::BTreeMap};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    id: u64,
    tags: Tags,
    email: String,
    username: String,
    password_hash: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SetOptions {
    email: Option<String>,
    username: Option<String>,
    tags: Option<Vec<String>>,
}

fn key() -> SendResult<Hmac<Sha256>> {
    match Hmac::<Sha256>::new_from_slice(SECRET.as_bytes()) {
        Ok(key) => Ok(key),
        Err(e) => {
            error!("user::key Hmac::new_from_slice : {}", e);
            Err(None)
        }
    }
}

impl User {
    pub fn new(email: String, username: String, password: String) -> SendResult<Self> {
        match Self::all()?.into_iter().find(|u| u.username == username) {
            Some(_) => Err(Some("user with specified username already exists".to_string())),
            None => Self {
                id: new_id()?,
                email,
                username,
                tags: Tags::new(),
                password_hash: Self::password_hash(password)?,
            }
            .save(),
        }
    }

    pub fn auth_set(token: &str, options: SetOptions) -> SendResult<Self> {
        Self::auth(token)?.set(options)
    }

    pub fn set(&mut self, options: SetOptions) -> SendResult<Self> {
        if let Some(email) = options.email {
            self.email = email
        };
        if let Some(username) = options.username {
            self.username = username
        };
        if let Some(tags) = options.tags {
            self.tags.set(&tags)
        };
        self.save()
    }

    fn auth_set_password(token: &str, password: String) -> SendResult<Self> {
        Self::auth(token)?.set_password(password)
    }

    fn auth_reset_password(token: &str, password: String) -> SendResult<Self> {
        Self::get_by_username(&get_from_claims(Self::check_token(token)?, "username")?)?
            .set_password(password)
    }

    fn set_password(&mut self, password: String) -> SendResult<Self> {
        if let Ok(v) = Self::password_hash(password) {
            self.password_hash = v;
            Ok(self.clone())
        } else {
            Err(None)
        }
    }

    fn password_hash(password: String) -> SendResult<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        match argon2.hash_password(password.as_bytes(), &salt) {
            Ok(hash) => Ok(hash.to_string()),
            Err(e) => {
                error!("User::password_hash: {}", e);
                Err(None)
            }
        }
    }

    fn send_password_reset_email(username: &str) -> SendResult<String> {
        User::get_by_username(&username)?;
        Self::send_email(
            &User::get_by_username(username)?.email,
            format!(
                "use this link to reset your account with username {}: {}",
                username,
                format!(
                    "{}/reset_password?token={}",
                    DOMAIN.to_string(),
                    User::token_with_username(username)?
                )
            )
            .as_str(),
        )
    }

    fn send_email(_email: &str, _content: &str) -> SendResult<String> {
        todo!();
    }

    fn get_by_username(username: &str) -> SendResult<Self> {
        match User::all()?.into_iter().find(|u| u.username == username) {
            Some(user) => Ok(user),
            None => Err(Some("user with specified username not found".to_string())),
        }
    }

    fn generate_token<K, V>(claim_pairs: Vec<(K, V)>) -> SendResult<String>
    where
        K: std::cmp::Ord + std::fmt::Debug + Serialize + Clone,
        V: std::cmp::Ord + std::fmt::Debug + Serialize + Clone,
    {
        let mut claims = BTreeMap::new();
        for pair in &claim_pairs {
            let k = pair.0.clone();
            let v = pair.1.clone();
            claims.insert(k, v);
        }
        match claims.sign_with_key(&key()?) {
            Ok(v) => Ok(v),
            Err(e) => {
                error!("User::generate_token error({:#?}): {}", claim_pairs, e);
                Err(None)
            }
        }
    }

    fn check_token(token: &str) -> SendResult<BTreeMap<String, String>> {
        match token.verify_with_key(&key()?) {
            Ok(claims) => Ok(claims),
            Err(e) => {
                error!("User::check_token({}): {}", token, e);
                Err(Some("invalid token".to_string()))
            }
        }
    }

    fn username_from_token(token: &str) -> SendResult<String> {
        match User::check_token(token)?.get("username") {
            Some(username) => Ok(username.clone()),
            None => Err(Some("invalid token".to_string())),
        }
    }

    fn token_with_username(username: &str) -> SendResult<String> {
        User::generate_token(vec![("username", username)])
    }

    fn token_with_id(u: &User) -> SendResult<String> {
        User::generate_token(vec![("id", u.id().to_string())])
    }

    fn check_password(&self, password: &str) -> Result<bool, ()> {
        match PasswordHash::new(&self.password_hash) {
            Ok(hash) => Ok(Argon2::default()
                .verify_password(password.as_bytes(), &hash)
                .is_ok()),
            Err(e) => {
                error!("User::check_password: {}", e);
                Err(())
            }
        }
    }

    fn token(username: &str, password: &str) -> SendResult<String> {
        match User::all()?.into_iter().find(|u| {
            println!("{}, {}", u.username, username);
            u.username == username
        }) {
            Some(u) => match u.check_password(password) {
                Ok(res) => {
                    if res {
                        User::token_with_id(&u)
                    } else {
                        Err(Some("wrong password".to_string()))
                    }
                }
                Err(()) => Err(None),
            },
            None => Err(Some("did not find user with specified username".to_string())),
        }
    }

    pub fn auth(token: &str) -> SendResult<Self> {
        match get_from_claims(User::check_token(token)?, "id")?.parse::<u64>() {
            Ok(id) => User::get(id),
            Err(e) => {
                error!("ayah Favor: {}", e);
                Err(Some("error parsing authentication token".to_string()))
            }
        }

        // match claims.get("id") {
        //     Some(id_res) => match id_res.parse::<u64>() {
        //         Ok(id) => User::get(id),
        //         Err(e) => {
        //             error!("User::auth({}): {}", token, e);
        //             Err(Some("invalid token".to_string()))
        //         }
        //     },
        //     None => Err(Some("invalid token".to_string())),
        // }
    }
    
    pub fn auth_option(token: &Option<String>) -> SendResult<Self> {
        if let Some(token) = token {
            User::auth(&token)
        } else {
            Err(Some("auth token required, none provided".to_string()))
        }
    }

    pub fn act(msg_id: &str, sender: &Sender, action: UserAction) {
        match action {
            UserAction::Search(tags) => send_res(msg_id, sender, <Self as DbTags>::sort(&tags)),
            UserAction::Auth(token) => send_res(msg_id, sender, Self::auth(&token)),
            UserAction::New {
                username,
                email,
                password,
            } => send_res(msg_id, sender, Self::new(email, username, password)),
            UserAction::Set { token, options } => {
                send_res(msg_id, sender, Self::auth_set(&token, options))
            }
            UserAction::CheckPasswordResetToken(token) => {
                send_res(msg_id, sender, Self::username_from_token(&token))
            }
            UserAction::SendPasswordResetToken(username) => {
                send_res(msg_id, sender, Self::send_password_reset_email(&username))
            }
            UserAction::ResetPassword { token, password } => {
                send_res(msg_id, sender, Self::auth_reset_password(&token, password))
            }
            UserAction::SetPassword { token, password } => {
                send_res(msg_id, sender, Self::auth_set_password(&token, password))
            }
            UserAction::Token { username, password } => {
                send_res(msg_id, sender, Self::token(&username, &password))
            }
        }
    }
}

impl From<sled::IVec> for User {
    fn from(ivec: sled::IVec) -> Self {
        match std::str::from_utf8(&ivec[..]) {
            Ok(res) => match from_str(res) {
                Ok(res) => res,
                Err(e) => {
                    error!("User::try_from->from_str({:#?})->{:#?}: {}", ivec, res, e);
                    panic!()
                }
            },
            Err(e) => {
                error!("User::try_from({:#?}): {}", ivec, e);
                panic!()
            }
        }
    }
}

impl From<User> for sled::IVec {
    fn from(v: User) -> Self {
        match to_string(&v) {
            Ok(res) => sled::IVec::from(res.as_bytes()),
            Err(e) => {
                error!("sled::IVec::try_from({:#?}): {}", v, e);
                panic!()
            }
        }
    }
}

impl DbTags for User {
    fn tags(&self) -> Tags {
        let mut tags = self.tags.clone();
        tags.update(vec![self.username.clone()]);
        tags
    }
}

impl DbItem for User {
    const NAME: &'static str = "user";

    fn id(&self) -> u64 {
        self.id
    }
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum UserAction {
    Token {
        username: String,
        password: String,
    },
    Search(Vec<String>),
    New {
        username: String,
        email: String,
        password: String,
    },
    Set {
        token: String,
        options: SetOptions,
    },
    Auth(String),
    ResetPassword {
        token: String,
        password: String,
    },
    CheckPasswordResetToken(String),
    SendPasswordResetToken(String),
    SetPassword {
        token: String,
        password: String,
    },
}
