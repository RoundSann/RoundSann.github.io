"""
衰减计算器 — 苍色之光与魔剑锻造师
Decay Calculator for "The Shimmering Horizon and Cursed Blacksmith"

功能：
  1. 一次输入完整碎裂场景：韧性、魔力、1主词条 + 2副词条
  2. 内嵌完整 151 条词条衰减参数，无需手动查表
  3. 支持武器破碎陷阱 (plusMode) / 最高难度 (hardMode)
  4. 词条临界值：显示相邻衰减结果所需的最小输入值

使用方式：修改下方配置区，运行脚本即可。
"""

import math

# ====================== 配置区 ======================
HARD_MODE      = True         # 最高难度
PLUS_MODE      = True         # 武器破碎陷阱

POWER_VALUE    = 91           # 韧性原始值
MAGIC_VALUE    = 88           # 魔力原始值
MAIN_AFFIX_ID  = 143           # 主词条编号(1~151)或英文type名
MAIN_AFFIX_VAL = 130         # 主词条原始值
SUB1_AFFIX_ID  = 19           # 副词条1编号(1~151)或英文type名
SUB1_AFFIX_VAL = 90           # 副词条1原始值
SUB2_AFFIX_ID  = 143           # 副词条2编号(1~151)或英文type名
SUB2_AFFIX_VAL = 63           # 副词条2原始值
# =====================================================


# ─────────────────────────────────────────────────────
#  完整词条数据库 (151 条)
#  格式: id: (type, 中文名, pw, onelimit, twolimit, threelimit)
# ─────────────────────────────────────────────────────
AFFIX_DB = {
    1:   ("atkPhy",                    "物理攻击力",                             3, (18, 6),  (18, 10), (25, 18)),
    2:   ("atkFire",                   "火属性攻击力",                           3, (18, 6),  (18, 10), (25, 18)),
    3:   ("atkWater",                  "水属性攻击力",                           3, (18, 6),  (18, 10), (25, 18)),
    4:   ("atkWind",                   "风属性攻击力",                           3, (18, 6),  (18, 10), (25, 18)),
    5:   ("atkLight",                  "光属性攻击力",                           3, (18, 6),  (18, 10), (25, 18)),
    6:   ("atkDark",                   "暗属性攻击力",                           3, (18, 6),  (18, 10), (25, 18)),
    7:   ("atkPhyRate",                "物理攻击力%",                            3, (16, 6),  (12, 12), (21, 20)),
    8:   ("atkFireRate",               "火属性攻击力%",                          3, (16, 6),  (12, 12), (21, 20)),
    9:   ("atkWaterRate",              "水属性攻击力%",                          3, (16, 6),  (12, 12), (21, 20)),
    10:  ("atkWindRate",               "风属性攻击力%",                          3, (16, 6),  (12, 12), (21, 20)),
    11:  ("atkLightRate",              "光属性攻击力%",                          3, (16, 6),  (12, 12), (21, 20)),
    12:  ("atkDarkRate",               "暗属性攻击力%",                          3, (16, 6),  (12, 12), (21, 20)),
    13:  ("defPhy",                    "物理抗性",                               3, (8, 9),   (15, 14), (24, 20)),
    14:  ("defFire",                   "火属性抗性",                             3, (8, 9),   (15, 14), (24, 20)),
    15:  ("defWater",                  "水属性抗性",                             3, (8, 9),   (15, 14), (24, 20)),
    16:  ("defWind",                   "风属性抗性",                             3, (8, 9),   (15, 14), (24, 20)),
    17:  ("defLight",                  "光属性抗性",                             3, (8, 9),   (15, 14), (24, 20)),
    18:  ("defDark",                   "暗属性抗性",                             3, (8, 9),   (15, 14), (24, 20)),
    19:  ("dangerSenseRatePlus",       "「危险感知」的发动机率",                 4, (12, 6),  (6, 8),   (8, 10)),
    20:  ("hasteStateDuration",        "「加速」状态的持续回合数",               4, (8, 6),   (6, 8),   (8, 10)),
    21:  ("criticalRate",              "会心一击率",                             3, (10, 6),  (12, 10), (16, 15)),
    22:  ("basicEva",                  "初始格挡值",                             3, (9, 6),   (10, 10), (14, 15)),
    23:  ("skillDamagePlusEro",        "侵蚀度MAX时，战技造成伤害",             2, (16, 5),  (15, 10), (20, 15)),
    24:  ("skillDamagePlus",           "战技造成伤害",                           4, (14, 7),  (10, 12), (15, 18)),
    25:  ("superArmorPassive",         "不受击飞/击退攻击影响机率",             3, (16, 6),  (12, 10), (18, 15)),
    26:  ("criticalDamage",            "会心一击造成伤害",                       3, (16, 6),  (15, 10), (20, 15)),
    27:  ("throwWeaponBack",           "「投掷武器」命中后自动回归机率",         2, (16, 5),  (14, 8),  (20, 14)),
    28:  ("throwWeaponDur",            "「投掷武器」命中不减耐久度机率",         6, (16, 9),  (12, 12), (15, 16)),
    29:  ("throwDamage",               "「投掷武器」「投掷素材」伤害",           2, (16, 5),  (14, 8),  (20, 14)),
    30:  ("throwBomb",                 "「投掷素材」命中引发爆炸机率",           3, (15, 6),  (13, 10), (18, 15)),
    31:  ("dontEvaCost",               "成功格挡时不消耗格挡值机率",             3, (15, 6),  (13, 10), (18, 15)),
    32:  ("soulToSpRate",              "获得灵魂转换为SP的机率",                 3, (15, 6),  (13, 10), (18, 15)),
    33:  ("spBuffRateUp",              "「亢奋」状态的SP恢复量",                 3, (15, 6),  (13, 10), (18, 15)),
    34:  ("stealthyTurnUp",            "「隐身」状态的持续回合数",               3, (15, 6),  (13, 10), (18, 15)),
    35:  ("beFriendRate",              "非菁英敌人发现时使其变为我方机率",       4, (15, 7),  (12, 12), (15, 18)),
    36:  ("changeToEnemyRate",         "遭敌人攻击时交换位置的机率",             3, (15, 6),  (13, 10), (18, 15)),
    37:  ("dTypeHpRate",               "受质量影响，伤害量",                     2, (16, 5),  (14, 8),  (20, 14)),
    38:  ("absorb",                    "普通攻击时吸血",                         4, (15, 7),  (12, 12), (15, 18)),
    39:  ("dangerSenseRange",          "「危险感知」的发动范围",                 3, (10, 4),  (3, 5),   (4, 7)),
    40:  ("attackMakeDark",            "普攻命中时产生暗沼机率",                 3, (16, 6),  (14, 12), (20, 18)),
    41:  ("attackMakeWind",            "普攻命中时产生旋风机率",                 3, (16, 6),  (14, 12), (20, 18)),
    42:  ("attackMakeWater",           "普攻命中时产生冰柱机率",                 3, (16, 6),  (14, 12), (20, 18)),
    43:  ("attackMakeLight",           "普攻命中时产生雷电机率",                 3, (16, 6),  (14, 12), (20, 18)),
    44:  ("attackMakeFire",            "普攻命中时产生火焰机率",                 3, (16, 6),  (14, 12), (20, 18)),
    45:  ("moveSkillMakeDark",         "移动战技后产生暗沼机率",                 2, (15, 5),  (12, 12), (18, 18)),
    46:  ("moveSkillMakeWind",         "移动战技后产生旋风机率",                 2, (15, 5),  (12, 12), (18, 18)),
    47:  ("moveSkillMakeWater",        "移动战技后产生冰柱机率",                 2, (15, 5),  (12, 12), (18, 18)),
    48:  ("moveSkillMakeLight",        "移动战技后产生雷电机率",                 2, (15, 5),  (12, 12), (18, 18)),
    49:  ("moveSkillMakeFire",         "移动战技后产生火焰机率",                 2, (15, 5),  (12, 12), (18, 18)),
    50:  ("moveSkillPhyUp",            "移动战技后「物攻上升」机率",             3, (16, 6),  (14, 12), (20, 18)),
    51:  ("moveSkillFocus",            "移动战技后「集中」机率",                 3, (14, 6),  (10, 12), (15, 18)),
    52:  ("moveSkillSturdy",           "移动战技后「强韧」机率",                 3, (16, 6),  (14, 12), (20, 18)),
    53:  ("moveSkillSuperArmor",       "移动战技后「霸体」机率",                 2, (14, 5),  (10, 10), (15, 15)),
    54:  ("jumpFloating",              "跳跃战技后「飘浮」机率",                 3, (14, 6),  (10, 12), (15, 18)),
    55:  ("jumpStealthy",              "跳跃战技后「隐身」机率",                 4, (15, 7),  (10, 12), (15, 20)),
    56:  ("powerChangePhy",            "物理战技属性攻击力转换倍率",             3, (14, 6),  (10, 12), (15, 18)),
    57:  ("powerChangeFire",           "火战技属性攻击力转换倍率",               3, (14, 6),  (10, 12), (15, 18)),
    58:  ("powerChangeWater",          "水战技属性攻击力转换倍率",               3, (14, 6),  (10, 12), (15, 18)),
    59:  ("powerChangeWind",           "风战技属性攻击力转换倍率",               3, (14, 6),  (10, 12), (15, 18)),
    60:  ("powerChangeLight",          "光战技属性攻击力转换倍率",               3, (14, 6),  (10, 12), (15, 18)),
    61:  ("powerChangeDark",           "暗战技属性攻击力转换倍率",               3, (14, 6),  (10, 12), (15, 18)),
    62:  ("exDamagePhy",               "物理战技额外伤害",                       3, (14, 6),  (10, 12), (15, 18)),
    63:  ("exDamageFire",              "火战技额外伤害",                         3, (14, 6),  (10, 12), (15, 18)),
    64:  ("exDamageWater",             "水战技额外伤害",                         3, (14, 6),  (10, 12), (15, 18)),
    65:  ("exDamageWind",              "风战技额外伤害",                         3, (14, 6),  (10, 12), (15, 18)),
    66:  ("exDamageLight",             "光战技额外伤害",                         3, (14, 6),  (10, 12), (15, 18)),
    67:  ("exDamageDark",              "暗战技额外伤害",                         3, (14, 6),  (10, 12), (15, 18)),
    68:  ("reDamagePhy",               "受物理伤害时反弹",                       2, (18, 6),  (20, 12), (30, 20)),
    69:  ("reDamageFire",              "受火属性伤害时反弹",                     2, (18, 6),  (20, 12), (30, 20)),
    70:  ("reDamageWater",             "受水属性伤害时反弹",                     2, (18, 6),  (20, 12), (30, 20)),
    71:  ("reDamageWind",              "受风属性伤害时反弹",                     2, (18, 6),  (20, 12), (30, 20)),
    72:  ("reDamageLight",             "受光属性伤害时反弹",                     2, (18, 6),  (20, 12), (30, 20)),
    73:  ("reDamageDark",              "受暗属性伤害时反弹",                     2, (18, 6),  (20, 12), (30, 20)),
    74:  ("magicArrowKnock",           "元素箭击退敌人机率",                     3, (16, 6),  (13, 10), (18, 15)),
    75:  ("enemyStateGetSoul",         "使敌人异常时获得灵魂机率",               2, (16, 6),  (13, 10), (18, 15)),
    76:  ("enemyStateTurnUp",          "使敌人异常状态持续回合数",               4, (11, 6),  (6, 9),   (9, 12)),
    77:  ("enemyStateGetSp",           "使敌人异常时恢复SP",                     2, (13, 5),  (10, 9),  (15, 13)),
    78:  ("enemyStateConfusionPlusSlow","使敌人「混乱」时同时「迟缓」机率",      2, (18, 5),  (15, 9),  (22, 14)),
    79:  ("enemyStateBlindPlusPoison", "使敌人「致盲」时同时「中毒」机率",       2, (18, 5),  (15, 9),  (22, 14)),
    80:  ("enemyImmobilizePlusMute",   "使敌人「禁锢」时同时「沉默」机率",       2, (18, 5),  (15, 9),  (22, 14)),
    81:  ("enemySleepToStun",          "使敌人「睡眠」转变为「晕眩」机率",       2, (16, 5),  (15, 10), (22, 15)),
    82:  ("enemyknockPlusStun",        "击退敌人额外「晕眩」机率",               3, (16, 6),  (13, 10), (18, 15)),
    83:  ("enemyknockPlusFragile",     "击退敌人使其「脆弱」机率",               2, (18, 5),  (15, 8),  (20, 13)),
    84:  ("enemyknockPlusExDamage",    "击退敌人额外撞击伤害机率",               2, (18, 5),  (15, 8),  (20, 13)),
    85:  ("enemyknockPlusPower",       "击退距离加倍机率",                       3, (16, 6),  (13, 10), (18, 15)),
    86:  ("enemyknockPlusAttract",     "击退转变为吸引敌人机率",                 2, (18, 5),  (15, 8),  (20, 13)),
    87:  ("absorbCritical",            "会心一击时吸血",                         4, (14, 8),  (10, 14), (14, 20)),
    88:  ("absorbSkill",               "战技伤害时吸血",                         4, (15, 8),  (12, 14), (15, 20)),
    89:  ("skillCostDown",             "战技消耗SP减免",                         4, (15, 7),  (12, 12), (15, 18)),
    90:  ("userPotionDontTurn",        "使用药水不花费回合机率",                 3, (15, 6),  (12, 10), (15, 15)),
    91:  ("throwPotionDontTurn",       "投掷药水不花费回合机率",                 2, (15, 5),  (12, 8),  (15, 12)),
    92:  ("throwPotionFriend",         "投掷药水命中使其变为我方机率",           3, (16, 6),  (14, 10), (20, 15)),
    93:  ("expGetPlus",                "获得经验值",                             2, (18, 5),  (20, 8),  (30, 12)),
    94:  ("damagePlusInvincible",      "受伤时短暂「无敌」机率",                 3, (13, 6),  (8, 10),  (12, 18)),
    95:  ("hpRecoveryPlusSturdy",      "自然恢复HP时短暂「强韧」机率",           3, (13, 6),  (10, 10), (15, 18)),
    96:  ("quickJumpHaste",            "「紧急跳离」时短暂「加速」机率",         3, (18, 6),  (18, 10), (30, 15)),
    97:  ("parryReturnDamage",         "格挡成功时反弹伤害机率",                 3, (18, 6),  (18, 10), (30, 15)),
    98:  ("inDubuffPlusBuff",          "陷入异常时随机短暂强化机率",             2, (15, 5),  (14, 10), (20, 15)),
    99:  ("inDubuffTurnHalf",          "陷入异常时持续回合减半机率",             2, (15, 5),  (14, 10), (20, 15)),
    100: ("stateSkillDamage",          "处于异常时战技造成伤害",                 3, (16, 6),  (15, 12), (22, 18)),
    101: ("stateRecoveryEva",          "处于异常时每回合格挡值",                 3, (16, 6),  (15, 12), (22, 18)),
    102: ("toDamagePlusState",         "造成伤害时使其陷入自身异常机率",         2, (16, 5),  (15, 10), (22, 15)),
    103: ("damageChangeHelf",          "受到伤害减半机率",                       3, (16, 6),  (15, 10), (22, 15)),
    104: ("damageCostSoul",            "消耗灵魂无效伤害机率",                   3, (14, 6),  (10, 11), (15, 17)),
    105: ("damageEvaCostDown",         "受伤时失去格挡值减免",                   3, (15, 6),  (12, 10), (18, 15)),
    106: ("lowHpAtkUpRate",            "HP<25%时造成伤害",                       2, (16, 5),  (14, 10), (20, 15)),
    107: ("lowHpDefUpRate",            "HP<25%时受到伤害减免",                   2, (16, 5),  (14, 10), (20, 15)),
    108: ("stateStunChangeSleep",      "「晕眩」转变为「睡眠」机率",             2, (16, 5),  (14, 10), (20, 15)),
    109: ("defBuffDuration",           "「强韧」状态持续回合数",                 3, (11, 5),  (5, 8),   (8, 12)),
    110: ("spBuffDuration",            "「亢奋」状态持续回合数",                 3, (11, 5),  (5, 8),   (8, 12)),
    111: ("defUpRateEro",              "侵蚀MAX时受伤减免",                     2, (16, 5),  (14, 10), (20, 15)),
    112: ("attackToAtkBuffEro",        "侵蚀MAX时普攻后「物攻上升」机率",       2, (16, 5),  (14, 10), (20, 15)),
    113: ("damageToRegenerationEro",   "侵蚀MAX时受伤后「再生」机率",           3, (15, 6),  (13, 12), (18, 18)),
    114: ("eroAddAttackBuff",          "侵蚀度增加时「物攻上升」机率",           3, (15, 6),  (13, 12), (18, 18)),
    115: ("throwWeaponPlusFragile",    "投掷武器命中使敌人「脆弱」机率",         2, (18, 5),  (18, 10), (25, 15)),
    116: ("throwWeaponKnock",          "投掷武器命中击退敌人机率",               2, (18, 5),  (18, 10), (25, 15)),
    117: ("hpRecoveryGetBuff",         "恢复HP时随机短暂增益机率",               2, (16, 5),  (15, 10), (22, 15)),
    118: ("knockbackToFly",            "被击退时短暂「飘浮」机率",               2, (18, 5),  (18, 10), (25, 15)),
    119: ("knockToDig",                "被击退时破坏墙壁/障碍物机率",           3, (18, 6),  (18, 12), (25, 18)),
    120: ("dTypeAtkRate",              "召唤单位的物理攻击力",                   2, (28, 5),  (40, 8),  (60, 12)),
    121: ("damageTeleport",            "受伤后随机转移机率",                     3, (14, 6),  (12, 12), (15, 18)),
    122: ("stateDefImprison",          "禁锢 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    123: ("stateDefPoison",            "中毒 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    124: ("stateDefBlind",             "致盲 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    125: ("stateDefSilent",            "沉默 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    126: ("stateDefStun",              "晕眩 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    127: ("stateDefConfus",            "混乱 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    128: ("stateDefSlow",              "迟缓 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    129: ("stateDefSleep",             "睡眠 状态抗性",                         2, (16, 5),  (15, 8),  (22, 12)),
    130: ("stateImprison",             "造成 禁锢 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    131: ("statePoison",               "造成 中毒 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    132: ("stateBlind",                "造成 致盲 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    133: ("stateSilent",               "造成 沉默 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    134: ("stateStun",                 "造成 晕眩 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    135: ("stateConfus",               "造成 混乱 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    136: ("stateSlow",                 "造成 迟缓 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    137: ("stateSleep",                "造成 睡眠 机率",                        2, (16, 5),  (15, 8),  (22, 12)),
    138: ("mhpRate",                   "Max HP %",                              2, (15, 5),  (14, 8),  (22, 15)),
    139: ("mspRate",                   "Max SP %",                              3, (13, 5),  (10, 8),  (16, 15)),
    140: ("mhp",                       "Max HP",                                2, (16, 5),  (20, 8),  (30, 13)),
    141: ("msp",                       "Max SP",                                3, (15, 5),  (14, 8),  (20, 13)),
    142: ("recoveryRateHp",            "HP恢复力",                              3, (14, 12), (15, 15), (20, 20)),
    143: ("recoveryRateSp",            "SP恢复力",                              3, (11, 6),  (6, 12),  (12, 24)),
    144: ("recoveryRateEva",           "格挡值增加量",                           4, (11, 9),  (6, 15),  (12, 27)),
    145: ("throwDistancePlus",         "最大投掷距离",                           3, (11, 5),  (5, 7),   (7, 10)),
    146: ("dontCostDurRate",           "不减少武器耐久度机率",                   5, (8, 8),   (9, 13),  (14, 20)),
    147: ("passiveKnockback",          "普通攻击击退敌人机率",                   2, (18, 5),  (20, 9),  (30, 14)),
    148: ("passiveTeleport",           "普通攻击转移敌人机率",                   3, (15, 6),  (12, 10), (18, 15)),
    149: ("weightMaxPlus",             "负重量上限",                             5, (7, 11),  (7, 15),  (12, 23)),
    150: ("soulGetPlus",               "打倒敌人获得灵魂",                       2, (18, 5),  (20, 8),  (30, 12)),
    151: ("itemGetPlus",               "打倒敌人掉落物品机率",                   4, (16, 8),  (15, 13), (20, 20)),
}

_TYPE_TO_ID = {entry[0]: aid for aid, entry in AFFIX_DB.items()}


# ─────────────────────────────────────────────────────
#  核心计算函数
# ─────────────────────────────────────────────────────

def js_round(x):
    """JS Math.round: 0.5 向上取整"""
    return math.floor(x + 0.5)


def effect_count_tool(number, pw, onelimit, twolimit, threelimit):
    """精确复刻 AS_ItemCode.js Window_Forge.prototype.effectCountTool"""
    plus = 1
    c = 0
    pw = max(pw - 1, 1)
    for _ in range(number + 1):
        c += 1
        if plus >= threelimit[0]:
            if c >= threelimit[1]:
                plus += 1; c = 0
        elif plus >= twolimit[0]:
            if c >= twolimit[1]:
                plus += 1; c = 0
        elif plus >= onelimit[0]:
            if c >= onelimit[1]:
                plus += 1; c = 0
        else:
            if c >= pw:
                plus += 1; c = 0
    return plus


def calc_sub_affix_decay(value, pw, onelimit, twolimit, threelimit, hard_mode=True):
    """副词条衰减：hardMode时efChip×1.5 → effectCountTool → clamp"""
    ef_chip = value
    if hard_mode:
        ef_chip = js_round(ef_chip * 1.5)
    result = effect_count_tool(ef_chip, pw, onelimit, twolimit, threelimit)
    return max(min(result, value), 1)


def calc_main_affix_decay(value, pw, onelimit, twolimit, threelimit,
                          hard_mode=True, plus_mode=False, is_weight_max=False):
    """
    武器主词条衰减。
    1. efChip = round(value × 1.8)，weightMaxPlus用×1.1
    2. hardMode: efChip = round(efChip × 1.5)
    3. effectCountTool → result
    4. plusMode: result = round(result × 1.5)
    5. clamp to [1, value]
    """
    multiplier = 1.1 if is_weight_max else 1.8
    ef_chip = js_round(value * multiplier)
    if hard_mode:
        ef_chip = js_round(ef_chip * 1.5)
    result = effect_count_tool(ef_chip, pw, onelimit, twolimit, threelimit)
    if plus_mode:
        result = js_round(result * 1.5)
    return max(min(result, value), 1)


def calc_power_magic_decay(value, plus_mode=False):
    """韧性/魔力 7 段分段衰减。最终 +1（碎片模板自带 1）。"""
    if plus_mode:
        value *= 2
    result = 0
    count = 0
    segments = [(70, 40), (55, 25), (42, 19), (30, 14), (20, 10), (10, 7), (0, 5)]
    remainder_div = [(70, 50), (55, 30), (42, 20), (30, 15), (20, 12), (10, 8), (0, 5)]
    for _ in range(value + 1):
        count += 1
        for threshold, step in segments:
            if result >= threshold:
                if count >= step:
                    result += 1; count = 0
                break
    for threshold, divisor in remainder_div:
        if result >= threshold:
            result += js_round(count / divisor)
            break
    return result + 1


# ─────────────────────────────────────────────────────
#  临界值查找
# ─────────────────────────────────────────────────────

def find_threshold_sub(target_result, pw, onelimit, twolimit, threelimit, hard_mode):
    """二分查找：使副词条衰减结果恰好 >= target_result 的最小输入值"""
    if target_result < 1:
        return 1
    lo, hi = 1, 10000
    while lo < hi:
        mid = (lo + hi) // 2
        if calc_sub_affix_decay(mid, pw, onelimit, twolimit, threelimit, hard_mode) >= target_result:
            hi = mid
        else:
            lo = mid + 1
    # 验证找到的值确实能产生目标结果
    if calc_sub_affix_decay(lo, pw, onelimit, twolimit, threelimit, hard_mode) >= target_result:
        return lo
    return None


def find_threshold_main(target_result, pw, onelimit, twolimit, threelimit,
                        hard_mode, plus_mode, is_weight_max):
    """二分查找：使武器主词条衰减结果恰好 >= target_result 的最小输入值"""
    if target_result < 1:
        return 1
    lo, hi = 1, 10000
    while lo < hi:
        mid = (lo + hi) // 2
        if calc_main_affix_decay(mid, pw, onelimit, twolimit, threelimit,
                                 hard_mode, plus_mode, is_weight_max) >= target_result:
            hi = mid
        else:
            lo = mid + 1
    if calc_main_affix_decay(lo, pw, onelimit, twolimit, threelimit,
                             hard_mode, plus_mode, is_weight_max) >= target_result:
        return lo
    return None


def find_threshold_pm(target_result, plus_mode):
    """线性查找：使韧性/魔力衰减结果恰好 >= target_result 的最小输入值"""
    if target_result <= 1:
        return 0
    for v in range(0, 10000):
        if calc_power_magic_decay(v, plus_mode) >= target_result:
            return v
    return None


# ─────────────────────────────────────────────────────
#  查询与输出
# ─────────────────────────────────────────────────────

def lookup_affix(affix_id_or_type):
    """按编号(int)或英文type名(str)查找。返回 (id, type, 中文名, pw, one, two, three) 或 None"""
    if isinstance(affix_id_or_type, int):
        entry = AFFIX_DB.get(affix_id_or_type)
        if entry:
            return (affix_id_or_type, *entry)
    elif isinstance(affix_id_or_type, str):
        aid = _TYPE_TO_ID.get(affix_id_or_type)
        if aid is not None:
            return (aid, *AFFIX_DB[aid])
    return None


def print_threshold_table(label, current_val, current_result, find_fn):
    """打印 y-2 ~ y+2 的临界值表"""
    print(f"  ┌─ {label} 临界值表 (当前: 输入{current_val} → 结果{current_result})")
    for delta in [-2, -1, 0, +1, +2]:
        target = current_result + delta
        if target < 1:
            print(f"  │  结果={target:>4}  →  不可能 (最小为1)")
            continue
        threshold = find_fn(target)
        if threshold is None:
            print(f"  │  结果={target:>4}  →  超出搜索范围")
        else:
            marker = " <-- 当前" if delta == 0 else ""
            print(f"  │  结果={target:>4}  →  最小输入值={threshold}{marker}")
    print(f"  └{'─' * 48}")


def print_separator():
    print("─" * 56)


def main():
    print("=" * 56)
    print("  衰减计算器 — 苍色之光与魔剑锻造师")
    print("=" * 56)

    flags = []
    if HARD_MODE: flags.append("最高难度")
    if PLUS_MODE: flags.append("武器破碎陷阱")
    print(f"  模式: {' + '.join(flags) if flags else '普通'}")
    print_separator()

    # ── 韧性 ──
    power_result = calc_power_magic_decay(POWER_VALUE, PLUS_MODE)
    print(f"\n  韧性  {POWER_VALUE} → {power_result}")
    print_threshold_table("韧性", POWER_VALUE, power_result,
                          lambda t: find_threshold_pm(t, PLUS_MODE))

    # ── 魔力 ──
    magic_result = calc_power_magic_decay(MAGIC_VALUE, PLUS_MODE)
    print(f"\n  魔力  {MAGIC_VALUE} → {magic_result}")
    print_threshold_table("魔力", MAGIC_VALUE, magic_result,
                          lambda t: find_threshold_pm(t, PLUS_MODE))

    print(f"\n  韧性 + 魔力 = {power_result + magic_result}")
    print_separator()

    # ── 主词条 ──
    main_info = lookup_affix(MAIN_AFFIX_ID)
    if main_info is None:
        print(f"\n  [错误] 主词条未找到: {MAIN_AFFIX_ID}")
        return
    m_id, m_type, m_name, m_pw, m_one, m_two, m_three = main_info
    is_wm = (m_type == "weightMaxPlus")

    main_result = calc_main_affix_decay(
        MAIN_AFFIX_VAL, m_pw, m_one, m_two, m_three,
        hard_mode=HARD_MODE, plus_mode=PLUS_MODE, is_weight_max=is_wm)

    extra = " (×1.1 weightMaxPlus)" if is_wm else ""
    print(f"\n  主词条 #{m_id} {m_name}{extra}")
    print(f"  {MAIN_AFFIX_VAL} → {main_result}")
    print_threshold_table("主词条", MAIN_AFFIX_VAL, main_result,
                          lambda t: find_threshold_main(t, m_pw, m_one, m_two, m_three,
                                                        HARD_MODE, PLUS_MODE, is_wm))
    print_separator()

    # ── 副词条1 ──
    sub1_info = lookup_affix(SUB1_AFFIX_ID)
    if sub1_info is None:
        print(f"\n  [错误] 副词条1未找到: {SUB1_AFFIX_ID}")
        return
    s1_id, s1_type, s1_name, s1_pw, s1_one, s1_two, s1_three = sub1_info

    sub1_result = calc_sub_affix_decay(
        SUB1_AFFIX_VAL, s1_pw, s1_one, s1_two, s1_three, hard_mode=HARD_MODE)

    print(f"\n  副词条1 #{s1_id} {s1_name}")
    print(f"  {SUB1_AFFIX_VAL} → {sub1_result}")
    print_threshold_table("副词条1", SUB1_AFFIX_VAL, sub1_result,
                          lambda t: find_threshold_sub(t, s1_pw, s1_one, s1_two, s1_three,
                                                       HARD_MODE))
    print_separator()

    # ── 副词条2 ──
    sub2_info = lookup_affix(SUB2_AFFIX_ID)
    if sub2_info is None:
        print(f"\n  [错误] 副词条2未找到: {SUB2_AFFIX_ID}")
        return
    s2_id, s2_type, s2_name, s2_pw, s2_one, s2_two, s2_three = sub2_info

    sub2_result = calc_sub_affix_decay(
        SUB2_AFFIX_VAL, s2_pw, s2_one, s2_two, s2_three, hard_mode=HARD_MODE)

    print(f"\n  副词条2 #{s2_id} {s2_name}")
    print(f"  {SUB2_AFFIX_VAL} → {sub2_result}")
    print_threshold_table("副词条2", SUB2_AFFIX_VAL, sub2_result,
                          lambda t: find_threshold_sub(t, s2_pw, s2_one, s2_two, s2_three,
                                                       HARD_MODE))

    # ── 汇总 ──
    print()
    print("=" * 56)
    print("  汇总")
    print("=" * 56)
    print(f"  韧性     {POWER_VALUE:>5} → {power_result}")
    print(f"  魔力     {MAGIC_VALUE:>5} → {magic_result}")
    print(f"  主词条   {MAIN_AFFIX_VAL:>5} → {main_result}  ({m_name})")
    print(f"  副词条1  {SUB1_AFFIX_VAL:>5} → {sub1_result}  ({s1_name})")
    print(f"  副词条2  {SUB2_AFFIX_VAL:>5} → {sub2_result}  ({s2_name})")
    print()


# ─────────────────────────────────────────────────────
#  内置自检
# ─────────────────────────────────────────────────────

def _self_test():
    assert js_round(2.5) == 3
    assert js_round(2.4) == 2

    # effect_count_tool 基本验证
    assert effect_count_tool(0, 3, (18, 6), (18, 10), (25, 18)) == 1
    assert effect_count_tool(1, 3, (18, 6), (18, 10), (25, 18)) == 2

    # power/magic
    assert calc_power_magic_decay(0) == 1

    # sub affix clamp
    r = calc_sub_affix_decay(1, 3, (18, 6), (18, 10), (25, 18), hard_mode=True)
    assert 1 <= r <= 1

    # main affix clamp
    r = calc_main_affix_decay(1, 3, (18, 6), (18, 10), (25, 18), hard_mode=True, plus_mode=True)
    assert 1 <= r <= 1

    # weightMaxPlus 应比 normal 小
    r_wm = calc_main_affix_decay(100, 5, (7, 11), (7, 15), (12, 23), hard_mode=False, is_weight_max=True)
    r_nm = calc_main_affix_decay(100, 5, (7, 11), (7, 15), (12, 23), hard_mode=False, is_weight_max=False)
    assert r_wm <= r_nm

    # plusMode 应 >= 无 plusMode
    r0 = calc_main_affix_decay(50, 3, (18, 6), (18, 10), (25, 18), hard_mode=True, plus_mode=False)
    r1 = calc_main_affix_decay(50, 3, (18, 6), (18, 10), (25, 18), hard_mode=True, plus_mode=True)
    assert r1 >= r0

    # threshold 验证: 找到的阈值应恰好让结果达到目标
    thr = find_threshold_sub(5, 3, (18, 6), (18, 10), (25, 18), True)
    assert thr is not None
    assert calc_sub_affix_decay(thr, 3, (18, 6), (18, 10), (25, 18), True) >= 5
    if thr > 1:
        assert calc_sub_affix_decay(thr - 1, 3, (18, 6), (18, 10), (25, 18), True) < 5

    # lookup
    assert lookup_affix(1)[1] == "atkPhy"
    assert lookup_affix("weightMaxPlus")[0] == 149


_self_test()

if __name__ == "__main__":
    main()
