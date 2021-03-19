use indicatif::ProgressBar;
use indicatif::ProgressStyle;
use pathfinding::prelude::astar;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs::File;
use std::io::BufReader;
use std::io::Write;
use std::sync::mpsc;
use std::sync::Arc;
use std::thread;

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
    area_name: String,
}

fn load_object_locations() -> Result<Vec<ObjectLocation>, Box<dyn Error>> {
    let file = File::open("../../map/object_locations.json")?;
    let reader = BufReader::new(file);
    let object_locations: Vec<ObjectLocation> = serde_json::from_reader(reader)?;

    Ok(object_locations)
}

fn load_walls() -> Result<Vec<Vec<u8>>, Box<dyn Error>> {
    let file = File::open("../../map/walls.json")?;
    let reader = BufReader::new(file);
    let walls: Vec<Vec<u8>> = serde_json::from_reader(reader)?;

    Ok(walls)
}

fn run() -> Result<(), Box<dyn Error>> {
    let walls = Arc::new(load_walls()?);
    let object_locations = load_object_locations()?;
    let len = object_locations.len();
    let object_locations = Arc::new(object_locations);

    let pb = ProgressBar::new(object_locations.len().pow(2) as u64);
    pb.set_style(ProgressStyle::default_bar().template(
        "{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] ({pos}/{len}, ETA {eta})",
    ));

    let mut file = File::create("../../map/distance.csv")?;

    for i in 0..len {
        let mut children = vec![];
        let (tx, rx) = mpsc::channel();

        for j in 0..len {
            let object_locations = Arc::clone(&object_locations);
            let walls = Arc::clone(&walls);
            let thread_tx = tx.clone();

            children.push(thread::spawn(move || {
                if i != j {
                    let start_loc = &object_locations[i];
                    let goal_loc = &object_locations[j];
                    let start = Pos(start_loc.x as i32, start_loc.y as i32);
                    let goal = Pos(goal_loc.x as i32, goal_loc.y as i32);

                    let result = astar(
                        &start,
                        |p| p.successors(&walls),
                        |p| p.distance(&goal),
                        |p| *p == goal,
                    )
                    .unwrap();

                    let cost = result.1;
                    thread_tx
                        .send(vec![
                            start.0 as u32,
                            start.1 as u32,
                            goal.0 as u32,
                            goal.1 as u32,
                            cost,
                        ])
                        .unwrap();
                }
            }));
        }

        for _ in 1..len {
            let result: Vec<String> = rx.recv()?.iter().map(|x| x.to_string()).collect();

            writeln!(file, "{}", result.join(","))?;

            pb.inc(1);
        }

        for child in children {
            let _ = child.join();
        }
    }

    Ok(())
}

fn main() {
    run().unwrap()
}
