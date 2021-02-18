/**
 * Created by 34891 on 2021/2/17.
 */

var ClassHelper = ClassHelper || {};

// 目前的 jscomp 会认为 ... 这样的语法是错的, 先放在外部吧
ClassHelper.NewClass = function (componentClass) {
    var oArgs = Array.prototype.slice.call(arguments, 1);
    return new componentClass(...oArgs);
};
