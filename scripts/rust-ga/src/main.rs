mod ga;
mod item_build_guide;
mod lumia_island;
use std::collections::HashMap;

use ga::*;
use item_build_guide::*;
use itertools::Itertools;
use lumia_island::*;

fn each_cons<T, F>(xs: &Vec<T>, mut f: F)
where
    T: Sized,
    F: FnMut((&T, &T)),
{
    if xs.len() > 1 {
        for i in 0..(xs.len() - 1) {
            (f)((&xs[i], &xs[i + 1]));
        }
    }
}

fn main() {
    let lumia_island = LumiaIsland::new();
    let target_item_codes_tally: HashMap<ItemCode, u32> = vec![
        "Mistilteinn",
        "Imperial Burgonet",
        "Amazoness Armor",
        "Burnished Aegis",
        "EOD Boots",
        "White Crane Fan",
    ]
    .into_iter()
    .flat_map(|name| {
        let code = ItemBuildGuide::find_item_code_by_name(name.to_string());
        ItemBuildGuide::build_requirements(&code)
    })
    .into_grouping_map_by(|(code, _)| *code)
    .fold(0u32, |acc, _, (_, count)| acc + count)
    .into_iter()
    .filter(|(code, _)| code != &401103)
    .collect();

    let locations = LumiaIsland::locations()
        .into_iter()
        .filter(|&&l| {
            lumia_island
                .check_items(l)
                .iter()
                .any(|c| target_item_codes_tally.contains_key(c))
        })
        .collect_vec();

    let fitness_func = |genes: &Vec<Gene>| {
        let mut sum = 0;
        each_cons(genes, |(g1, g2)| {
            sum +=
                LumiaIsland::distance(*locations[g1.value as usize], *locations[g2.value as usize]);
        });
        sum as i64
    };

    let valid_func = |genes: &Vec<Gene>| {
        target_item_codes_tally.iter().all(|(item_code, count)| {
            genes
                .iter()
                .filter(|g| g.value == *item_code as u64)
                .count() as u32
                >= *count
        });
        let a = true;
        a
    };

    let genes = target_item_codes_tally
        .iter()
        .flat_map(|(code, count)| {
            let mut xs = vec![];

            for _ in 0..*count {
                xs.push(Gene::new(
                    locations
                        .iter()
                        .filter(|l| lumia_island.check_items(***l).iter().any(|c| c == code))
                        .map(|l| locations.iter().position(|loc| l == loc).unwrap() as u64)
                        .collect_vec(),
                ));
            }

            xs
        })
        .collect_vec();

    let random_organism_generator = || {
        let genes = genes
            .iter()
            .map(|g| {
                let mut g = g.clone();
                g.mutate();
                g
            })
            .collect_vec();

        Organism::new(genes, &fitness_func, &valid_func)
    };

    let mut g = Generation::new(&random_organism_generator);

    for n in 0..=3000000 {
        g.step();

        if n % 10000 == 0 {
            let best = g.best_organism();
            println!(
                "[{}] {:?}, {:?}",
                n,
                best.fitness(),
                g.local_organisms_count()
            );
        }
    }

    let best = g.best_organism();

    println!(
        "{:?}",
        best.genes
            .iter()
            .map(|g| LumiaIsland::locations()
                .iter()
                .position(|l| l == locations[g.value as usize])
                .unwrap())
            .collect_vec()
    );
}
