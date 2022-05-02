/**
 * Created by Administrator on 2016/2/25.
 * 镜像对决
 */

//console.log("this is Handler_PVPLevel_5000.js");
TriggerGroup.CreateHandler(function (triggerIdList) {
    // DONE: 用一个数组来规范出兵 // 已实现，接口为 CreateTimeLineAndRun() // 20180217
    // 初始化触发器
    var InitTrigger = function () {
        TriggerDef.LogMsg("运行关卡脚本 Handler_PVPLevel_5000, InitTrigger()");
//        // 关闭计时器默认到期条件
//        TriggerAction.CloseDefaultCountTimeOver();
        //=============== 常量定义 ===============//
        var LIFE_TIME = 360; // 刷出的 boss 单位的生命周期
        var GUIDE_UNIT_TYPE_LV1_ID = 21086; // 守护单位 // 树塔
        var GUIDE_UNIT_TYPE_LV2_ID = 21087; // 守护单位 // 树塔

        var MELEE_CORPS_ID = 21103; // 近战兵
        var REMOTE_CORPS_ID = 21041; // 远程兵
//        var MELEE_CORPS_ID = 0; // 近战兵 // @test
//        var REMOTE_CORPS_ID = 0; // 远程兵 // @test
        var RUSH_MELEE_COUNT = 6;
        var RUSH_REMOTE_COUNT = 2;
        var BIG_RUSH_MELEE_COUNT = 12;
        var BIG_RUSH_REMOTE_COUNT = 5;
        var BIG_RUSH_MOMENT = 4; // 敌方大进攻间隔
        var PER_RUSH_TIME = 18; // 刷新敌人间隔时间

        var BOSS_CORPS_ID_LIST = []; // List<corpsCid>
        var SOLDIER_CORPS_ID_DIC = { // 出战英雄中需要剔除的小兵单位
            "21103": true,
            "21041": true,
            "21042": true
        };

        var CORPS_RUSH_UPGRADE_NUM_TIME = 75; // 刷兵数量翻倍间隔，单位秒
        var MAX_CORPS_RUSH_NUM = 5; // 最高的刷兵倍数

        //=============== 变量定义 ===============//
        var g_rushCount = 0; // 敌方刷怪波数

        var g_triggerIdRushCorpsList = []; // 刷兵触发器 id 数组 // List<triggerId>

        var g_friendGuideUnitIdList = []; // List<unitId> // 友军的守护单位 id 列表
        var g_enemyGuideUnitIdList = []; // List<unitId> // 敌军的守护单位 id 列表

        var g_curCorpsRushNum = 1; // 当前的刷兵数量 // 会随着时间递增

        { // 设置随机上场的 boss 单位
            for (var k in playerModel.m_corpsDatas) {
                if (!SOLDIER_CORPS_ID_DIC[k]) {
                    BOSS_CORPS_ID_LIST.push(k);
                }
            }
        }

        { // 创建守护单位
            var posLv1 = 1;
            var posLv2 = 2;
            var unitIdList = null; // List<unitId>

            unitIdList = TriggerAction.CreateGuideUnit(GUIDE_UNIT_TYPE_LV1_ID, TriggerDef.CAMP.HUMAN, posLv1);
            for (var i = 0; i < unitIdList.length; i++) {
                g_friendGuideUnitIdList.push(unitIdList[i]);
            }
            unitIdList = TriggerAction.CreateGuideUnit(GUIDE_UNIT_TYPE_LV2_ID, TriggerDef.CAMP.HUMAN, posLv2);
            for (var i = 0; i < unitIdList.length; i++) {
                g_friendGuideUnitIdList.push(unitIdList[i]);
            }

            unitIdList = TriggerAction.CreateGuideUnit(GUIDE_UNIT_TYPE_LV1_ID, TriggerDef.CAMP.ORC, posLv1);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
            unitIdList = TriggerAction.CreateGuideUnit(GUIDE_UNIT_TYPE_LV2_ID, TriggerDef.CAMP.ORC, posLv2);
            for (var i = 0; i < unitIdList.length; i++) {
                g_enemyGuideUnitIdList.push(unitIdList[i]);
            }
        }

        // 创建雷神之锤中立单位 // test
        var centerPos = TriggerAction.GetCurMapCenterPos();

        TriggerAction.CreateMonster(21109, TriggerDef.CAMP.NEUTRAL_FRIEND, centerPos);

        // 创建指挥官战斗单位 // test
        var posHuman = TriggerAction.GetNodePos("base_human"); // TriggerDef.CAMP.HUMAN
        var posOrc = TriggerAction.GetNodePos("base_orc"); // TriggerDef.CAMP.ORC

        posHuman.y -= 5;
        posOrc.y -= 5;
        TriggerAction.CreateCommanderFightUnit(TriggerDef.CAMP.HUMAN, posHuman, 21009); // 高阶寒冰魔法师
        TriggerAction.CreateCommanderFightUnit(TriggerDef.CAMP.ORC, posOrc, 21010); // 高阶火焰魔法师

        // 相机置到可视范围中心
        TriggerAction.ScrollToCamera(0.5, 0.5);

        //================================================================//
        // 准备开始刷兵
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([1, false])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                // 开始等待 0.1 秒触发一波出兵，随后每 PER_RUSH_TIME 秒出一波兵
                yield TriggerAction.Wait(acInfo.co, 0.1);
                while (true) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    var rushMelee = RUSH_MELEE_COUNT;
                    var rushRemote = RUSH_REMOTE_COUNT;

                    g_rushCount++;
                    // 每 6 波刷一大波兵
                    if (g_rushCount % BIG_RUSH_MOMENT == 0) {
                        rushMelee = BIG_RUSH_MELEE_COUNT;
                        rushRemote = BIG_RUSH_REMOTE_COUNT;

                        if (BOSS_CORPS_ID_LIST.length > 0) {
                            // 刷 boss
                            var bossCorpsId = 0;
                            // 刷出敌方 boss 单位
                            bossCorpsId = BOSS_CORPS_ID_LIST[TriggerDef.Math.FloatToInt(TriggerDef.Math.RandRange(0, BOSS_CORPS_ID_LIST.length))];
                            TriggerAction.RushNpcAndSetLifeTime(bossCorpsId, TriggerDef.CAMP.ORC, LIFE_TIME);
                            // 刷出友方 boss 单位
                            bossCorpsId = BOSS_CORPS_ID_LIST[TriggerDef.Math.FloatToInt(TriggerDef.Math.RandRange(0, BOSS_CORPS_ID_LIST.length))];
                            TriggerAction.RushNpcAndSetLifeTime(bossCorpsId, TriggerDef.CAMP.HUMAN, LIFE_TIME);
                        }
                    }

                    // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                    TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                        {rush: rushMelee, count: g_curCorpsRushNum, corpsCid: MELEE_CORPS_ID, camp: TriggerDef.CAMP.ORC});
                    // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                    TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                        {rush: rushRemote, count: g_curCorpsRushNum, corpsCid: REMOTE_CORPS_ID, camp: TriggerDef.CAMP.ORC});
                    // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                    TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                        {rush: rushMelee, count: g_curCorpsRushNum, corpsCid: MELEE_CORPS_ID, camp: TriggerDef.CAMP.HUMAN});
                    // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                    TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                        {rush: rushRemote, count: g_curCorpsRushNum, corpsCid: REMOTE_CORPS_ID, camp: TriggerDef.CAMP.HUMAN});
                    yield TriggerAction.Wait(acInfo.co, PER_RUSH_TIME);
                }
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 每隔一段时间提升刷兵数量
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([CORPS_RUSH_UPGRADE_NUM_TIME, true])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                if (g_curCorpsRushNum < MAX_CORPS_RUSH_NUM) {
                    TriggerAction.ShowTips("战争升级，兵团生产数量提升", TriggerDef.color.YELLOW);
                    g_curCorpsRushNum++;
                }
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 创建一堆刷兵触发器
        for (var i = 0; i < 10; i++) {
            // 创建刷兵触发器 // 己方刷兵，可控制刷多少拨，每拨刷多少单位
            // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
            var triggerId = TriggerAction.CreateSingleRushCorpsTrigger(triggerIdList, LIFE_TIME);

            g_triggerIdRushCorpsList.push(triggerId);
            TriggerGroup.CloseTrigger(triggerId); // 先关闭，等下看情况打开
        }

        //================================================================//
        // 如果守护单位阵亡将会引起一次大规模刷兵
        var eventList = null; // List<Event>

        // 友军
        eventList = [];
        for (var i = 0; i < g_friendGuideUnitIdList.length; i++) {
            var unitId = g_friendGuideUnitIdList[i];
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
                // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                    {rush: BIG_RUSH_MELEE_COUNT, count: 2, corpsCid: MELEE_CORPS_ID, camp: TriggerDef.CAMP.HUMAN});
                // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                    {rush: BIG_RUSH_REMOTE_COUNT, count: 2, corpsCid: REMOTE_CORPS_ID, camp: TriggerDef.CAMP.HUMAN});
                return acInfo.RunOnEnd();
            }
        );

        // 敌军
        eventList = [];
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
                // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                    {rush: BIG_RUSH_MELEE_COUNT, count: 2, corpsCid: MELEE_CORPS_ID, camp: TriggerDef.CAMP.ORC});
                // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
                TriggerGroup.RunOneTrigger(g_triggerIdRushCorpsList,
                    {rush: BIG_RUSH_REMOTE_COUNT, count: 2, corpsCid: REMOTE_CORPS_ID, camp: TriggerDef.CAMP.ORC});
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
    };

    // 当离开这个场景时
    var OnDestroy = function () {
        TriggerDef.LogMsg("销毁触发器 Handler_PVPLevel_5000, OnDestroy()");
    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, TriggerDef.FightSetting.PVP_FB_ID_B);
}, "Handler_PVPLevel_20002");
