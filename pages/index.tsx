import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Head from "next/head";
import React, { useState } from "react";
import { ImageWithTextButton } from "../components/ImageWithTextButton";
import { TabPanel } from "../components/TabPanel";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ItemButton } from "../components/ItemButton";
import {
  EQUIPMENT_TYPES,
  findItemsByEquipmentType,
  isWeaponItem,
  sumStats,
  WeaponType,
  WEAPON_TYPES,
} from "../utils/item";
import Divider from "@material-ui/core/Divider";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default function Home() {
  const [selectedEquipmentTypeIndex, setSelectedEquipmentTypeIndex] = useState(
    0
  );
  const [selectedWeaponType, setSelectedWeaponType] = useState<WeaponType>(
    WEAPON_TYPES[0]
  );
  const [selectedItemCodes, setSelectedItemCodes] = useState<Set<number>>(
    new Set()
  );

  const { t } = useTranslation();

  const stats = sumStats([...selectedItemCodes]);

  return (
    <div>
      <main>
        <Container maxWidth="xl">
          <Grid container>
            <Grid item xs={3}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {Object.keys(stats).map((k) => {
                      return (
                        <TableRow key={k}>
                          <TableCell>{t(`stats.${k}`)}</TableCell>
                          <TableCell>{stats[k]}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {[...selectedItemCodes].map((code) => (
                <ItemButton
                  key={code}
                  code={code}
                  onClick={() => {
                    setSelectedItemCodes(
                      new Set([...selectedItemCodes].filter((c) => c !== code))
                    );
                  }}
                />
              ))}
            </Grid>
            <Grid item xs={9}>
              <Tabs
                value={selectedEquipmentTypeIndex}
                onChange={(_, v) => setSelectedEquipmentTypeIndex(v)}
                variant="scrollable"
              >
                {EQUIPMENT_TYPES.map((et) => (
                  <Tab key={et} label={t(`equipmentTypes.${et}`)} wrapped />
                ))}
              </Tabs>
              {EQUIPMENT_TYPES.map((et, i) => (
                <TabPanel key={i} value={selectedEquipmentTypeIndex} index={i}>
                  <>
                    {et === "Weapon" && (
                      <>
                        <Grid container>
                          {WEAPON_TYPES.map((wt) => (
                            <Grid
                              key={wt}
                              item
                              xs={6}
                              sm={4}
                              md={3}
                              lg={2}
                              style={{ display: "flex" }}
                            >
                              <ImageWithTextButton
                                image={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/weapons/${wt}.png`}
                                text={t(`weaponTypes.${wt}`)}
                                onClick={() => setSelectedWeaponType(wt)}
                                selected={selectedWeaponType === wt}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        <Divider />
                      </>
                    )}

                    {findItemsByEquipmentType(et)
                      .filter(
                        (i) =>
                          i.itemGrade !== "Common" &&
                          (!isWeaponItem(i) ||
                            i.weaponType === selectedWeaponType)
                      )
                      .map((item) => (
                        <Grid container key={item.code}>
                          <ItemButton
                            code={item.code}
                            onClick={() => {
                              setSelectedItemCodes(
                                new Set(
                                  selectedItemCodes.has(item.code)
                                    ? [...selectedItemCodes].filter(
                                        (c) => c !== item.code
                                      )
                                    : [...selectedItemCodes, item.code]
                                )
                              );
                            }}
                            selected={selectedItemCodes.has(item.code)}
                          />
                        </Grid>
                      ))}
                  </>
                </TabPanel>
              ))}
            </Grid>
          </Grid>
          <Divider />
          {t("footer.copyright")}
        </Container>
      </main>
    </div>
  );
}
