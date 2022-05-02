/**
 * Created by Administrator on 2016/2/25.
 * 1-1 到 1-3 都用这个脚本
 */

//console.log("this is Handler_Level_1_1.js");

// 基础关卡，放一些敌方小兵自由进攻
TriggerGroup.CreateHandler(function (triggerIdList) {
    if (TriggerDef.IS_UNIT_FIGHT_TEST) {
        return; // test
    }

    // 初始化触发器
    var InitTrigger = function () {
        TriggerDef.LogMsg("运行关卡脚本 Handler_Level_1_1, InitTrigger()");
        var g_test = false; // @test // 是否开启测试，测试时开启测试 UI 并关闭出兵

        // region //=============== 常量定义 ===============//
        var FB_ID = TriggerAction.GetCurFbId(); // 副本 id
        var IS_PASS_CUR_LEVEL = TriggerAction.IsPassCurLevel(); // 是否已通过当前关卡
        var LIFE_TIME = 360; // 敌方刷出的兵的声明周期 // null 为无生命周期限制
        var FRIEND_GUIDE_CORPS_ID_LV1 = 21085; // 己方前线守护单位 // 初级箭塔
        var FRIEND_GUIDE_CORPS_ID_LV2 = 21086; // 己方基地守护单位 // 中级箭塔
        var ENEMY_GUIDE_CORPS_ID_LV1 = 21026; // 敌方前线守护单位 // 小型火焰守护塔
        var ENEMY_GUIDE_CORPS_ID_LV2 = 21026; // 敌方基地守护单位 // 小型火焰守护塔

        var STORY_ID = 0; // 开场播放的剧情 id

        var FRIEND_RUSH_LIST = null; // List<List<corpsCid>> // 每个数组都会刷出一定数量的兵
        var FRIEND_RUSH_COUNT = 0; // 每波刷出的友军数量
        var FRIEND_BIG_RUSH_COUNT = 0; // 大进攻刷出的友军数量

        var FRIEND_SUPPORT_RUSH_LIST = null; // List<List<corpsCid>> // 每个数组都会刷出一定数量的支援兵
        var FRIEND_RUSH_SUPPORT_COUNT = 0; // 每波刷出的友军支援数量
        var FRIEND_BIG_RUSH_SUPPORT_COUNT = 0; // 大进攻刷出的友军支援数量
        var FRIEND_SUPPORT_START_TIME = 45; // 友军支援开始的时间

        var ENEMY_RUSH_LIST = null; // List<List<corpsCid>> // 每个数组都会刷出一定数量的兵
        var ENEMY_RUSH_COUNT = 0; // 每波刷出的敌军数量
        var ENEMY_BIG_RUSH_COUNT = 0; // 大进攻刷出的敌军数量

        var BIG_RUSH_MOMENT = 0; // 双方大进攻间隔
        var PER_RUSH_TIME = 0; // 刷新双方间隔时间

        var ENEMY_GUIDE_CORPS_ID_LV1_NUM = 2; // 敌方前线守护单位的数量

        var CORPS_RUSH_UPGRADE_NUM_TIME = 75; // 刷兵数量翻倍间隔，单位秒
        var MAX_CORPS_RUSH_NUM = 5; // 最高的刷兵倍数

        // 根据不同的关卡设置不同的出兵数据
        switch (FB_ID) {
            case 101: // 1-1
            {
                STORY_ID = 2; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1（21103）
                    [21103, 21103, 21103, 21103, 21103, 21103, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21042] // 沙漠屠夫（21042）
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 1;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵（21031）
                    [21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 6; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 102: // 1-2
            {
                STORY_ID = 3; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫
                    [21103, 21103, 21103, 21103, 21042, 21103, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21041] // 沙漠弓箭手（21041）
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 1;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者（21033）
                    [21031, 21031, 21031, 21031, 21031, 21031, 21031, 21031, 21033, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 3; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 103: // 1-3
            {
                STORY_ID = 4; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21044] // 海盗纵火狂
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人（21032）
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21031, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 3; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 104: // 1-4
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21043] // 蜥蜴破坏者（21043）
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21031, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 2; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 4; // 大进攻刷出的敌军数量
                ENEMY_GUIDE_CORPS_ID_LV1 = 21022; // 雷电塔
                ENEMY_GUIDE_CORPS_ID_LV1_NUM = 1; // 创建出前线守护单位的数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 4; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 105: // 1-5
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21049] // 大力神（21049）
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21031, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量
                ENEMY_GUIDE_CORPS_ID_LV1 = 21028; // 病毒扩散塔
                ENEMY_GUIDE_CORPS_ID_LV1_NUM = 1; // 创建出前线守护单位的数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 6; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 201: // 2-1
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21068] // 牧师（21068）
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21031, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量
                ENEMY_GUIDE_CORPS_ID_LV1 = 21027; // 喷火柱
                ENEMY_GUIDE_CORPS_ID_LV1_NUM = 1; // 创建出前线守护单位的数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 6; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 202: // 2-2
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21047] // 亚马逊女战士
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21031, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量
                ENEMY_GUIDE_CORPS_ID_LV1 = 21034; // 兽人榴弹炮
                ENEMY_GUIDE_CORPS_ID_LV1_NUM = 1; // 创建出前线守护单位的数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 6; // 双方大进攻间隔
                PER_RUSH_TIME = 12; // 刷新双方间隔时间
            }
                break;
            case 203: // 2-3
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21051] // 雷电魔法师
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人 神秘萨满（21092）
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21092, 21033, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 6; // 双方大进攻间隔
                PER_RUSH_TIME = 15; // 刷新双方间隔时间
            }
                break;
            case 204: // 2-4
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21067] // 武术家
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人 巨型骷髅战士（21048）
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21048, 21033, 21031, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 3; // 双方大进攻间隔
                PER_RUSH_TIME = 15; // 刷新双方间隔时间
            }
                break;
            case 205: // 2-5
            {
                STORY_ID = 0; // 开场播放的剧情 id

                //======== 友军刷兵 ========//
                FRIEND_RUSH_LIST = [ // 民兵lv1 沙漠屠夫 沙漠弓箭手
                    [21103, 21041, 21103, 21103, 21103, 21042, 21103, 21103],
                    [21103]
                ];
                FRIEND_RUSH_COUNT = 5; // 每波刷出的友军数量
                FRIEND_BIG_RUSH_COUNT = 8; // 大进攻刷出的友军数量

                //======== 友军支援刷兵 ========//
                FRIEND_SUPPORT_RUSH_LIST = [
                    [21098] // 圣堂武士
                ];
                FRIEND_RUSH_SUPPORT_COUNT = 0;
                FRIEND_BIG_RUSH_SUPPORT_COUNT = 1;
                FRIEND_SUPPORT_START_TIME = 45; // 支援开始的时间

                //======== 敌军刷兵 ========//
                ENEMY_RUSH_LIST = [ // 食人族士兵 异形收割者 食人族猎人 巨型蜘蛛 死亡骑士
                    [21031, 21031, 21032, 21032, 21031, 21031, 21031, 21033, 21101, 21033, 21099, 21031],
                    [21031]
                ];
                ENEMY_RUSH_COUNT = 8; // 每波刷出的敌军数量
                ENEMY_BIG_RUSH_COUNT = 12; // 大进攻刷出的敌军数量

                //======== 设置进攻间隔 ========//
                BIG_RUSH_MOMENT = 3; // 双方大进攻间隔
                PER_RUSH_TIME = 15; // 刷新双方间隔时间
            }
                break;

            default: // 默认
                TriggerDef.LogMsg("默认测试关卡");
                g_test = true; // 默认开启测试
                break;
        }
        // endregion //=============== 常量定义 ===============//

        // region //=============== 变量定义 ===============//
        var g_enableRushSupportFriend = false; // 是否允许刷友军支援单位
        var g_friendGuideUnitIdList = []; // List<unitId> // 友军的守护单位 id 列表
        var g_enemyGuideUnitIdList = []; // List<unitId> // 敌军的守护单位 id 列表
        var g_curCorpsRushNum = 1; // 当前的刷兵数量 // 会随着时间递增
        // endregion //=============== 变量定义 ===============//

        // region //=============== 创建建筑和指挥官战斗单位 ===============//
        // 产生指挥官战斗单位
        var posHuman = TriggerAction.GetNodePos("base_human"); // TriggerDef.CAMP.HUMAN
        posHuman.y -= 5;
        TriggerAction.CreateCommanderFightUnit(TriggerDef.CAMP.HUMAN, posHuman);

        if (!g_test) { // 创建守护单位（箭塔） // tips: 一般主线副本才有守护单位
            var POS_LV1 = 1;
            var POS_LV2 = 2;
            var unitIdList; // List<unitId>
            // 创建己方守护单位
            unitIdList = TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV1, TriggerDef.CAMP.HUMAN, POS_LV1);
            for (var i = 0; i < unitIdList.length; i++) {
                g_friendGuideUnitIdList.push(unitIdList[i]);
            }
            unitIdList = TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV2, TriggerDef.CAMP.HUMAN, POS_LV2);
            for (var i = 0; i < unitIdList.length; i++) {
                g_friendGuideUnitIdList.push(unitIdList[i]);
            }
            // 创建敌方守护单位
            unitIdList = TriggerAction.CreateGuideUnit(ENEMY_GUIDE_CORPS_ID_LV1, TriggerDef.CAMP.ORC, POS_LV1, ENEMY_GUIDE_CORPS_ID_LV1_NUM);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
            unitIdList = TriggerAction.CreateGuideUnit(ENEMY_GUIDE_CORPS_ID_LV2, TriggerDef.CAMP.ORC, POS_LV2);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
        }

        // 如果有测试标识，则运行测试相关的接口
        if (g_test) {
            // 添加测试 UI // @test // tips: 需要扩展关卡的功能，只需添加不同的 UI
            //AddUI(PLAY_TEST_UI_LAYER, PLAY_TEST_UI_LAYER, false, PlayTestUILayerComponent);
            TriggerAction.PauseTimeCount(); // 暂停关卡倒计时
        }
        // endregion //=============== 创建建筑和指挥官战斗单位 ===============//

        //=============== 关卡逻辑 ===============//
        // 开始关卡，包括开始刷兵和运行天气
        var RunStartLevel;
        // 1 秒之后开始游戏 // 根据是否已通关标志决定是播放剧情还是直接开始
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([1, false])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                // 如果开启测试，那么不刷兵
                if (g_test) {
                    return acInfo.RunOnEnd(); // @test
                }
                TriggerDef.LogMsg("步骤一：播放剧情或者直接刷兵");
                // 已通关当前关卡或者剧情 id 为 0，都直接出兵
                if (IS_PASS_CUR_LEVEL || STORY_ID == 0) {
                    RunStartLevel();
                }
                else {
                    TriggerAction.ShowStory(STORY_ID); // 播放剧情
                }
                return acInfo.RunOnEnd();
            }
        );

        // 剧情播放结束之后开打
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.StoryOver([STORY_ID])],
            function* (acInfo, args) {
                RunStartLevel();
                return acInfo.RunOnEnd();
            }
        );

        // 开始关卡，包括开始刷兵和运行天气
        RunStartLevel = function () {
            // 创建刷兵触发器
            var triggerIdRushCorps = TriggerAction.CreateRushCorpsTrigger(triggerIdList, LIFE_TIME);
            TriggerGroup.CloseTrigger(triggerIdRushCorps); // 先关闭，等下看情况打开

            // 开始刷双方士兵触发器
            TriggerGroup.AddTriggerExtend(triggerIdList,
                [new TriggerEvent.LoopTime([0.1, false])],
                function* (acInfo, args) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    var rushCount = 0; // 用于统计双方刷怪拨数
                    TriggerDef.LogMsg("步骤二：开始刷兵并设置一些后续步骤");
                    // 开始等待 0.05 秒触发一波出兵，随后每 PER_RUSH_TIME 秒出一波兵
                    yield TriggerAction.Wait(acInfo.co, 0.05);
                    while (true) {
                        // 如果战斗已经结束则直接返回
                        if (TriggerAction.IsFightOver()) {
                            return acInfo.RunOnEnd();
                        }
                        var rushFriend = 0; // 每拨刷出的友军数量
                        var rushEnemy = 0; // 每拨刷出的敌军数量
                        var rushFriendSupport = 0; // 没播刷出的友军支援单位数量
                        var isBigRush = false; // 是否是大波出兵
                        // 拨次累加
                        rushCount++;
                        // 每 6 波刷一大波兵
                        if (rushCount % BIG_RUSH_MOMENT == 0) {
                            rushFriend = FRIEND_BIG_RUSH_COUNT;
                            rushEnemy = ENEMY_BIG_RUSH_COUNT;
                            rushFriendSupport = FRIEND_BIG_RUSH_SUPPORT_COUNT;
                            isBigRush = true;
                        }
                        else {
                            rushFriend = FRIEND_RUSH_COUNT;
                            rushEnemy = ENEMY_RUSH_COUNT;
                            rushFriendSupport = FRIEND_RUSH_SUPPORT_COUNT;
                        }
                        // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                        TriggerGroup.RunTrigger(triggerIdRushCorps,
                            {rush: rushFriend, count: g_curCorpsRushNum, rushListList: FRIEND_RUSH_LIST, camp: TriggerDef.CAMP.HUMAN});
                        // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                        TriggerGroup.RunTrigger(triggerIdRushCorps,
                            {rush: rushEnemy, count: g_curCorpsRushNum, rushListList: ENEMY_RUSH_LIST, camp: TriggerDef.CAMP.ORC});
                        if (g_enableRushSupportFriend && isBigRush) {
                            // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                            TriggerGroup.RunTrigger(triggerIdRushCorps,
                                {rush: rushFriendSupport, count: 1, rushListList: FRIEND_SUPPORT_RUSH_LIST, camp: TriggerDef.CAMP.HUMAN});
                        }
                        yield TriggerAction.Wait(acInfo.co, PER_RUSH_TIME);
                    }
                    return acInfo.RunOnEnd();
                }
            );

            // 每隔一段时间提升刷兵数量
            TriggerGroup.AddTriggerExtend(triggerIdList,
                [new TriggerEvent.LoopTime([CORPS_RUSH_UPGRADE_NUM_TIME, true])],
                function* (acInfo, args) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    // 如果开启测试，那么不进行数量升级
                    if (g_test) {
                        return acInfo.RunOnEnd();
                    }
                    if (g_curCorpsRushNum < MAX_CORPS_RUSH_NUM) {
                        TriggerAction.ShowTips("战争升级，兵团生产数量提升", TriggerDef.color.YELLOW);
                        g_curCorpsRushNum++;
                    }
                    return acInfo.RunOnEnd();
                }
            );

            // FRIEND_SUPPORT_START_TIME 秒之后判断是否需要刷兵支援
            TriggerGroup.AddTriggerExtend(triggerIdList,
                [new TriggerEvent.LoopTime([FRIEND_SUPPORT_START_TIME, false])],
                function* (acInfo, args) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    TriggerDef.LogMsg("开始判断是否开启友军的刷兵支援");
                    // 如果已通关，则不需要刷出支援兵团
                    if (!IS_PASS_CUR_LEVEL) {
                        TriggerDef.LogMsg("开启友军的刷兵支援, set g_enableRushSupportFriend true");
                        g_enableRushSupportFriend = true; // 允许友军刷兵支援
                    }
                    else {
                        TriggerDef.LogMsg("已通过当前关卡，不需要开启友军的刷兵支援");
                    }
                    return acInfo.RunOnEnd();
                }
            );

            // 友军死亡事件 // 如果守护单位阵亡将会引起一次大规模刷兵
            var myEvents = [];
            for (var i = 0; i < g_friendGuideUnitIdList.length; i++) {
                var unitId = g_friendGuideUnitIdList[i];
                var event = new TriggerEvent.UnitDead([unitId]);
                myEvents.push(event);
            }
            // 防御塔被摧毁, 将发动反击的触发
            TriggerGroup.AddTriggerExtend(triggerIdList,
                myEvents,
                function* (acInfo, args) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    TriggerAction.ShowTips("防御塔被摧毁，将发动反击", TriggerDef.color.YELLOW);
                    // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                    TriggerGroup.RunTrigger(triggerIdRushCorps,
                        {rush: FRIEND_BIG_RUSH_COUNT, count: 2, rushListList: FRIEND_RUSH_LIST, camp: TriggerDef.CAMP.HUMAN});
                    return acInfo.RunOnEnd();
                }
            );

            // 敌军死亡事件 // 如果守护单位阵亡将会引起一次大规模刷兵
            var enemyEvents = [];
            for (var i = 0; i < g_enemyGuideUnitIdList.length; i++) {
                var unitId = g_enemyGuideUnitIdList[i];
                var event = new TriggerEvent.UnitDead([unitId]);
                enemyEvents.push(event);
            }
            // 防御塔被摧毁, 将发动反击的触发
            TriggerGroup.AddTriggerExtend(triggerIdList,
                enemyEvents,
                function* (acInfo, args) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    TriggerAction.ShowTips("防御塔被摧毁，将发动反击", TriggerDef.color.YELLOW);
                    // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                    TriggerGroup.RunTrigger(triggerIdRushCorps,
                        {rush: ENEMY_BIG_RUSH_COUNT, count: 2, rushListList: ENEMY_RUSH_LIST, camp: TriggerDef.CAMP.ORC});
                    return acInfo.RunOnEnd();
                }
            );
            // 天气系统
            TriggerAction.RunWeatherTriggerFromIds(triggerIdList, TriggerAction.GetCurFbWeatherIds());
        };
    };

    // 当离开这个场景时
    var OnDestroy = function () {
        TriggerDef.LogMsg("销毁触发器 Handler_Level_1_1, OnDestroy()");
    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 101); // 1-1
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 102); // 1-2
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 103); // 1-3
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 104); // 1-4
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 105); // 1-5
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 201); // 2-1
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 202); // 2-2
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 203); // 2-3
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 204); // 2-4
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 205); // 2-5
}, "Handler_Level_1_1.js");
