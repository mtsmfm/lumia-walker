mod utils;

use pathfinding::prelude::astar;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
struct Pos(i32, i32);

impl Pos {
    fn distance(&self, other: &Pos) -> u32 {
        (((self.0 - other.0).pow(2) + (self.1 - other.1).pow(2)) as f32).sqrt() as u32
    }

    fn successors(&self, walls: &Vec<Vec<u8>>) -> Vec<(Pos, u32)> {
        let &Pos(x, y) = self;
        vec![
            Pos(x + 1, y + 1),
            Pos(x + 1, y),
            Pos(x + 1, y - 1),
            Pos(x, y + 1),
            Pos(x, y - 1),
            Pos(x - 1, y + 1),
            Pos(x - 1, y),
            Pos(x - 1, y - 1),
        ]
        .into_iter()
        .filter(|p| {
            let x = p.0;
            let y = p.1;

            x >= 0 && y >= 0 && walls[y as usize][x as usize] == 0
        })
        .map(|p| (p, 1))
        .collect()
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ObjectLocation {
    x: u32,
    y: u32,
    kind: String,
    area_code: u32,
}

const OBJECT_LOCATIONS_JSON: &str = include_str!("../../map/object_locations.json");
fn load_object_locations() -> Vec<ObjectLocation> {
    serde_json::from_str(&OBJECT_LOCATIONS_JSON).unwrap()
}

const WALLS_JSON: &str = include_str!("../../map/walls.json");
fn load_walls() -> Vec<Vec<u8>> {
    serde_json::from_str(&WALLS_JSON).unwrap()
}

#[wasm_bindgen]
pub fn calcRoute(i: usize, j: usize) -> Vec<u32> {
    let object_locations = load_object_locations();
    let walls = load_walls();

    let start_loc = &object_locations[i];
    let goal_loc = &object_locations[j];
    let start = Pos(start_loc.x as i32, start_loc.y as i32);
    let goal = Pos(goal_loc.x as i32, goal_loc.y as i32);

    let mut result = astar(
        &start,
        |p| p.successors(&walls),
        |p| p.distance(&goal),
        |p| *p == goal,
    )
    .unwrap();

    result
        .0
        .iter_mut()
        .flat_map(|p| vec![p.0 as u32, p.1 as u32])
        .collect()
}
