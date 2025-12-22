# RimWorld 外星人种族数据报告

> **数据源**: D:/Games/1_RimworldHistorySaveAndMods/Mod/Race-Stats-Extractor/Mods
>
> **输出面板**: 完整面板[×] 主要面板[√] 补面板[×] 变化面板[√] 自定义面板[×]
>
> **额外内容**: 种族特性[√] 异种胚清单[√] 异种胚绑定状况[√]
>
> **自动分割**: 开启(行150/列15)   **默认值列**: 开启 **仅输出表中种族**: 开启
>
> **默认值处理**: NON_DEFAULT (隐藏默认值,将等同于默认值的数据填充为`-*`)
>
> **基因计算模式**: GENE_FULL (原始值/补丁值+基因修正,输出原始值的同时应用基因补丁及基因修正)
>
> **注意**: 仅读取工作目录下的所有XML文件中定义的基因,若'生物科技'DLC不在工作目录下,则读取不到原版基因

## 2. 分类精简视图
### 主要面板
|属性|智人种|亚人兽娘|
|---|---|---|
|基础价值|1750|1500|
|袭击点数|200|-|
|体型|1|0.8|
|移动速度|4.6|4|
|躯干耐久|40|-|
|生命值系数|100%|90%|
|利器护甲|0%|0%-0.1|
|钝器护甲|0%|0%-0.1|
|热能护甲|0%|-|
|承伤系数|100%|-|
|心灵敏感度|100%|-*|
|近战伤害乘数|100%|-|
|瞄准时间|100%|-|
|远程冷却时间|100%|-|
|疼痛休克阈值|80%|70%-0.1|
|愈合系数|100%|100%-0.1|
|免疫速度|100%|-*|
|崩溃临界值|35%|-|
|携带能力|75|-|
|最低舒适温度|16|4|
|最高舒适温度|26|38|
|易燃性|70%|100%|
|食物消耗|1.6|-|
|交易价格改善|100%|-|
|全局学习系数|100%|-|
|全局工作速度|100%|115%|
|普通工作速度|100%|-|
|采矿速度|100%|115%|
|手术成功率|100%|-|
|治疗速度|100%|-|
|建造速度|100%|-|
|种植速度|100%|-|
|研究速度|100%|-*|
|真空抗性|0%|-|

## 3. 差异统计 (变化面板)
### 变化面板
|属性|智人种|亚人兽娘|
|---|---|---|
|生命值系数|100%|90%|
|基础价值|1750|1500|
|易燃性|70%|100%|
|体型|1|0.8|
|皮革量|75|25|
|移动速度|4.6|4|
|最低舒适温度|16|4|
|最高舒适温度|26|38|
|毒素抗性|0%|0%-0.3|
|疼痛休克阈值|80%|70%-0.1|
|预期寿命|80|150|
|生育能力|100%|100% $\times$ 2|
|愈合系数|100%|100%-0.1|
|生育周期|15|45|
|利器护甲|0%|0%-0.1|
|钝器护甲|0%|0%-0.1|
|魅力|0|0+1|
|全局工作速度|100%|115%|
|采矿速度|100%|115%|

## 4. 种族特性一览 (Traits)

### 亚人兽娘
* **必带特性 (Forced)**: 俊俏 (10%)

---

## 5. 异种胚清单 (Xenotype Manifest)

此列表包含扫描到的所有异种胚，方便查找 `MANUAL_XENOTYPE_MAPPING` 所需的 defName。

### Anty the war ant race
| defName | Label |
|---|---|
| `AntyXenotype` | Anty |
| `Anty_Anoplolepis_gracilipes` | Anoplolepis |
| `Anty_Dorylus` | Dorylus |
| `Anty_Linepithema_humile` | Linepithema |
| `Anty_Solenopsis_Invicta` | Solenopsis |
| `Anty_Stigmatomma` | Stigmatomma |
| `Anty_Tapinoma_melanocephalum` | Tapinoma |

### Defs
| defName | Label |
|---|---|
| `Baseliner` | baseliner |
| `Dirtmole` | dirtmole |
| `Genie` | genie |
| `Highmate` | highmate |
| `Hussar` | hussar |
| `Impid` | impid |
| `Neanderthal` | neanderthal |
| `Pigskin` | pigskin |
| `Sanguophage` | sanguophage |
| `Waster` | waster |
| `Yttakin` | yttakin |

### Epona Dynastic Rise
| defName | Label |
|---|---|
| `Xeno_Destrier` | Destrier |
| `Xeno_Epona` | Epona |
| `Xeno_Unicorn` | Unicorn |

### Gloomy Dragonian race
| defName | Label |
|---|---|
| `DragonianXenotype` | Dragonian |

### Kiiro Race
| defName | Label |
|---|---|
| `KiiroXenotype` | kiiro |

### Maru Race
| defName | Label |
|---|---|
| `Xeno_Maru` | Maru |

### Miho, the celestial fox
| defName | Label |
|---|---|
| `Xeno_CelestialMiho` | 오디너리 미호 |
| `Xeno_CelestialMiho_Arctic` | 아르티코스 미호 |
| `Xeno_CelestialMiho_Desert` | 코니스 미호 |
| `Xeno_CelestialMiho_Highland` | 프로드로모스 미호 |
| `Xeno_CelestialMiho_Highmate` | 포르네 미호 |
| `Xeno_CelestialMiho_Voidborn` | 케노스 미호 |

### Milira Race
| defName | Label |
|---|---|
| `MiliraXenotype` | milira |

### MoeLotl Race
| defName | Label |
|---|---|
| `Axolotl_Xenotype_MoeLotlBase` | moelotl |

### Rabbie The Moonrabbit race
| defName | Label |
|---|---|
| `Xeno_Rabbie` | 래비 |

### Venarium Race
| defName | Label |
|---|---|
| `Venarium_Xenotype_Base` | Venarium |

### Wolfein Race
| defName | Label |
|---|---|
| `Wolfein_Xenotype` | Wolfein |
| `Wolfein_Xenotype_PureBlood` | Pure Wolfein |

### Yuran race
| defName | Label |
|---|---|
| `YuranXenotype` | Yuran |
| `YuranXenotypeBlackSnake` | Yuran BlackSnake |

### [Aya]Neclose Race
| defName | Label |
|---|---|
| `Aya_Race_Xenotype_b` | エクソフラトリア |

### [Aya]Zoichor Race
| defName | Label |
|---|---|
| `Aya_Race_Xenotype` | イシュムーティト |

### [OA]Ratkin Gene Expand
| defName | Label |
|---|---|
| `OAGene_BiochemicalRatkinI` | Ratkin Biochemical Type I |
| `OAGene_BiochemicalRatkinII` | Ratkin Biochemical Type II |
| `OAGene_BiochemicalRatkinIII` | Ratkin Biochemical Type III |
| `OAGene_BiochemicalRatkinIV` | Ratkin Biochemical Type IV |
| `OAGene_LowlandRatkin` | Lowland Ratkin |
| `OAGene_PrimordialRatkin` | Initial Ratkin |
| `OAGene_RatkinBase` | Tribe Ratkin  |
| `OAGene_RockRatkin` | Rock Ratkin |
| `OAGene_SnowRatkin` | Snow Ratkin |
| `OAGene_TravelRatkin` | Travel Ratkin |
| `OAGene_WhiteRatkin` | White Ratkin |

### 煌金族 - 金色的未来（beta）
| defName | Label |
|---|---|
| `GGlSXGeno` | 煌金族 |

---

## 6. 种族-异种胚绑定一览 (Race-Xenotype Bindings)

| 种族 (Race) | 绑定的异种胚 (Xenotype) |
|---|---|
| 亚人兽娘 | `Aya_Race_Xenotype` |

