use itertools::Itertools;
use rand::prelude::*;

pub struct Generation<'a> {
    random_organism_generator: &'a dyn Fn() -> Organism<'a>,
    local_organisms: Vec<Organism<'a>>,
}

impl<'a> Generation<'a> {
    pub fn new(random_organism_generator: &'a dyn Fn() -> Organism<'a>) -> Generation<'a> {
        Generation {
            random_organism_generator,
            local_organisms: vec![(random_organism_generator)()],
        }
    }

    pub fn step(&mut self) {
        while self.local_organisms.len() < 2 {
            self.local_organisms
                .push((self.random_organism_generator)());
        }

        let mut rng = thread_rng();
        self.local_organisms.shuffle(&mut rng);

        let mut p1 = self.local_organisms.pop().unwrap();
        let mut p2 = self.local_organisms.pop().unwrap();

        if p1.fitness() > p2.fitness() {
            let temp = p1;
            p1 = p2;
            p2 = temp;
        }

        let (mut c1, mut c2) = p1.crossover(&p2);

        if rng.gen_bool(0.5) {
            c1.mutate();
        } else {
            c2.mutate();
        }

        if c1.fitness() > c2.fitness() {
            let temp = c1;
            c1 = c2;
            c2 = temp;
        }

        if c2.fitness() <= p1.fitness() {
            self.local_organisms.push(p1);
            self.local_organisms.push(c1);
            self.local_organisms.push(c2);
        } else if c1.fitness() > p2.fitness() {
            self.local_organisms.push(p1);
        } else if c1.fitness() > p1.fitness() {
            self.local_organisms.push(p1);
            self.local_organisms.push(c1);
        } else {
            self.local_organisms.push(c1);
            self.local_organisms
                .push((self.random_organism_generator)());
        }
    }

    pub fn best_organism(&self) -> &Organism {
        self.local_organisms
            .iter()
            .min_by_key(|o| o.fitness())
            .unwrap()
    }

    pub fn local_organisms_count(&self) -> usize {
        self.local_organisms.len()
    }
}

pub struct Gene {
    candidates: Vec<u64>,
    pub value: u64,
}

impl Clone for Gene {
    fn clone(&self) -> Self {
        Gene {
            candidates: self.candidates.to_vec(),
            value: self.value,
        }
    }
}

pub struct Organism<'a> {
    pub genes: Vec<Gene>,
    fitness_func: &'a dyn Fn(&Vec<Gene>) -> i64,
    valid_func: &'a dyn Fn(&Vec<Gene>) -> bool,
}

impl std::fmt::Debug for Organism<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Organism")
            .field("genes", &self.genes.iter().map(|g| g.value).collect_vec())
            .finish()
    }
}

impl Clone for Organism<'_> {
    fn clone(&self) -> Self {
        Organism {
            genes: self.genes.to_vec(),
            fitness_func: self.fitness_func.clone(),
            valid_func: self.valid_func.clone(),
        }
    }
}

impl<'a> Organism<'a> {
    pub fn new(
        genes: Vec<Gene>,
        fitness_func: &'a dyn Fn(&Vec<Gene>) -> i64,
        valid_func: &'a dyn Fn(&Vec<Gene>) -> bool,
    ) -> Organism<'a> {
        Organism {
            genes,
            fitness_func,
            valid_func,
        }
    }

    pub fn fitness(&self) -> i64 {
        (self.fitness_func)(&self.genes)
    }

    fn apply_new_gene(&mut self, i: usize, gene: &Gene) {
        let j = self
            .genes
            .iter()
            .position(|g| g.candidates == gene.candidates)
            .unwrap();

        self.genes.swap(i, j);
        self.genes[i].value = gene.value;
    }

    pub fn crossover(&self, other: &Organism<'a>) -> (Organism<'a>, Organism<'a>) {
        let len = self.genes.len();

        let mut rng = thread_rng();

        let mut c1 = self.clone();
        let mut c2 = other.clone();

        let cut_count = rng.gen_range(1..(len / 2));

        for _ in 0..cut_count {
            let a = rng.gen_range(0..len);
            let b = rng.gen_range(a..len);

            for x in a..=b {
                let old_c1 = c1.genes[x].clone();
                let old_c2 = c2.genes[x].clone();
                c1.apply_new_gene(x, &old_c2);
                c2.apply_new_gene(x, &old_c1);
            }
        }

        (c1, c2)
    }

    pub fn mutate(&mut self) {
        let mut rng = thread_rng();
        let len = self.genes.len();
        let amount = (0..len).choose(&mut rng).unwrap();

        for i in (0..len).choose_multiple(&mut rng, amount) {
            let gene = self.genes.get_mut(i).unwrap();
            gene.mutate();
        }
    }
}

impl Gene {
    pub fn new(candidates: Vec<u64>) -> Gene {
        let value = candidates[0];

        Gene { candidates, value }
    }

    pub fn mutate(&mut self) {
        let mut rng = thread_rng();
        self.value = *self.candidates.choose(&mut rng).unwrap();
    }
}
