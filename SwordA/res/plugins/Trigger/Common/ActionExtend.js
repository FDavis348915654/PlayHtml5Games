/**
 * Created by 34891 on 2022/4/10.
 */

// region 扩展动作
(function () {
    TriggerDef.LogMsg("ActionExtend, 初始化 action 扩展脚本");
    /**
     * @function - 刷出单位
     * @param {Number} corpsCid
     * @param {TriggerDef.CAMP} camp
     * @param {Number} lifeTime
     * @param {Number} way - 0: 无, 1: 上路, 2: 中路, 3: 下路
     * @returns {Number} - unitId
     */
    TriggerAction.RushNpcAndSetLifeTime = function (corpsCid, camp, lifeTime, way) {
        var beginPos = null;
        var targetPos = null;
        var monsterId = 0;

        lifeTime = lifeTime || -1;
        way = way || TriggerDef.CorpsWay.None;
        switch (camp) {
            case TriggerDef.CAMP.HUMAN:
            case TriggerDef.CAMP.ORC:
                beginPos = TriggerAction.GetRushBeginPos(camp, way);
                targetPos = TriggerAction.GetRushEndPos(camp, way);
                monsterId = TriggerAction.CreateMonster(corpsCid, camp, beginPos, targetPos, lifeTime);
                break;

            default:
                break;
        }
        return monsterId;
    };

    /**
     * @function - 创建守护单位。注: 这个接口里面记录守护单位
     * @param {Number} corpsCid
     * @param {TriggerDef.CAMP} camp
     * @param {Number} posIndex -  防御塔位置编号，1 为前线位置 2 为总部位置
     * @param {Number} num - 创造防御塔的数量，只有 1 和 2 有效
     * @returns {Number[]} -  List<unitId>
     */
    TriggerAction.CreateGuideUnit = function (corpsCid, camp, posIndex, num) {
        TriggerDef.LogMsg("CreateGuideUnit(), corpsCid: {0} , camp: {1} , posIndex: {2} , num: {3}", corpsCid, camp, posIndex, num);
        var guardIdList = []; // List<unitId>
        // 容错判断
        if (corpsCid == 0) {
            return guardIdList;
        }
        // 容错判断
        posIndex = posIndex || 1;

        var pos = null; // cc.Point
        var posList = null; // List<cc.Point>
        var xDis = 0; // 距离起点的距离
        // 计算 x 方向的偏移
        if (posIndex == TriggerDef.TownPosOffset.PosLv1) {
            xDis = TriggerDef.FightSetting.LV1_BUILDING_POS_X;
        }
        else if (posIndex == TriggerDef.TownPosOffset.PosLv2) {
            xDis = TriggerDef.FightSetting.LV2_BUILDING_POS_X;
        }
        // 获取阵营点和守护单位的赋值
        switch (camp) {
            case TriggerDef.CAMP.HUMAN:
                pos = TriggerAction.GetNodePos("base_human");
                break;
            case TriggerDef.CAMP.ORC:
                pos = TriggerAction.GetNodePos("base_orc");
                xDis = -xDis; // 敌方的防御塔从右边开始放
                break;

            default:
                break;
        }
        // 计算阵营点
        if (pos != null) {
            if (num == 1) {
                posList = [TriggerDef.CreatePoint(pos.x + xDis, pos.y)]; // 一个点
            }
            else {
                posList = [TriggerDef.CreatePoint(pos.x + xDis, pos.y - 100), TriggerDef.CreatePoint(pos.x + xDis, pos.y + 100)]; // 两个点
            }
        }

        if (posList != null) {
            for (var i = 0; i < posList.length; i++) {
                // 创建守护单位
                var unitId = TriggerAction.CreateMonster(corpsCid, camp, posList[i]);
                guardIdList.push(unitId);
            }
        }
        return guardIdList;
    };

    // 返回: 可直接运行的触发器 id，输入参数 args: {rush: Number, count: Number, rushListList: List<List<corpsCid>>, camp: TriggerDef.CAMP}, rush 波数, count: 每波刷兵数量
    // 触发器传递的参数 rushListList 详解, 每次出的兵为 rush 下标的兵，出 count 次，但 count 次有限制，单次出兵的最大次数还受 rushList 的 lenght 限制
    /**
     * @function - 创建一个刷兵的 trigger // TriggerAction.CreateRushCorpsTrigger(triggerIdList, lifeTime)
     * @param {Number[]} triggerIdList
     * @param {Number} lifeTime - 刷出的兵的生命倒计时
     * @returns {Number} - triggerId
     */
    TriggerAction.CreateRushCorpsTrigger = function (triggerIdList, lifeTime) {
        var triggerId = TriggerGroup.AddTriggerExtend(triggerIdList,
            null,
            function* (acInfo, args) {
                var m_rushCount = 0; // 刷兵波数计数
                var m_rush = 3; // 出兵波数
                var m_count = 2; // 每波出兵数
                var m_rushListList = null; // List<List<corpsCid>>
                var m_camp = 0;

                if (args != null) {
                    m_rush = args.rush;
                    m_count = args.count;
                    m_rushListList = args.rushListList;
                    m_camp = args.camp;
                }
                yield TriggerAction.Wait(acInfo, 1);
                while (true) {
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }

                    if (m_rushCount >= m_rush) {
                        return acInfo.RunOnEnd();
                    }

                    for (var i = 0; i < m_count; i++) {
                        for (var j = 0; j < m_rushListList.length; j++) {
                            var rushList = m_rushListList[j];

                            if (i < rushList.length) {
                                var corpsCid = rushList[m_rushCount];
                                if (corpsCid != null) {
                                    TriggerAction.RushNpcAndSetLifeTime(corpsCid, m_camp, lifeTime);
                                }
                            }
                        }
                    }
                    m_rushCount++;
                    // tips: 由于每次 Update() 有一段间隔，所以运行完 Update() 再判断一次，提高触发器的利用率
                    if (m_rushCount >= m_rush) {
                        return acInfo.RunOnEnd();
                    }
                    yield TriggerAction.Wait(acInfo, 0.5);
                }
                return acInfo.RunOnEnd();
            }
        );
        return triggerId;
    };

    // 返回: 可直接运行的触发器 id，输入参数 args: {rush: Number, count: Number, corpsCid: 要刷的单位 id, camp: 要刷的单位的阵营}, rush 波数, count: 每波刷兵数量
    /**
     * @function - 创建一个刷兵的 trigger // TriggerAction.CreateSingleRushCorpsTrigger(triggerIdList, lifeTime)
     * @param {Number[]} triggerIdList
     * @param {Number} lifeTime - 刷出的兵的生命倒计时, 为固定参数
     * @returns {Number} - triggerId
     */
    TriggerAction.CreateSingleRushCorpsTrigger = function (triggerIdList, lifeTime) {
        var triggerId = TriggerGroup.AddTriggerExtend(triggerIdList,
            null,
            function* (acInfo, args) {
                var m_rushCount = 0; // 用于统计刷兵次数
                var m_rush = 3; // 默认出兵波数
                var m_count = 2; // 默认每波出兵数
                var m_corpsCid = 0; // 要刷的兵
                var m_camp = 0; // 刷兵的阵营

                if (args != null) {
                    m_rush = args.rush;
                    m_count = args.count;
                    m_corpsCid = args.corpsCid;
                    m_camp = args.camp;
                }
                yield TriggerAction.Wait(acInfo, 1);
                while (true) {
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    if (m_rushCount >= m_rush) {
                        return acInfo.RunOnEnd();
                    }
                    for (var i = 0; i < m_count; i++) {
                        TriggerAction.RushNpcAndSetLifeTime(m_corpsCid, m_camp, lifeTime);
                    }
                    m_rushCount++;
                    // tips: 由于每次 Update() 有一段间隔，所以运行完 Update() 再判断一次，提高触发器的利用率
                    if (m_rushCount >= m_rush) {
                        return acInfo.RunOnEnd();
                    }
                    yield TriggerAction.Wait(acInfo, 0.05);
                }
                return acInfo.RunOnEnd();
            }
        );
        return triggerId;
    };

    /**
     * @function - 定时加筹码 // TriggerAction.CreateAddChipTrigger(triggerIdList, camp, addChip)
     * @param {Number[]} triggerIdList
     * @param {TriggerDef.CAMP} camp
     * @param {Number} addChip
     * @param {Number} tickTime
     * @returns {Number} - triggerId
     */
    TriggerAction.CreateAddChipTrigger = function (triggerIdList, camp, addChip, tickTime) {
        // 设置默认的筹码值
        addChip = addChip || 30;
        // 设置默认的更新时间
        tickTime = tickTime || 30;
        // 每隔 30 秒增加一次筹码值
        var triggerId = TriggerGroup.AddTriggerExtend(triggerIdList,
            null,
            function* (acInfo, args) {
                yield TriggerAction.Wait(acInfo, tickTime);
                while (true) {
                    if (TriggerAction.IsFightOver()) {
                        return acInfo.RunOnEnd();
                    }
                    var ret = TriggerAction.AddCommanderChip(camp, addChip);

                    if (ret && addChip > 0) {
                        TriggerAction.ShowTips("获得 " + addChip + " 筹码值！", TriggerDef.color.GREEN);
                    }
                    yield TriggerAction.Wait(acInfo, tickTime);
                }
                return acInfo.RunOnEnd();
            }
        );
        return triggerId;
    };

    // 创建闪电攻击触发器 // args: {skillId:number, camp:TriggerDef.CAMP, count:number, interval:number}
    TriggerAction.CreateSpellSkillTrigger = function (triggerIdList) {
        var triggerId = TriggerGroup.AddTriggerExtend(triggerIdList,
            null,
            function* (acInfo, args) {
                // 施法技能 id, 比如为 32076
                var skillId = args[0];
                // 闪电攻击所属阵营
                var camp = args[1] || TriggerDef.CAMP.NONE;
                // 闪电攻击次数
                var count = args[2] || 5;
                // 闪电攻击间隔
                var interval = args[3] || 1;
                var casterId = TriggerAction.GetDummyUnitId(camp);
                TriggerDef.LogMsg("执行天气元素, CreateSpellSkillTrigger(), skillId: {0}, camp: {1}, count: {2}, interval: {3}", skillId, camp, count, interval);
                for (var i = 0; i < count; i++) {
                    var pos = TriggerAction.GetCurMapRandomPos(0.2, 0.8, 0.2, 0.8);
                    yield TriggerAction.Wait(acInfo, interval);
                    if (!TriggerAction.IsFightOver()) {
                        TriggerAction.SpellToPos(casterId, skillId, pos);
                    }
                }
                return acInfo.RunOnEnd();
            }
        );
        return triggerId;
    };

    // 创建一个天气触发器 // args: {startTime, loopTime, loopCount, weathers:{{weatherEntityTriggerId, args, percentCount}[]}}
    TriggerAction.CreateWeatherTrigger = function (triggerIdList) {
        var triggerId = TriggerGroup.AddTriggerExtend(triggerIdList,
            null,
            function* (acInfo, args) {
                var startTime = args[0];
                var loopTime = args[1];
                var loopCount = args[2];
                var weathers = args[3];
                var percentCounts = [];

                for (var i = 0; i < weathers.length; i++) {
                    percentCounts.push(weathers[i][2]);
                }
                yield TriggerAction.Wait(acInfo, startTime);
                for (var i = 0; i < loopCount; i++) {
                    var randomIndex = TriggerDef.Math.GetRandomIndex(percentCounts);
                    var weatherInfo = weathers[randomIndex];
                    var weatherEntityTriggerId = weatherInfo[0];
                    var weatherArgs = weatherInfo[1];
                    TriggerDef.LogMsg("执行天气, CreateWeatherTrigger(), randomIndex: {0}, weatherEntityTriggerId: {1}", randomIndex, weatherEntityTriggerId);
                    TriggerGroup.RunTrigger(weatherEntityTriggerId, weatherArgs);
                    yield TriggerAction.Wait(acInfo, loopTime);
                }
                return acInfo.RunOnEnd();
            }
        );
        return triggerId;
    };

    var m_weatherEntityTriggers = {
        "CreateSpellSkillTrigger": TriggerAction.CreateSpellSkillTrigger
    };
    var m_weatherEntityArgsFilters = {
        "CreateSpellSkillTrigger": function (arg0, arg1, arg2, arg3) {
            return [parseInt(arg0), parseInt(arg1), parseInt(arg2), parseFloat(arg3)];
        }
    };
    // 根据 className 获取对应 trigger 的创建函数
    var CheckWeatherEntityTrigger = function (triggerIdList, weatherEntityTriggerIds, className) {
        if (TriggerDef.StringIsEmpty(className)) {
            return 0;
        }
        if (null == weatherEntityTriggerIds[className]) {
            var fun = m_weatherEntityTriggers[className];

            if (null == fun) {
                weatherEntityTriggerIds[className] = 0;
                return 0;
            }
            var triggerId = fun(triggerIdList);
            weatherEntityTriggerIds[className] = triggerId;
            if (0 == triggerId) {
                TriggerDef.WarnMsg("error, CheckWeatherEntityTrigger(), triggerId is 0, className: {0}", className)
            }
            return triggerId;
        }
        return weatherEntityTriggerIds[className];
    };
    // 根据 className 获取对应 trigger 的参数
    var GetWeatherEntityArgs = function (className, arg0, arg1, arg2, arg3, arg4) {
        if (TriggerDef.StringIsEmpty(className)) {
            return [];
        }
        var filter = m_weatherEntityArgsFilters[className];

        if (null == filter) {
            return [];
        }
        return filter(arg0, arg1, arg2, arg3, arg4);
    };
    // 根据天气 id 运行天气，返回停止天气的回调
    TriggerAction.RunWeatherTriggerFromIds = function (triggerIdList, weatherIds) {
        if (null == weatherIds) {
            return
        }
        var triggerIds = [];
        var weatherEntityTriggerIds = {};

        for (var k in weatherIds) {
            var config = TriggerAction.GetWeatherConfig(weatherIds[k]);
            var startTime = config["startTime"];
            var loopTime = config["loopTime"];
            var loopCount = config["loopCount"];
            var tableDataWeathers = config["weathers"];
            // {weatherEntityTriggerId, args, percentCount}[]
            var weathers = [];

            for (var index in tableDataWeathers) {
                var weatherEntityInfo = tableDataWeathers[index];
                var weatherEntityId = weatherEntityInfo[0];
                var percentCount = weatherEntityInfo[1];
                var weatherEntityConfig = TriggerAction.GetWeatherEntityConfig(weatherEntityId);
                var className = weatherEntityConfig["className"];
                var weatherEntityTriggerId = CheckWeatherEntityTrigger(triggerIdList, weatherEntityTriggerIds, className);
                var args = GetWeatherEntityArgs(className, weatherEntityConfig["arg0"], weatherEntityConfig["arg1"], weatherEntityConfig["arg2"], weatherEntityConfig["arg3"], weatherEntityConfig["arg4"]);
                weathers.push([weatherEntityTriggerId, args, percentCount]);
            }
            var weatherTriggerId = TriggerAction.CreateWeatherTrigger(triggerIdList);
            triggerIds.push(weatherTriggerId);
            // args: {startTime, loopTime, loopCount, weathers:{{weatherEntityTriggerId, args, percentCount}[]}}
            TriggerGroup.RunTrigger(weatherTriggerId, [startTime, loopTime, loopCount, weathers]);
        }
        return function () {
            for (var k in triggerIds) {
                TriggerGroup.CloseTrigger(triggerIds[k]);
            }
        }
    };
})();
// endregion 扩展动作
