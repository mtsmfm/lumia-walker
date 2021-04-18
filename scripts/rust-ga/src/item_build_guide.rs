use crate::lumia_island::ItemCode;
use once_cell::sync::OnceCell;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Item {
    code: ItemCode,
    name: String,
    stackable: u32,
    initial_count: u32,
    make_material1: ItemCode,
    make_material2: ItemCode,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LocaleCommon {
    items: HashMap<u32, String>,
}

pub struct ItemBuildGuide {}
impl ItemBuildGuide {
    pub fn find_item_code_by_name(name: String) -> &'static ItemCode {
        ItemBuildGuide::en_locale_common()
            .items
            .iter()
            .find(|(_, n)| *n == &name)
            .unwrap()
            .0
    }

    pub fn build_requirements(code: &ItemCode) -> HashMap<ItemCode, u32> {
        match ItemBuildGuide::item_build_tree().get(code) {
            Some((0, 0)) => vec![(*code, 1)].into_iter().collect(),
            Some((x, y)) => ItemBuildGuide::build_requirements(x)
                .into_iter()
                .chain(ItemBuildGuide::build_requirements(y))
                .collect(),
            None => panic!("error"),
        }
    }

    fn item_build_tree() -> &'static HashMap<ItemCode, (ItemCode, ItemCode)> {
        static INSTANCE: OnceCell<HashMap<ItemCode, (ItemCode, ItemCode)>> = OnceCell::new();
        INSTANCE.get_or_init(|| {
            let data: Vec<Vec<Item>> = vec![
                serde_json::from_str(&include_str!("../../../data/item_armor.json")).unwrap(),
                serde_json::from_str(&include_str!("../../../data/item_consumable.json")).unwrap(),
                serde_json::from_str(&include_str!("../../../data/item_misc.json")).unwrap(),
                serde_json::from_str(&include_str!("../../../data/item_special.json")).unwrap(),
                serde_json::from_str(&include_str!("../../../data/item_weapon.json")).unwrap(),
            ];

            data.into_iter()
                .flatten()
                .map(|item: Item| (item.code, (item.make_material1, item.make_material2)))
                .collect()
        })
    }

    fn en_locale_common() -> &'static LocaleCommon {
        static INSTANCE: OnceCell<LocaleCommon> = OnceCell::new();
        INSTANCE.get_or_init(|| {
            serde_json::from_str(&include_str!("../../../public/locales/en/common.json")).unwrap()
        })
    }
}
