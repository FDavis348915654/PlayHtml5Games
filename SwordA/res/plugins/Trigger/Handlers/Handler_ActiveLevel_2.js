/**
 * Created by Administrator on 2016/2/25.
 * 骷髅废墟
 */

// 骷髅废墟
TriggerGroup.CreateHandler(function (triggerIdList) {
    // 初始化触发器
    var InitTrigger = function () {
        GameClient.LogMsg("运行关卡脚本 Handler_ActiveLevel_2, 骷髅废墟, InitTrigger()");
        //================================== 定义变量和一些默认操作 ==================================//
        // 常量定义
        var FRIEND_GUIDE_CORPS_ID_LV1 = 21112; // 守护单位 // 专精弓箭手瞭望台
        var FRIEND_GUIDE_CORPS_ID_LV2 = 21113; // 守护单位 // 战场弓箭手瞭望台
        var STORY_ID = 5;

        // 变量定义
        var g_triggerIdAddAward = 0; // 用于每隔一段时间增加一次筹码值的触发器

        // 创建守护单位
        TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV1, GameDataDef.CAMP.HUMAN, 1); // corpsCid, camp, posIndex
        TriggerAction.CreateGuideUnit(FRIEND_GUIDE_CORPS_ID_LV2, GameDataDef.CAMP.HUMAN, 2); // corpsCid, camp, posIndex

        // 关闭计时器默认到期条件
        TriggerAction.CloseDefaultCountTimeOver();

        // 设置出兵进攻距离
        TriggerAction.SetAttackDis(GameDataDef.CAMP.HUMAN, GameClient.FightSetting.LV1_BUILDING_POS_X);
        //=============== 关卡逻辑 ===============//
        // 产生指挥官战斗单位
        var posHuman = TriggerAction.GetNodePos("base_human"); // GameDataDef.CAMP.HUMAN

        posHuman.y -= 5;
        TriggerAction.CreateCommanderFightUnit(GameDataDef.CAMP.HUMAN, posHuman, 21011); // 战场弓箭手
        //================================== 添加触发器 ==================================//
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

        // 剧情播放结束之后开打（时间线出兵）
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.StoryOver([STORY_ID])],
            function* (acInfo, args) {
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                GameClient.LogMsg("步骤二：开始刷兵并设置一些后续步骤");
                TriggerGroup.RunTrigger(g_triggerIdAddAward);
                TriggerAction.CreateTimeLineAndRun("skeleton_ruins"); // 时间线出兵
//                    TriggerAction.CreateTimeLineAndRun("tower_defense"); // 时间线出兵
                return acInfo.RunOnEnd();
            }
        );

        // 每隔 30 秒增加一次筹码值
        g_triggerIdAddAward = TriggerAction.CreateAddChipTrigger(triggerIdList, GameDataDef.CAMP.HUMAN, 30);

        // 计时结束，游戏胜利
        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.CountTimeOver()],
            function* (acInfo, args) {
                TriggerGroup.CloseTrigger(g_triggerIdAddAward);
                TriggerAction.SetGameResult(GameDataDef.GAME_RESULT.WIN);
                return acInfo.RunOnEnd();
            }
        );
    };

    // 当离开这个场景时
    var OnDestroy = function () {

    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10002);
}, "Handler_ActiveLevel_2");
