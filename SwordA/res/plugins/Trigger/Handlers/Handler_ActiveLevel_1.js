/**
 * Created by Administrator on 2016/2/25.
 * 疯狂触手
 */

// 疯狂触手 // Q: 这个关卡怎么自定义创建基地? 20180916 A: 己方基地默认创建基地; 敌方基地由 enemyBaseId 确定, 如果不填则不创建。20180916
TriggerGroup.CreateHandler(function (triggerIdList) {
    //GameClient.LogMsg("this is Handler_ActiveLevel_1.js, 疯狂触手关卡");
    // 初始化触发器
    var InitTrigger = function () {
        GameClient.LogMsg("运行关卡脚本 Handler_ActiveLevel_1, 疯狂触手, InitTrigger()");
        //================================== 定义变量和一些默认操作 ==================================//
        // 常量定义
        var LIFE_TIME = 130; // 敌方刷出的兵的生命周期

        var ENEMY_TYPE_ID = 21084; // 敌方兵团 id // 地龙
        var ENEMY_RUSH_COUNT = 40; // 每波刷出的敌人数量
        var ENEMY_BIG_RUSH_COUNT = 80; // 大进攻刷出的敌人数量

        var BIG_RUSH_MOMENT = 7; // 敌方大进攻间隔
        var PER_RUSH_TIME = 7; // 刷新敌人间隔时间

        var FRIEND_GUIDE_CORPS_ID_LV1 = 21085; // 守护单位 // 初级箭塔
        var FRIEND_GUIDE_CORPS_ID_LV2 = 21086; // 守护单位 // 中级箭塔
        var ENEMY_GUIDE_CORPS_ID_LV1 = 21074; // 守护单位 // 小型触手
        var ENEMY_GUIDE_CORPS_ID_LV2 = 21073; // 守护单位 // 中型触手
        var BOSS_TYPE_ID = 21072; // boss id // 大型触手

        var STORY_ID = 5;

        // 变量定义
        var g_rushCount = 0; // 敌方刷怪波数

        var g_triggerIdRushStart = 0; // 用于控制刷兵的触发器
        var g_triggerIdAddAward = 0; // 用于每隔一段时间增加一次筹码值的触发器
        var g_triggerIdRushCorpsList = []; // 刷兵触发器 id 数组 // List<triggerId>

        var g_enemyBossPos = TriggerAction.GetNodePos("base_orc");
        var g_enemyGuideUnitIdList = []; // List<unitId> // 敌军的守护单位 id 列表

        { // 创建守护单位
            var posLv1 = 1;
            var posLv2 = 2;
            var unitIdList; // List<unitId>

            TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV1, GameDataDef.CAMP.HUMAN, posLv1); // corpsCid, camp, posIndex
            TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV2, GameDataDef.CAMP.HUMAN, posLv2); // corpsCid, camp, posIndex

            unitIdList = TriggerAction.CreateGuideUnit(ENEMY_GUIDE_CORPS_ID_LV1, GameDataDef.CAMP.ORC, posLv1);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
            unitIdList = TriggerAction.CreateGuideUnit(ENEMY_GUIDE_CORPS_ID_LV2, GameDataDef.CAMP.ORC, posLv2);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
        }

        // 创建敌方主将 // 是一只章鱼触手
        var g_bossId = TriggerAction.CreateMonster(BOSS_TYPE_ID, GameDataDef.CAMP.ORC, g_enemyBossPos);

        // 关闭计时器默认到期条件
        TriggerAction.CloseDefaultCountTimeOver();

        // 设置出兵进攻距离
        TriggerAction.SetAttackDis(GameDataDef.CAMP.HUMAN, GameClient.FightSetting.LV1_BUILDING_POS_X);

        //=============== 关卡逻辑 ===============//
        // 产生指挥官战斗单位
        var posHuman = TriggerAction.GetNodePos("base_human"); // GameDataDef.CAMP.HUMAN

        posHuman.y -= 5;
        TriggerAction.CreateCommanderFightUnit(GameDataDef.CAMP.HUMAN, posHuman, 21061); // 高阶剧毒魔法师

        //================================== 添加触发器 ==================================//
        //================================================================//
        // 1 秒之后开始播放剧情，播放剧情结束之后开始游戏
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([0.5, false])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                GameClient.LogMsg("步骤一：播放剧情");
                TriggerAction.ShowStory(STORY_ID);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 剧情播放结束之后开打
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.StoryOver([STORY_ID])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                GameClient.LogMsg("步骤二：开始刷兵并设置一些后续步骤");
                TriggerGroup.OpenTrigger(g_triggerIdRushStart);
                TriggerGroup.RunTrigger(g_triggerIdAddAward);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 0.1 秒之后开始刷敌方士兵 // 先关闭，等下看情况打开
        g_triggerIdRushStart = TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([0.1, false])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                // 开始等待 0.1 秒触发一波出兵，随后每 12 秒出一波兵
                yield TriggerAction.Wait(acInfo.co, 0.1);
                while (true) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    var rush = ENEMY_RUSH_COUNT;

                    g_rushCount++;
                    // 每 6 波刷一大波兵
                    if (g_rushCount % BIG_RUSH_MOMENT == 0) {
                        rush = ENEMY_BIG_RUSH_COUNT;
                    }
                    // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                    TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                        {rush: rush, count: 1, corpsCid: ENEMY_TYPE_ID, camp: GameDataDef.CAMP.ORC});
                    yield TriggerAction.Wait(acInfo.co, PER_RUSH_TIME);
                }
                return acInfo.RunOnEnd();
            }
        );
        TriggerGroup.CloseTrigger(g_triggerIdRushStart);

        //================================================================//
        // 每隔 30 秒增加一次筹码值
        g_triggerIdAddAward = TriggerAction.CreateAddChipTrigger(triggerIdList, GameDataDef.CAMP.HUMAN, 10);

        //================================================================//
        // boss 死亡游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.UnitDead([g_bossId])],
            function* (acInfo, args) {
                TriggerGroup.CloseTrigger(g_triggerIdAddAward);
                TriggerAction.SetGameResult(GameDataDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 计时结束，游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.CountTimeOver()],
            function* (acInfo, args) {
                TriggerGroup.CloseTrigger(g_triggerIdAddAward);
                TriggerAction.SetGameResult(GameDataDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 创建一堆刷兵触发器
        for (var i = 0; i < 6; i++) {
            // 创建刷兵触发器 // 己方刷兵，可控制刷多少拨，每拨刷多少单位
            // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
            var triggerId = TriggerAction.CreateSingleRushCorpsTrigger(triggerIdList, LIFE_TIME);

            g_triggerIdRushCorpsList.push(triggerId);
            TriggerGroup.CloseTrigger(triggerId); // 先关闭，等下看情况打开
        }

        //================================================================//
        // 如果守护单位阵亡将会引起一次大规模刷兵 // 敌军死亡事件列表 // List<Event>
        var eventList = [];
        for (var i = 0; i < g_enemyGuideUnitIdList.length; i++) {
            var unitId = g_enemyGuideUnitIdList[i];
            var event = new TriggerEvent.UnitDead([unitId]);
            eventList.push(event);
        }

        TriggerGroup.AddTriggerExtend(triggerIdList,
            eventList,
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                TriggerAction.ShowTips("防御塔被摧毁，将发动反击", TriggerDef.color.YELLOW);
                // 开始一波刷兵，刷 rush 次，每次出 count 个兵
                TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                    {rush: ENEMY_BIG_RUSH_COUNT, count: 2, corpsCid: ENEMY_TYPE_ID, camp: GameDataDef.CAMP.ORC});
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
    };

    // 当离开这个场景时
    var OnDestroy = function () {

    };

    // 初始化这张地图的触发器
    // triggerIdList, initTrigger, onDestroy, mapId, fbId
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10001);
}, "Handler_ActiveLevel_1");
