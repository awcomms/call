use geo::geometry::Point;
use serde::{Deserialize, Serialize};
use crate::user::User;
use serde_json;

#[derive(Serialize, Deserialize)]
struct Call {
    users: Vec<User>,
    point: Point,
}

impl Call {
    fn new(user: User, lat: f64, lon: f64) -> Call {
        let point = Point::new(lat, lon);
        let users: Vec<User> = vec![user];
        Call { users, point }
    }

    fn calls(&point: Point) -> Vec<Call> {
        calls.sort_by(|a, b| {
            let a_distance = a.geodesic_distance(point);
            let b_distance = b.geodesic_distance(point);
            a_distance.partial_cmp(b_distance).unwrap()
        });
        calls
    }
}
