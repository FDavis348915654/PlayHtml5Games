/**
 * Created by Administrator on 2016/2/25.
 * 奇迹峡谷
 */

// 深渊洞穴
TriggerGroup.CreateHandler(function (triggerIdList) {
    // 初始化触发器
    var InitTrigger = function () {
        TriggerDef.LogMsg("运行关卡脚本 Handler_ActiveLevel_4, 奇迹峡谷, InitTrigger()");
        //================================== 定义变量和一些默认操作 ==================================//

        // 设置敌方的基地 id
        levelModel.m_enemyBaseId = TriggerAction.GetUnitIdFromUserdata("orcBase"); // tips: 另一种方式是监听 userdata 为 orcBase 的单位死亡的消息

        // 产生指挥官战斗单位
        var posHuman = TriggerAction.GetNodePos("base_human"); // TriggerDef.CAMP.HUMAN

        posHuman.y -= 5;
        TriggerAction.CreateCommanderFightUnit(TriggerDef.CAMP.HUMAN, posHuman, 21046); // 黑龙
    };

    // 当离开这个场景时
    var OnDestroy = function () {

    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, null, 10004);
}, "Handler_ActiveLevel_4");
