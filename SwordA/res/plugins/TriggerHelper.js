/**
 * Created by 34891 on 2022/4/9.
 * 供 TriggerCom.TriggerManager 调用, 解决 jscomp 编译不过的情况
 */

var TriggerHelper = TriggerHelper || {};

/**
 * @function - 初始化触发器，每张地图都需要这样的函数
 * @param {TriggerCom.TriggerManager} triggerMgr - 局部触发器 id 数组
 * @param {Number[]} triggerIdList - 局部触发器 id 数组
 * @param initTrigger - 初始化触发器的函数
 * @param onDestroy - 地图退出时调用
 * @param {Number} mapId - 地图退出时调用
 * @param {Number} fbId - 地图 id 为 mapId 时触发
 */
TriggerHelper.InitTriggerInMap = function (triggerMgr, triggerIdList, initTrigger, onDestroy, mapId, fbId) {
    if (triggerIdList == null) {
        return;
    }
    // 清空所有当前关卡的触发器
    var ClearTrigger = function () {
        for (var i = triggerIdList.length - 1; i >= 0; i--) {
            triggerMgr.RemoveTrigger(triggerIdList[i]);
            triggerIdList.splice(i, 1);
        }
    };
    var ClearTriggersAndAddExitTriggerEvent = function () {
        // 清空所有当前关卡的触发器
        ClearTrigger();
        // 添加一个退出场景时移除所有触发器的触发器
        triggerMgr.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.ExitScene()], // 在这里添加事件，可以添加一组事件 //...
            function* (acInfo, args) {
                GameClient.LogMsg("===== Trigger all remove EventPlayExit, mapid is {0}, fbId: {1}", String(mapId), String(fbId));
                // 清空所有当前关卡的触发器
                ClearTrigger();
                // 运行销毁函数
                if (onDestroy != null) {
                    onDestroy();
                }
                return acInfo.RunOnEnd();
            }
        );
    };
    // 添加一个启动整个触发器的触发器
    triggerMgr.AddTrigger(
        [new TriggerEvent.FightStart([mapId, fbId])], // 在这里添加事件，可以添加一组事件 //...
        new TriggerCom.Action(
            function* (acInfo, args) {
                GameClient.LogMsg("===== Trigger init, mapid is {0}, fbId: {1}", mapId, fbId);
                // 先清理一遍触发器，然后在添加一个退出场景时销毁全部触发器的触发器
                ClearTriggersAndAddExitTriggerEvent();
                // 初始化触发器
                if (initTrigger != null) {
                    initTrigger();
                }
                return acInfo.RunOnEnd();
            }
        )
    );
};
