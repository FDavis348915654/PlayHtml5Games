/**
 * Created by Administrator on 2018/11/09.
 * 活动试练等防守地图，时间到或者 userData 为 EnemyBoss 的单位死亡则胜利
 */

TriggerGroup.CreateHandler(function (triggerIdList) {
    // 初始化触发器
    var InitTrigger = function () {
        GameClient.LogMsg("运行关卡脚本 Handler_ActiveLevel_5, 活动试练, InitTrigger()");
        //================================== 定义变量和一些默认操作 ==================================//
        // 常量定义
        var FB_ID = TriggerAction.GetCurFbId(); // 副本 id
        var LIFE_TIME = 130; // 敌方刷出的兵的生命周期

        var ENEMY_TYPE_ID = 21084; // 敌方兵团 id // 地龙
        var ENEMY_RUSH_COUNT = 40; // 每波刷出的敌人数量
        var ENEMY_BIG_RUSH_COUNT = 80; // 大进攻刷出的敌人数量

        var BIG_RUSH_MOMENT = 8; // 敌方大进攻间隔
        var PER_RUSH_TIME = 12; // 刷新敌人间隔时间

        // 变量定义
        var g_rushCount = 0; // 敌方刷怪波数

        var g_triggerIdRushCorpsList = []; // 刷兵触发器 id 数组 // List<triggerId>

        //================================================================//
        switch (FB_ID) {
            case 10008:
                ENEMY_TYPE_ID = 21001; // 骷髅战士
                ENEMY_RUSH_COUNT = 35; // 每波刷出的敌人数量
                BIG_RUSH_MOMENT = 6; // 敌方大进攻间隔
                PER_RUSH_TIME = 10; // 刷新敌人间隔时间
                break;

            default:
                break;
        }
        //================================================================//
        // 关闭计时器默认到期条件
        TriggerAction.CloseDefaultCountTimeOver();
        //=============== 关卡逻辑 ===============//
        // 产生指挥官战斗单位
        var posHuman = TriggerAction.GetNodePos("base_human"); // GameDataDef.CAMP.HUMAN

        posHuman.y -= 5;
        TriggerAction.CreateCommanderFightUnit(GameDataDef.CAMP.HUMAN, posHuman, 21045); // 疯狂的海盗纵火狂
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
        // 2 秒之后开始刷敌方士兵
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([2, false])],
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

        //================================================================//
        // 如果 userdata 为 EnemyBoss 的单位死亡则游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.UnitDead([null, "EnemyBoss"])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                TriggerAction.SetGameResult(GameDataDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 计时结束，游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.CountTimeOver()],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                TriggerAction.SetGameResult(GameDataDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );

        //================================================================//
        // 每隔 30 秒增加一次筹码值
        var triggerIdAddAward = TriggerAction.CreateAddChipTrigger(triggerIdList, GameDataDef.CAMP.HUMAN, 150);
        TriggerGroup.RunTrigger(triggerIdAddAward);
        //================================================================//
    };

    // 当离开这个场景时
    var OnDestroy = function () {

    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10005); // 活动试练
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10006); // 兽栏
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10007); // 锤子村守护战
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10008); // 骷髅海
}, "Handler_ActiveLevel_5");
