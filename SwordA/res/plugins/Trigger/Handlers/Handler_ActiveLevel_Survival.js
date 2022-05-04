/**
 * Created by Administrator on 2019/03/26.
 * 活动副本，30天生存地图 // TODO: 待实现 20190326
 */

TriggerGroup.CreateHandler(function (triggerIdList) {
    // 初始化触发器
    var InitTrigger = function () {
        TriggerDef.LogMsg("运行关卡脚本 Handler_ActiveLevel_Survival, 活动副本，30天生存地图, InitTrigger()");
        //================================== 定义变量和一些默认操作 ==================================//
        // 常量定义
        var FB_ID = TriggerAction.GetCurFbId(); // 副本 id
        var MAX_SURVIVAL_DAY = 30; // 最大生存天数，到达那么多天后游戏胜利
        var LIFE_TIME = 360; // 敌方刷出的兵的生命周期
        var LEVEL_STATE_TICK = 1; // 关卡状态更新的间隔, 单位为秒

        // 变量定义
        var g_curDay = 1; // 当前的天数
        var g_towerPosDic = {}; // Dic<posName, unitId> // 各个槽位塔的 id // 每天会刷新一次

        g_towerPosDic["humanTowerPos_0"] = 0;
        g_towerPosDic["humanTowerPos_1"] = 0;
        g_towerPosDic["humanTowerPos_2"] = 0;
        g_towerPosDic["humanTowerPos_3"] = 0;
        // 触发器的一些固定用法
        var g_triggerIdRushCorpsList = []; // 刷兵触发器 id 数组 // List<triggerId>
        //================================================================//
        // 关闭计时器默认到期条件
        TriggerAction.CloseDefaultCountTimeOver();
        //================================================================//
        // 创建一堆刷兵触发器
        for (var i = 0; i < 12; i++) {
            // 创建刷兵触发器 // 己方刷兵，可控制刷多少拨，每拨刷多少单位
            // 直接运行的触发器，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
            var triggerId = TriggerAction.CreateSingleRushCorpsTrigger(triggerIdList, LIFE_TIME);

            g_triggerIdRushCorpsList.push(triggerId);
            TriggerGroup.CloseTrigger(triggerId); // 先关闭，等下看情况打开
        }
        //================================================================//
        // 控制关卡流程的简单状态机
        var g_curLevelState = 0; // 0: 初始, 1: 即将出兵, 2: 出兵中, 3: 出兵结束, 检测兵是否被打完, 4: 缓冲时间
        // 更新关卡状态的函数
        var UpdateLevelState = function () {
            switch (g_curLevelState) {
                case 0: // 初始
                    break;

                default:
                    break;
            }
        };

        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([1, false])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                yield TriggerAction.Wait(acInfo, LEVEL_STATE_TICK);
                while (true) {
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    UpdateLevelState();
                    yield TriggerAction.Wait(acInfo, LEVEL_STATE_TICK);
                }
                return acInfo.RunOnEnd();
            }
        );
        //================================================================//

        //================================================================//
        // 如果 userdata 为 EnemyBoss 的单位死亡则游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.UnitDead([null, "EnemyBoss"])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                TriggerAction.SetGameResult(TriggerDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );
        //================================================================//
        // 每隔 30 秒增加一次筹码值
        var triggerIdAddAward = TriggerAction.CreateAddChipTrigger(triggerIdList, TriggerDef.CAMP.HUMAN, 160, 90);

        TriggerGroup.RunTrigger(triggerIdAddAward);
        //================================================================//
    };

    // 当离开这个场景时
    var OnDestroy = function () {

    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10009); // 活动副本，30天生存地图
}, "Handler_ActiveLevel_Survival");
