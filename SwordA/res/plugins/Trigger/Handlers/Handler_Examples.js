/**
 * Created by Administrator on 2016/2/10.
 * 触发器示例
 * 触发器示例运行的流程:
 *  1、满足初始化触发条件 -> ClearTriggersAndAddExitTriggerEvent() -> InitVariable() -> InitTrigger()
 *  2、满足销毁触发条件 -> OnDestroy()
 */

//console.log("this is Handler_Examples.js");
// ps: 这里还可以将闭包用到更深一层，就是每次满足初始化触发条件的时候都运行一个函数，在这个函数内执行示例流程，这样可以避免同时进入同一个关卡时触发器的清理工作，但目前还用不到，先记着
TriggerGroup.CreateHandler(function (triggerIdList) {
    // 初始化触发器
    var InitTrigger = function () {
        TriggerDef.LogMsg("运行关卡脚本 Handler_Examples, InitTrigger()");
        //...

        // region // 一个完整的触发器添加示例
        var tempValue = 0;

        TriggerGroup.AddTriggerExtend(triggerIdList,
            [new TriggerEvent.LoopTime([1, false])], // 先随便添加一个事件
            function* (acInfo, args) {
                TriggerDef.LogMsg("examples, trigger, Start(), tempValue: {0}", tempValue);
                // 如果战斗已经结束则直接返回
                if (TriggerAction.IsFightOver()) {
                    return acInfo.RunOnEnd();
                }
                yield TriggerAction.Wait(acInfo, 0.5);
                while (true) {
                    TriggerDef.LogMsg("examples, trigger, Update(), tempValue: {0}", tempValue);
                    // 如果战斗已经结束则直接返回
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    tempValue++;
                    if (tempValue >= 15) {
                        break;
                    }
                    yield TriggerAction.Wait(acInfo, 0.5);
                }
                TriggerDef.LogMsg("examples, trigger, End(), tempValue: {0}", tempValue);
                return acInfo.RunOnEnd();
            }
        );
        // endregion // 一个完整的触发器添加示例
    };

    // 当离开这个场景时
    var OnDestroy = function () {
        TriggerDef.LogMsg("销毁触发器 Handler_Examples, OnDestroy()");
        //...
    };

    // 初始化这张地图的触发器
    TriggerGroup.InitTriggerInMap(triggerIdList, InitTrigger, OnDestroy, 0, 0);
}, "Handler_Examples");
