use bytes::Buf;
use csv;
use itertools::Itertools;
use once_cell::sync::{Lazy, OnceCell};
use rand::prelude::*;
use serde::Deserialize;
use std::collections::HashMap;
use std::io::Cursor;
use std::mem::replace;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ObjectLocation {
    x: u32,
    y: u32,
    kind: String,
    area_code: u32,
}

#[derive(Debug, Deserialize)]
struct DistanceRow {
    x1: u32,
    y1: u32,
    x2: u32,
    y2: u32,
    distance: u32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ItemSpawn {
    code: u32,
    name: String,
    area_type: String,
    area_code: u32,
    item_code: u32,
    drop_point: String,
    drop_count: u32,
}

pub type ItemCode = u32;
type AreaCode = u32;

static _WALLS: Lazy<Vec<Vec<u8>>> =
    Lazy::new(|| serde_json::from_str(&include_str!("../../../map/walls.json")).unwrap());

static OBJECT_LOCATIONS: Lazy<Vec<ObjectLocation>> = Lazy::new(|| {
    serde_json::from_str(&include_str!("../../../map/object_locations.json")).unwrap()
});

static DISTANCES: Lazy<HashMap<((u32, u32), (u32, u32)), u32>> = Lazy::new(|| {
    let buf = Cursor::new(include_bytes!("../../../map/distance.csv")).reader();
    let mut reader = csv::Reader::from_reader(buf);
    reader.set_headers(csv::StringRecord::from(vec![
        "x1", "y1", "x2", "y2", "distance",
    ]));
    reader
        .deserialize()
        .map(|row| {
            let row: DistanceRow = row.unwrap();
            (((row.x1, row.y1), (row.x2, row.y2)), row.distance)
        })
        .collect()
});

static ITEM_SPAWN: Lazy<Vec<ItemSpawn>> =
    Lazy::new(|| serde_json::from_str(&include_str!("../../../data/item_spawn.json")).unwrap());

static ITEM_SPAWN_BY_AREA_CODE: Lazy<HashMap<AreaCode, Vec<&ItemSpawn>>> =
    Lazy::new(|| ITEM_SPAWN.iter().into_group_map_by(|is| is.area_code));

static ITEM_BOX_COUNT_BY_AREA_CODE: Lazy<HashMap<AreaCode, u32>> = Lazy::new(|| {
    OBJECT_LOCATIONS
        .iter()
        .filter(|l| l.kind == "item")
        .into_grouping_map_by(|l| l.area_code)
        .fold(0, |acc, _, _| acc + 1)
});

static OBJECT_LOCATIONS_BY_AREA_CODE: Lazy<HashMap<AreaCode, Vec<&ObjectLocation>>> =
    Lazy::new(|| OBJECT_LOCATIONS.iter().into_group_map_by(|l| l.area_code));

type Loc = (u32, u32);

fn slice_evenly<I: Clone>(xs: Vec<I>, n: usize) -> Vec<Vec<I>> {
    let mut result = vec![vec![]; n];
    let mut i = 0;

    for x in xs.into_iter() {
        i += 1;
        result[(i - 1) % n].push(x);
    }

    result
}
#[derive(Debug)]
pub struct LumiaIsland {
    item_codes_by_location: HashMap<Loc, Vec<ItemCode>>,
}

impl LumiaIsland {
    pub fn locations() -> &'static Vec<Loc> {
        static INSTANCE: OnceCell<Vec<Loc>> = OnceCell::new();
        INSTANCE.get_or_init(|| {
            OBJECT_LOCATIONS
                .iter()
                .map(|object_location| (object_location.x, object_location.y))
                .collect()
        })
    }

    pub fn distance(i: Loc, j: Loc) -> &'static u32 {
        if i == j {
            return &0u32;
        }
        DISTANCES.get(&(i, j)).unwrap()
    }

    pub fn new() -> LumiaIsland {
        let generator = LumiaIslandGenerator {};
        generator.generate()
    }

    pub fn check_items(&self, i: Loc) -> &Vec<ItemCode> {
        self.item_codes_by_location.get(&i).unwrap()
    }
}

#[derive(Debug)]
struct LumiaIslandGenerator {}
impl LumiaIslandGenerator {
    fn generate(&self) -> LumiaIsland {
        let mut rng = thread_rng();
        let item_codes_by_location: HashMap<Loc, Vec<ItemCode>> = ITEM_BOX_COUNT_BY_AREA_CODE
            .iter()
            .flat_map(|(area_code, item_box_count)| {
                let item_codes = ITEM_SPAWN_BY_AREA_CODE
                    .get(&area_code)
                    .unwrap()
                    .iter()
                    .flat_map(|is| vec![is.item_code].repeat(is.drop_count as usize))
                    .collect::<Vec<_>>();

                loop {
                    let mut item_codes = item_codes.to_vec();
                    item_codes.shuffle(&mut rng);

                    let mut boxes = slice_evenly(item_codes, *item_box_count as usize);

                    if boxes.iter().any(|b| {
                        b.iter()
                            .into_grouping_map_by(|x| *x)
                            .fold(0, |acc, _, _| acc + 1)
                            .iter()
                            .any(|(_, v)| *v > 2)
                    }) {
                        let mut i = 0;

                        return OBJECT_LOCATIONS_BY_AREA_CODE
                            .get(&area_code)
                            .unwrap()
                            .into_iter()
                            .map(|object_location| {
                                let loc: Loc = (object_location.x, object_location.y);

                                let codes = match object_location.kind.as_str() {
                                    "item" => {
                                        i += 1;
                                        replace(&mut boxes[i - 1], Default::default())
                                    }
                                    "potato" => vec![302102],
                                    "stone" => vec![112101],
                                    "branch" => vec![108101],
                                    "security console" => vec![],
                                    "hyperloop" => vec![],
                                    "water" => vec![301203],
                                    "tree of life" => vec![401208],
                                    "carp" => vec![302109],
                                    _ => panic!("error"),
                                };

                                (loc, codes)
                            })
                            .collect::<Vec<_>>();
                    }
                }
            })
            .collect();

        LumiaIsland {
            item_codes_by_location,
        }
    }
}
